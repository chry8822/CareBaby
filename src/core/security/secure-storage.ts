import * as SecureStore from 'expo-secure-store';

const KEYS = {
  BABY_PROFILE: 'carebaby_profile',
  AUTH_TOKEN: 'carebaby_auth',
  ENCRYPTION_KEY: 'carebaby_enc_key',
} as const;

type SecureKey = (typeof KEYS)[keyof typeof KEYS];

export const secureStorage = {
  async set(key: SecureKey, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  },

  async get(key: SecureKey): Promise<string | null> {
    return SecureStore.getItemAsync(key);
  },

  async remove(key: SecureKey): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  },
};

export { KEYS };
