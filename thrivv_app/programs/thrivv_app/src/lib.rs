// programs/thrivv/src/lib.rs
//
// THRIVV — Solana Anchor program
// Aligned with THRIVV_BUILD_GUIDE.md v4.1
// Find your tribe. Thrivv.
//
// Note: this file has NOT changed since the spec was at v3.0 (sponsor-pool model).
// The build guide moved to v3.1 → v4.0 → v4.1, but those changes were all
// client-side (mobile stack, auth flow, avatar handling, leaderboard architecture).
// The on-chain schema and instructions remain stable — that's by design.
//
// AFTER PASTING:
//   1. `anchor build` to compile and generate program ID
//   2. `anchor keys sync` to update declare_id! with the real key
//   3. `anchor build` again with the synced ID
//   4. `anchor test` to scaffold tests
//
// Spec: see THRIVV_BUILD_GUIDE.md sections 4, 5, 5.5, and 7.

use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

declare_id!("597aTzYSSdPvW4Mh6bArp8sC3f2KQz2Jobbn84ebFKYw");

// ============================================================
// CONSTANTS (locked in build guide section 4)
// ============================================================
pub const TEAM_SIZE: usize = 3;
pub const INVITE_CODE_LEN: usize = 6;
pub const DEFAULT_TARGET_HOURS: u8 = 7;
pub const TARGET_HOURS_TENTHS: u16 = 70;                // 7.0
pub const HOURS_CAP_TENTHS: u16 = 90;                   // 9.0 cap for ZZZ calc
pub const TARGET_BONUS_TENTHS: u16 = 10;                // +1.0 ZZZ
pub const TRIBE_MULTIPLIER: u16 = 3;
pub const MAX_INTERRUPTION_SECONDS: u32 = 600;          // 10 minutes
pub const INTERRUPTION_PENALTY_MULTIPLIER: u32 = 2;     // 2x deduction

// Streak bonuses (in tenths)
pub const STREAK_3_BONUS_TENTHS: u32 = 100;             // +10 ZZZs
pub const STREAK_5_BONUS_TENTHS: u32 = 250;             // +25 ZZZs
pub const SOLO_STREAK_3_BONUS_TENTHS: u32 = 50;         // +5 ZZZs
pub const SOLO_STREAK_7_BONUS_TENTHS: u32 = 150;        // +15 ZZZs

// Stake (default — can be moved into a config account in v2)
pub const FIXED_WEEKLY_STAKE_LAMPORTS: u64 = 100_000_000; // 0.1 SOL on devnet

// Pool distribution (basis points: 5000 = 50%)
pub const POOL_FIRST_BPS: u64 = 5000;
pub const POOL_SECOND_BPS: u64 = 3000;
pub const POOL_THIRD_BPS: u64 = 2000;
pub const BPS_DENOM: u64 = 10_000;

// ============================================================
// PROGRAM
// ============================================================
#[program]
pub mod thrivv_app {
    use super::*;

    /// Caller becomes first member of a new tribe.
    pub fn create_team(
        ctx: Context<CreateTeam>,
        invite_code: [u8; INVITE_CODE_LEN],
        target_bedtime_local_minutes: u16,
    ) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;

        let team = &mut ctx.accounts.team;
        team.creator = ctx.accounts.creator.key();
        team.members = [Pubkey::default(); TEAM_SIZE];
        team.members[0] = ctx.accounts.creator.key();
        team.member_count = 1;
        team.target_hours = DEFAULT_TARGET_HOURS;
        team.current_tribe_streak = 0;
        team.tribe_lifetime_zzzs_tenths = 0;
        team.current_week_zzzs_tenths = 0;
        team.current_month_zzzs_tenths = 0;
        team.week_start_timestamp = now;
        team.invite_code = invite_code;
        team.bump = ctx.bumps.team;

        let user = &mut ctx.accounts.user;
        user.authority = ctx.accounts.creator.key();
        user.current_team = Some(team.key());
        user.target_bedtime_local_minutes = target_bedtime_local_minutes;
        user.lifetime_actual_hours_tenths = 0;
        user.lifetime_zzzs_tenths = 0;
        user.nights_tracked = 0;
        user.current_solo_streak = 0;
        user.joined_at = now;
        user.bump = ctx.bumps.user;

        Ok(())
    }

    /// Second or third member joins via invite code.
    pub fn join_team(
        ctx: Context<JoinTeam>,
        _invite_code: [u8; INVITE_CODE_LEN],
        target_bedtime_local_minutes: u16,
    ) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;
        let team = &mut ctx.accounts.team;

        require!(
            (team.member_count as usize) < TEAM_SIZE,
            ThrivvError::TeamFull
        );

        let slot = team.member_count as usize;
        team.members[slot] = ctx.accounts.joiner.key();
        team.member_count += 1;

        let user = &mut ctx.accounts.user;
        user.authority = ctx.accounts.joiner.key();
        user.current_team = Some(team.key());
        user.target_bedtime_local_minutes = target_bedtime_local_minutes;
        user.lifetime_actual_hours_tenths = 0;
        user.lifetime_zzzs_tenths = 0;
        user.nights_tracked = 0;
        user.current_solo_streak = 0;
        user.joined_at = now;
        user.bump = ctx.bumps.user;

        Ok(())
    }

    /// Update user's target bedtime (minutes since local midnight).
    pub fn set_bedtime(
        ctx: Context<SetBedtime>,
        target_bedtime_local_minutes: u16,
    ) -> Result<()> {
        require!(
            target_bedtime_local_minutes < 1440,
            ThrivvError::InvalidBedtime
        );
        ctx.accounts.user.target_bedtime_local_minutes = target_bedtime_local_minutes;
        Ok(())
    }

    /// User stakes the fixed weekly amount into their personal stake PDA.
    pub fn stake_week(ctx: Context<StakeWeek>, week_number: u32) -> Result<()> {
        let cpi_ctx = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.member.to_account_info(),
                to: ctx.accounts.user_stake.to_account_info(),
            },
        );
        transfer(cpi_ctx, FIXED_WEEKLY_STAKE_LAMPORTS)?;

        let stake = &mut ctx.accounts.user_stake;
        stake.user = ctx.accounts.member.key();
        stake.team = ctx.accounts.team.key();
        stake.week_number = week_number;
        stake.amount_lamports = FIXED_WEEKLY_STAKE_LAMPORTS;
        stake.settled = false;
        stake.bump = ctx.bumps.user_stake;

        Ok(())
    }

    /// User taps "Going to bed". Writes sleep_start.
    pub fn start_night(
        ctx: Context<StartNight>,
        local_date: u32,
        location_hash: Option<[u8; 8]>,
    ) -> Result<()> {
        let night = &mut ctx.accounts.night;
        night.user = ctx.accounts.authority.key();
        night.local_date = local_date;
        night.sleep_start_unix = Clock::get()?.unix_timestamp;
        night.sleep_end_unix = 0;
        night.interruption_seconds = 0;
        night.actual_hours_tenths = 0;
        night.zzzs_awarded_tenths = 0;
        night.tribe_multiplier_applied = false;
        night.location_hash = location_hash;
        night.verified = false;
        night.bump = ctx.bumps.night;
        Ok(())
    }

    /// User wakes, taps "Confirm". MUST BE SIGNED VIA SEED VAULT.
    /// This is the demo moment.
    /// Computes solo ZZZs (without tribe multiplier — that's applied later by apply_tribe_bonus).
    pub fn submit_night(
        ctx: Context<SubmitNight>,
        end_time: i64,
        interruption_seconds: u32,
    ) -> Result<()> {
        let night = &mut ctx.accounts.night;

        require!(!night.verified, ThrivvError::AlreadyVerified);
        require!(
            end_time > night.sleep_start_unix,
            ThrivvError::InvalidEndTime
        );
        require!(
            interruption_seconds <= MAX_INTERRUPTION_SECONDS,
            ThrivvError::InterruptionTooLong
        );

        // Compute actual hours after 2x interruption penalty.
        let total_seconds = (end_time - night.sleep_start_unix) as u32;
        let penalty_seconds =
            interruption_seconds.saturating_mul(INTERRUPTION_PENALTY_MULTIPLIER);
        let credited_seconds = total_seconds.saturating_sub(penalty_seconds);
        let actual_hours_tenths = ((credited_seconds as u64 * 10) / 3600) as u16;

        // ZZZ calc: capped_actual_hours + target_bonus (no tribe mult yet)
        let capped = actual_hours_tenths.min(HOURS_CAP_TENTHS);
        let target_bonus = if actual_hours_tenths >= TARGET_HOURS_TENTHS {
            TARGET_BONUS_TENTHS
        } else {
            0
        };
        let zzzs_tenths = capped.saturating_add(target_bonus);

        night.sleep_end_unix = end_time;
        night.interruption_seconds = interruption_seconds;
        night.actual_hours_tenths = actual_hours_tenths;
        night.zzzs_awarded_tenths = zzzs_tenths;
        night.verified = true;

        // Update user lifetime + solo streak
        let user = &mut ctx.accounts.user;
        user.lifetime_actual_hours_tenths = user
            .lifetime_actual_hours_tenths
            .saturating_add(actual_hours_tenths as u64);
        user.lifetime_zzzs_tenths = user
            .lifetime_zzzs_tenths
            .saturating_add(zzzs_tenths as u64);
        user.nights_tracked = user.nights_tracked.saturating_add(1);

        let hit_target = actual_hours_tenths >= TARGET_HOURS_TENTHS;
        if hit_target {
            user.current_solo_streak = user.current_solo_streak.saturating_add(1);
            // Award solo streak bonuses
            if user.current_solo_streak == 3 {
                user.lifetime_zzzs_tenths = user
                    .lifetime_zzzs_tenths
                    .saturating_add(SOLO_STREAK_3_BONUS_TENTHS as u64);
            } else if user.current_solo_streak == 7 {
                user.lifetime_zzzs_tenths = user
                    .lifetime_zzzs_tenths
                    .saturating_add(SOLO_STREAK_7_BONUS_TENTHS as u64);
            }
        } else {
            user.current_solo_streak = 0;
        }

        Ok(())
    }

    /// Anyone can call once all 3 tribe members have submitted their nights for `local_date`.
    /// Applies the 3x tribe multiplier to each member's night, updates tribe streak,
    /// awards streak bonuses where applicable, updates current_week + current_month tribe ZZZs.
    ///
    /// NOTE for hackathon: pass in all 3 nights as remaining_accounts.
    /// Full implementation is hour 7-8 work — this is the structure.
    pub fn apply_tribe_bonus(
        _ctx: Context<ApplyTribeBonus>,
        _local_date: u32,
    ) -> Result<()> {
        // STUB — implement once core flow is shipping (hour 7-8):
        //
        // 1. Verify all 3 members' NightAttestation accounts are passed in remaining_accounts
        // 2. Verify all 3 are .verified and have .actual_hours_tenths >= TARGET_HOURS_TENTHS
        // 3. For each: multiply zzzs_awarded_tenths by 3, set tribe_multiplier_applied = true
        // 4. Increment team.current_tribe_streak by 1
        // 5. If streak == 3: award STREAK_3_BONUS to each member's lifetime_zzzs
        //    If streak == 5: award STREAK_5_BONUS to each member's lifetime_zzzs
        //    If streak == 7: 2x weekly multiplier (recompute week's ZZZs × 2)
        //                    AND trigger settle_user_stake for each member (return stake)
        // 6. Add tonight's ZZZs to team.current_week_zzzs_tenths and team.current_month_zzzs_tenths
        //
        // If any member missed: increment nothing, set team.current_tribe_streak = 0
        Ok(())
    }

    /// Sponsor (or demo "Sleep Co" wallet) deposits SOL into the weekly prize pool.
    /// Permissionless — anyone can fund.
    pub fn sponsor_deposit_weekly(
        ctx: Context<SponsorDepositWeekly>,
        week_number: u32,
        amount: u64,
    ) -> Result<()> {
        require!(amount > 0, ThrivvError::ZeroAmount);

        let cpi_ctx = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.sponsor.to_account_info(),
                to: ctx.accounts.weekly_pool.to_account_info(),
            },
        );
        transfer(cpi_ctx, amount)?;

        let pool = &mut ctx.accounts.weekly_pool;
        if pool.week_number == 0 && pool.total_lamports == 0 {
            pool.week_number = week_number;
            pool.settled = false;
            pool.bump = ctx.bumps.weekly_pool;
        }
        pool.total_lamports = pool.total_lamports.saturating_add(amount);

        Ok(())
    }

    /// Sponsor (or demo wallet) deposits SOL into the monthly prize pool.
    pub fn sponsor_deposit_monthly(
        ctx: Context<SponsorDepositMonthly>,
        month_number: u32,
        amount: u64,
    ) -> Result<()> {
        require!(amount > 0, ThrivvError::ZeroAmount);

        let cpi_ctx = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.sponsor.to_account_info(),
                to: ctx.accounts.monthly_pool.to_account_info(),
            },
        );
        transfer(cpi_ctx, amount)?;

        let pool = &mut ctx.accounts.monthly_pool;
        if pool.month_number == 0 && pool.total_lamports == 0 {
            pool.month_number = month_number;
            pool.settled = false;
            pool.bump = ctx.bumps.monthly_pool;
        }
        pool.total_lamports = pool.total_lamports.saturating_add(amount);

        Ok(())
    }

    /// Settle a user's weekly stake.
    /// If their tribe hit a 7-day streak this week → return stake to user.
    /// Else → transfer stake to nonprofit wallet.
    /// `tribe_hit_7_streak` is determined off-chain or by reading team.current_tribe_streak >= 7
    /// at week-end (caller passes it; future version reads on-chain).
    ///
    /// STUB for hackathon — wire up after core flow ships (hour 8+).
    pub fn settle_user_stake(
        _ctx: Context<SettleUserStake>,
        _tribe_hit_7_streak: bool,
    ) -> Result<()> {
        // STUB — implement:
        // require!(!stake.settled, AlreadySettled);
        // if tribe_hit_7_streak: transfer stake.amount from stake PDA to user
        // else: transfer stake.amount from stake PDA to nonprofit wallet
        // stake.settled = true
        Ok(())
    }

    /// Distribute weekly sponsor pool 50/30/20 to top 3 tribes by current_week_zzzs_tenths.
    /// Top tribes determined off-chain; passed in as remaining_accounts in rank order.
    /// Eligibility: each receiving tribe must have all 3 members staked (checked off-chain or via a separate eligibility instruction).
    ///
    /// STUB for hackathon.
    pub fn settle_weekly_pool(
        _ctx: Context<SettleWeeklyPool>,
        _week_number: u32,
    ) -> Result<()> {
        // STUB — implement:
        // require!(!pool.settled, AlreadySettled);
        // pool.total * POOL_FIRST_BPS / BPS_DENOM → first place tribe
        // pool.total * POOL_SECOND_BPS / BPS_DENOM → second place
        // pool.total * POOL_THIRD_BPS / BPS_DENOM → third place
        // (Distribution within tribe: split equally among 3 members, or send to team PDA?)
        // pool.settled = true
        Ok(())
    }

    /// Distribute monthly sponsor pool 50/30/20.
    /// STUB for hackathon.
    pub fn settle_monthly_pool(
        _ctx: Context<SettleMonthlyPool>,
        _month_number: u32,
    ) -> Result<()> {
        Ok(())
    }
}

// ============================================================
// ACCOUNTS
// ============================================================

#[account]
#[derive(InitSpace)]
pub struct UserAccount {
    pub authority: Pubkey,
    pub current_team: Option<Pubkey>,
    pub target_bedtime_local_minutes: u16,
    pub lifetime_actual_hours_tenths: u64,
    pub lifetime_zzzs_tenths: u64,
    pub nights_tracked: u32,
    pub current_solo_streak: u32,
    pub joined_at: i64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct TeamAccount {
    pub creator: Pubkey,
    pub members: [Pubkey; TEAM_SIZE],
    pub member_count: u8,
    pub target_hours: u8,
    pub current_tribe_streak: u32,
    pub tribe_lifetime_zzzs_tenths: u64,
    pub current_week_zzzs_tenths: u64,
    pub current_month_zzzs_tenths: u64,
    pub week_start_timestamp: i64,
    pub invite_code: [u8; INVITE_CODE_LEN],
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct NightAttestation {
    pub user: Pubkey,
    pub local_date: u32,
    pub sleep_start_unix: i64,
    pub sleep_end_unix: i64,
    pub interruption_seconds: u32,
    pub actual_hours_tenths: u16,
    pub zzzs_awarded_tenths: u16,
    pub tribe_multiplier_applied: bool,
    pub location_hash: Option<[u8; 8]>,
    pub verified: bool,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct UserStake {
    pub user: Pubkey,
    pub team: Pubkey,
    pub week_number: u32,
    pub amount_lamports: u64,
    pub settled: bool,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct WeeklySponsorPool {
    pub week_number: u32,
    pub total_lamports: u64,
    pub settled: bool,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct MonthlySponsorPool {
    pub month_number: u32,
    pub total_lamports: u64,
    pub settled: bool,
    pub bump: u8,
}

// ============================================================
// CONTEXTS
// ============================================================

#[derive(Accounts)]
#[instruction(invite_code: [u8; INVITE_CODE_LEN])]
pub struct CreateTeam<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        init,
        payer = creator,
        space = 8 + TeamAccount::INIT_SPACE,
        seeds = [b"team", invite_code.as_ref()],
        bump
    )]
    pub team: Account<'info, TeamAccount>,

    #[account(
        init,
        payer = creator,
        space = 8 + UserAccount::INIT_SPACE,
        seeds = [b"user", creator.key().as_ref()],
        bump
    )]
    pub user: Account<'info, UserAccount>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(invite_code: [u8; INVITE_CODE_LEN])]
pub struct JoinTeam<'info> {
    #[account(mut)]
    pub joiner: Signer<'info>,

    #[account(
        mut,
        seeds = [b"team", invite_code.as_ref()],
        bump = team.bump
    )]
    pub team: Account<'info, TeamAccount>,

    #[account(
        init,
        payer = joiner,
        space = 8 + UserAccount::INIT_SPACE,
        seeds = [b"user", joiner.key().as_ref()],
        bump
    )]
    pub user: Account<'info, UserAccount>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SetBedtime<'info> {
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"user", authority.key().as_ref()],
        bump = user.bump,
        constraint = user.authority == authority.key() @ ThrivvError::Unauthorized
    )]
    pub user: Account<'info, UserAccount>,
}

#[derive(Accounts)]
#[instruction(week_number: u32)]
pub struct StakeWeek<'info> {
    #[account(mut)]
    pub member: Signer<'info>,

    #[account(
        seeds = [b"team", team.invite_code.as_ref()],
        bump = team.bump
    )]
    pub team: Account<'info, TeamAccount>,

    #[account(
        init,
        payer = member,
        space = 8 + UserStake::INIT_SPACE,
        seeds = [b"stake", member.key().as_ref(), &week_number.to_le_bytes()],
        bump
    )]
    pub user_stake: Account<'info, UserStake>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(local_date: u32)]
pub struct StartNight<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        seeds = [b"user", authority.key().as_ref()],
        bump = user.bump,
        constraint = user.authority == authority.key() @ ThrivvError::Unauthorized
    )]
    pub user: Account<'info, UserAccount>,

    #[account(
        init,
        payer = authority,
        space = 8 + NightAttestation::INIT_SPACE,
        seeds = [b"night", authority.key().as_ref(), &local_date.to_le_bytes()],
        bump
    )]
    pub night: Account<'info, NightAttestation>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SubmitNight<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"user", authority.key().as_ref()],
        bump = user.bump,
        constraint = user.authority == authority.key() @ ThrivvError::Unauthorized
    )]
    pub user: Account<'info, UserAccount>,

    #[account(
        mut,
        seeds = [b"night", authority.key().as_ref(), &night.local_date.to_le_bytes()],
        bump = night.bump,
        constraint = night.user == authority.key() @ ThrivvError::Unauthorized
    )]
    pub night: Account<'info, NightAttestation>,
}

#[derive(Accounts)]
pub struct ApplyTribeBonus<'info> {
    #[account(mut)]
    pub caller: Signer<'info>,

    #[account(
        mut,
        seeds = [b"team", team.invite_code.as_ref()],
        bump = team.bump
    )]
    pub team: Account<'info, TeamAccount>,
    // remaining_accounts: 3x NightAttestation + 3x UserAccount, in member order
}

#[derive(Accounts)]
#[instruction(week_number: u32)]
pub struct SponsorDepositWeekly<'info> {
    #[account(mut)]
    pub sponsor: Signer<'info>,

    #[account(
        init_if_needed,
        payer = sponsor,
        space = 8 + WeeklySponsorPool::INIT_SPACE,
        seeds = [b"weekly_pool".as_ref(), &week_number.to_le_bytes()],
        bump
    )]
    pub weekly_pool: Account<'info, WeeklySponsorPool>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(month_number: u32)]
pub struct SponsorDepositMonthly<'info> {
    #[account(mut)]
    pub sponsor: Signer<'info>,

    #[account(
        init_if_needed,
        payer = sponsor,
        space = 8 + MonthlySponsorPool::INIT_SPACE,
        seeds = [b"monthly_pool".as_ref(), &month_number.to_le_bytes()],
        bump
    )]
    pub monthly_pool: Account<'info, MonthlySponsorPool>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SettleUserStake<'info> {
    #[account(mut)]
    pub caller: Signer<'info>,

    #[account(
        mut,
        seeds = [b"stake", user_stake.user.as_ref(), &user_stake.week_number.to_le_bytes()],
        bump = user_stake.bump
    )]
    pub user_stake: Account<'info, UserStake>,

    /// CHECK: recipient (user) — validated by stake.user constraint
    #[account(mut, address = user_stake.user)]
    pub user_recipient: AccountInfo<'info>,

    /// CHECK: nonprofit recipient — pubkey hard-coded or stored in config in v2
    #[account(mut)]
    pub nonprofit_recipient: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(week_number: u32)]
pub struct SettleWeeklyPool<'info> {
    #[account(mut)]
    pub caller: Signer<'info>,

    #[account(
        mut,
        seeds = [b"weekly_pool".as_ref(), &week_number.to_le_bytes()],
        bump = weekly_pool.bump
    )]
    pub weekly_pool: Account<'info, WeeklySponsorPool>,
    // remaining_accounts: top 3 team accounts in rank order, plus their member pubkeys for distribution
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(month_number: u32)]
pub struct SettleMonthlyPool<'info> {
    #[account(mut)]
    pub caller: Signer<'info>,

    #[account(
        mut,
        seeds = [b"monthly_pool".as_ref(), &month_number.to_le_bytes()],
        bump = monthly_pool.bump
    )]
    pub monthly_pool: Account<'info, MonthlySponsorPool>,
    pub system_program: Program<'info, System>,
}

// ============================================================
// ERRORS
// ============================================================

#[error_code]
pub enum ThrivvError {
    #[msg("Team is already full (max 3 members)")]
    TeamFull,
    #[msg("Caller is not authorized for this account")]
    Unauthorized,
    #[msg("Night attestation has already been verified")]
    AlreadyVerified,
    #[msg("End time must be after sleep start time")]
    InvalidEndTime,
    #[msg("Interruption duration exceeds maximum allowed (10 minutes)")]
    InterruptionTooLong,
    #[msg("Amount must be greater than zero")]
    ZeroAmount,
    #[msg("User is already on a team")]
    AlreadyOnTeam,
    #[msg("Stake or pool has already been settled")]
    AlreadySettled,
    #[msg("Bedtime must be in range 0..1440 (minutes since midnight)")]
    InvalidBedtime,
}
