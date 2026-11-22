import { clearLocalData, pendingChangeCount, syncNow } from '@/features/sync/engine';
import { supabase } from '@/lib/supabase';
import { useSessionStore } from './session-store';

function client() {
  if (!supabase) throw new Error('Sync isn’t configured for this build.');
  return supabase;
}

/** Emails a one-time sign-in code. Creates the account on first use. */
export async function sendSignInCode(email: string) {
  const { error } = await client().auth.signInWithOtp({
    email: email.trim(),
    options: { shouldCreateUser: true },
  });
  if (error) throw error;
}

export async function verifySignInCode(email: string, code: string) {
  const { error } = await client().auth.verifyOtp({
    email: email.trim(),
    token: code.trim(),
    type: 'email',
  });
  if (error) throw error;
}

/**
 * Signs out and clears this device's shelf (it's safe in the cloud).
 * Syncs first; returns the number of changes that couldn't be uploaded so the caller can
 * warn before anything is lost. Pass `force` to sign out anyway.
 */
export async function signOut({ force = false } = {}): Promise<{ unsynced: number }> {
  const auth = client().auth;
  const userId = useSessionStore.getState().session?.user.id ?? null;

  await syncNow();
  const unsynced = await pendingChangeCount();
  if (unsynced > 0 && !force) return { unsynced };

  // Local scope: only this device. Errors (e.g. offline) still end the local session.
  await auth.signOut({ scope: 'local' });
  await clearLocalData(userId);
  return { unsynced: 0 };
}
