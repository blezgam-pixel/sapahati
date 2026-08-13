export interface UserAccount {
  id: string;
  name: string;
  email: string;
  provider: 'google' | 'apple';
  avatarUrl?: string;
}

const STORAGE_KEY_USER = 'sapahati_logged_in_user';
const STORAGE_PREFIX_CHAT_COUNT = 'sapahati_ai_chat_count_';

type AuthListener = (user: UserAccount | null) => void;
const listeners: Set<AuthListener> = new Set();

export const getLoggedInUser = (): UserAccount | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (!raw) return null;
    return JSON.parse(raw) as UserAccount;
  } catch {
    return null;
  }
};

export const loginUser = (user: UserAccount): void => {
  try {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    notifyListeners(user);
  } catch (err) {
    console.error('Failed to save user account', err);
  }
};

export const logoutUser = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY_USER);
    notifyListeners(null);
  } catch (err) {
    console.error('Failed to logout user', err);
  }
};

export const clearAllLinkedAccounts = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY_USER);
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX_CHAT_COUNT)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    notifyListeners(null);
  } catch (err) {
    console.error('Failed to clear linked accounts', err);
  }
};

export const subscribeUserAccount = (callback: AuthListener): (() => void) => {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
};

const notifyListeners = (user: UserAccount | null) => {
  listeners.forEach((cb) => cb(user));
};

export const getUserAiChatCount = (email: string): number => {
  if (!email) return 0;
  const key = `${STORAGE_PREFIX_CHAT_COUNT}${email.trim().toLowerCase()}`;
  try {
    const val = localStorage.getItem(key);
    return val ? parseInt(val, 10) || 0 : 0;
  } catch {
    return 0;
  }
};

export const incrementUserAiChatCount = (email: string): number => {
  if (!email) return 0;
  const current = getUserAiChatCount(email);
  const next = current + 1;
  const key = `${STORAGE_PREFIX_CHAT_COUNT}${email.trim().toLowerCase()}`;
  try {
    localStorage.setItem(key, next.toString());
  } catch (err) {
    console.error('Failed to update AI chat count', err);
  }
  return next;
};

export const setUserAiChatCount = (email: string, count: number): void => {
  if (!email) return;
  const key = `${STORAGE_PREFIX_CHAT_COUNT}${email.trim().toLowerCase()}`;
  try {
    localStorage.setItem(key, count.toString());
  } catch (err) {
    console.error('Failed to set AI chat count', err);
  }
};
