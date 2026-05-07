import { ImageSourcePropType } from 'react-native';

const AVATAR_BUNDLE: Record<string, ImageSourcePropType> = {
  anatoly: require('../../assets/avatars/anatoly.png'),
  satoshi: require('../../assets/avatars/satoshi.png'),
  you: require('../../assets/avatars/you.png'),
};

export function getAvatar(name: string): ImageSourcePropType | null {
  return AVATAR_BUNDLE[name.toLowerCase()] ?? null;
}

export { AVATAR_BUNDLE };
