import { create } from 'zustand';

type SyncState = {
  status: 'idle' | 'syncing' | 'error';
  lastSyncedAt: Date | null;
  error: string | null;
};

export const useSyncStore = create<SyncState>(() => ({
  status: 'idle',
  lastSyncedAt: null,
  error: null,
}));
