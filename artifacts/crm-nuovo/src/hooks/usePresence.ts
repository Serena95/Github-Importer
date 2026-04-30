import { useEffect } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

const HEARTBEAT_MS = 60_000;

export function usePresence() {
  const { user, profile } = useAuth();

  useEffect(() => {
    if (!user?.uid || !profile?.tenantId) return;

    const ref = doc(db, 'tenants', profile.tenantId, 'presence', user.uid);

    const ping = (online: boolean) => {
      setDoc(
        ref,
        {
          uid: user.uid,
          online,
          lastSeen: serverTimestamp(),
        },
        { merge: true }
      ).catch(() => {});
    };

    ping(true);
    const interval = setInterval(() => ping(true), HEARTBEAT_MS);

    const handleVisibility = () => ping(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', handleVisibility);

    const handleBeforeUnload = () => ping(false);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      ping(false);
    };
  }, [user?.uid, profile?.tenantId]);
}
