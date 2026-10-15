import { CONSENT_KEY, preferenceRecord } from './policy';

/** Failed persistence must never grant analytics or pretend to be saved. */
export function saveConsent(choice: 'accepted' | 'rejected', storage: Pick<Storage, 'setItem' | 'getItem'>, apply: (choice: 'accepted' | 'rejected') => void): boolean {
  if (choice === 'rejected') apply('rejected');
  try {
    const record = preferenceRecord(choice);
    storage.setItem(CONSENT_KEY, record);
    if (storage.getItem(CONSENT_KEY) !== record) throw new Error('Preference not persisted');
  } catch { apply('rejected'); return false; }
  if (choice === 'accepted') apply('accepted');
  return true;
}
