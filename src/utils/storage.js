const STORAGE_PREFIX = 'fincontrol_';

export const storageKeys = {
  TRANSACTIONS: `${STORAGE_PREFIX}transactions`,
  TAGS: `${STORAGE_PREFIX}tags`,
  ACCOUNTS: `${STORAGE_PREFIX}accounts`,
  PAYMENT_METHODS: `${STORAGE_PREFIX}payment_methods`,
  CREDIT_CARDS: `${STORAGE_PREFIX}credit_cards`,
  GOALS: `${STORAGE_PREFIX}goals`,
  USERS: `${STORAGE_PREFIX}users`,
  CURRENT_USER: `${STORAGE_PREFIX}current_user`,
  ALERTS: `${STORAGE_PREFIX}alerts`,
};

export const getFromStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
};

export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
};
