import AsyncStorage from '@react-native-async-storage/async-storage';

const SAVED_EMAIL_KEY = 'login_saved_email';
const REMEMBER_ME_KEY = 'login_remember_me';

export async function getSavedEmail(): Promise<string | null> {
  return AsyncStorage.getItem(SAVED_EMAIL_KEY);
}

export async function setSavedEmail(email: string): Promise<void> {
  await AsyncStorage.setItem(SAVED_EMAIL_KEY, email);
}

export async function clearSavedEmail(): Promise<void> {
  await AsyncStorage.removeItem(SAVED_EMAIL_KEY);
}

export async function getRememberMe(): Promise<boolean> {
  const val = await AsyncStorage.getItem(REMEMBER_ME_KEY);
  // 최초 설치 시 기본값 true
  return val === null ? true : val === 'true';
}

export async function setRememberMe(value: boolean): Promise<void> {
  await AsyncStorage.setItem(REMEMBER_ME_KEY, String(value));
}
