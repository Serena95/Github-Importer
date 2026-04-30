import { create } from 'zustand';
import { collection, onSnapshot, Timestamp, Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface PresenceEntry {
  uid: string;
  online: boolean;
  lastSeen?: Timestamp | null;
}

interface PresenceState {
  entries: Record<string, PresenceEntry>;
  isInitialized: boolean;
  unsub?: Unsubscribe;
  init: (tenantId: string) => void;
  cleanup: () => void;
  isOnline: (uid: string) => boolean;
}

const ONLINE_THRESHOLD_MS = 2 * 60 * 1000;

export const usePresenceStore = create<PresenceState>((set, get) => ({
  entries: {},
  isInitialized: false,

  init: (tenantId) => {
    if (get().isInitialized) return;
    const ref = collection(db, 'tenants', tenantId, 'presence');
    const unsub = onSnapshot(
      ref,
      (snap) => {
        const entries: Record<string, PresenceEntry> = {};
        snap.docs.forEach((d) => {
          const data = d.data() as PresenceEntry;
          entries[d.id] = { ...data, uid: d.id };
        });
        set({ entries });
      },
      () => {
        // Silently ignore permission errors
      }
    );
    set({ unsub, isInitialized: true });
  },

  cleanup: () => {
    const { unsub } = get();
    if (unsub) unsub();
    set({ unsub: undefined, isInitialized: false, entries: {} });
  },

  isOnline: (uid) => {
    const entry = get().entries[uid];
    if (!entry) return false;
    if (!entry.online) return false;
    if (!entry.lastSeen) return true;
    const lastMs = entry.lastSeen.toMillis ? entry.lastSeen.toMillis() : 0;
    return Date.now() - lastMs < ONLINE_THRESHOLD_MS;
  },
}));
