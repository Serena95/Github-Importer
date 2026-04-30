import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  doc, 
  serverTimestamp,
  writeBatch,
  getDocs,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CRMNotification, NotificationType } from '@/types/notifications';

export const notificationService = {
  /**
   * Create a new notification in Firestore
   */
  async createNotification(data: Omit<CRMNotification, 'id' | 'createdAt' | 'read'>) {
    try {
      const docRef = await addDoc(collection(db, 'notifications'), {
        ...data,
        read: false,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  },

  /**
   * Mark a single notification as read
   */
  async markAsRead(notificationId: string) {
    try {
      const docRef = doc(db, 'notifications', notificationId);
      await updateDoc(docRef, { read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string) {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('read', '==', false)
      );
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      
      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { read: true });
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  },

  /**
   * Subscribe to real-time notifications for a user
   */
  subscribeToNotifications(userId: string, callback: (notifications: CRMNotification[]) => void) {
    const q = query(
      collection(db, 'notifications'),
      where('userId', 'in', [userId, 'all']),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    return onSnapshot(q, 
      (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as CRMNotification[];
        callback(notifications);
      },
      (error) => {
        console.error('Firestore subscription error:', error);
      }
    );
  }
};
