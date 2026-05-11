// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add polyfill resolvers and shims
config.resolver.extraNodeModules.crypto = require.resolve('expo-crypto');
config.resolver.extraNodeModules['react-native-passkeys'] = path.resolve(__dirname, 'shims/react-native-passkeys.js');

// Privy-required package export resolution
const resolveRequestWithPackageExports = (context, moduleName, platform) => {
  if (moduleName === 'isows') {
    const ctx = { ...context, unstable_enablePackageExports: false };
    return ctx.resolveRequest(ctx, moduleName, platform);
  }
  if (moduleName.startsWith('zustand')) {
    const ctx = { ...context, unstable_enablePackageExports: false };
    return ctx.resolveRequest(ctx, moduleName, platform);
  }
  if (moduleName === 'jose') {
    const ctx = { ...context, unstable_conditionNames: ['browser'] };
    return ctx.resolveRequest(ctx, moduleName, platform);
  }
  if (moduleName.startsWith('@privy-io/')) {
    const ctx = { ...context, unstable_enablePackageExports: true };
    return ctx.resolveRequest(ctx, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

config.resolver.resolveRequest = resolveRequestWithPackageExports;

module.exports = withNativeWind(config, { input: './global.css' });
