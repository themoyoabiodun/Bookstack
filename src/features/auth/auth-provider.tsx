import { useEffect, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { adoptLocalDataFor, syncNow } from '@/features/sync/engine';
import { supabase } from '@/lib/supabase';
import { useSessionStore } from './session-store';

/**
 * Restores the saved session, keeps tokens fresh while the app is in the foreground,
 * and syncs on sign-in and whenever the app comes back to the foreground.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (!supabase) {
      useSessionStore.setState({ restored: true });
      return;
    }
    const auth = supabase.auth;

    const onSession = async (userId: string | undefined) => {
      if (!userId) return;
      await adoptLocalDataFor(userId);
      await syncNow();
    };

    auth.getSession().then(({ data }) => {
      useSessionStore.setState({ session: data.session, restored: true });
      void onSession(data.session?.user.id);
    });

    const { data: listener } = auth.onAuthStateChange((event, session) => {
      useSessionStore.setState({ session });
      // Supabase advises against awaiting other auth calls inside this callback.
      if (event === 'SIGNED_IN') setTimeout(() => void onSession(session?.user.id), 0);
    });

    // React Native has no "tab focus" signal, so tell Supabase when to refresh tokens.
    if (AppState.currentState === 'active') auth.startAutoRefresh();
    const appState = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        auth.startAutoRefresh();
        void syncNow();
      } else {
        auth.stopAutoRefresh();
      }
    });

    return () => {
      listener.subscription.unsubscribe();
      appState.remove();
      auth.stopAutoRefresh();
    };
  }, []);

  return children;
}
