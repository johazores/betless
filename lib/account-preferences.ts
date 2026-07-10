'use client';

import type { AccountPreferences } from '@/types/account';
import { defaultAccountPreferences } from '@/types/account';

const STORAGE_PREFIX = 'betless-account-prefs';

export function loadAccountPreferences(userId: string): AccountPreferences {
  if (typeof window === 'undefined') return defaultAccountPreferences;
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}:${userId}`);
    if (!raw) return defaultAccountPreferences;
    return { ...defaultAccountPreferences, ...JSON.parse(raw) as Partial<AccountPreferences> };
  } catch {
    return defaultAccountPreferences;
  }
}

export function saveAccountPreferences(userId: string, prefs: AccountPreferences) {
  window.localStorage.setItem(`${STORAGE_PREFIX}:${userId}`, JSON.stringify(prefs));
}
