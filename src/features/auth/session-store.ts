import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

type SessionState = {
  session: Session | null;
  /** False until the stored session has been read on launch. */
  restored: boolean;
};

export const useSessionStore = create<SessionState>(() => ({
  session: null,
  restored: false,
}));

export const useSession = () => useSessionStore((s) => s.session);
export const useUser = () => useSessionStore((s) => s.session?.user ?? null);
