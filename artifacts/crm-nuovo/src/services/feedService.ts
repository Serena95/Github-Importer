import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  increment,
  getDocs,
  limit,
  startAfter,
  DocumentData,
  QueryDocumentSnapshot,
  getDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { FeedPost, FeedComment } from '@/types';

export const feedService = {
  async createPost(tenantId: string, postData: Omit<FeedPost, 'id' | 'createdAt' | 'updatedAt'>) {
    const colRef = collection(db, 'tenants', tenantId, 'feed_posts');
    const docRef = await addDoc(colRef, {
      ...postData,
      likesCount: 0,
      commentsCount: 0,
      reactions: {},
      isPinned: postData.isPinned || false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Send notifications for mentions
    if (postData.mentions && postData.mentions.length > 0) {
      const notifRef = collection(db, 'social_notifications');
      const promises = postData.mentions.map(mentionedUserId => {
        if (mentionedUserId === postData.authorId) return Promise.resolve();
        return addDoc(notifRef, {
          recipientId: mentionedUserId,
          senderId: postData.authorId,
          senderName: postData.authorName,
          type: 'comment', // Reusing matching type from blueprint enum
          targetId: docRef.id,
          isRead: false,
          createdAt: serverTimestamp()
        });
      });
      await Promise.all(promises);
    }

    return docRef;
  },

  async updatePost(tenantId: string, postId: string, updates: Partial<FeedPost>) {
    const postRef = doc(db, 'tenants', tenantId, 'feed_posts', postId);
    return updateDoc(postRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  async deletePost(tenantId: string, postId: string) {
    const postRef = doc(db, 'tenants', tenantId, 'feed_posts', postId);
    return deleteDoc(postRef);
  },

  async addComment(tenantId: string, commentData: Omit<FeedComment, 'id' | 'createdAt'>) {
    const colRef = collection(db, 'tenants', tenantId, 'feed_comments');
    const docRef = await addDoc(colRef, {
      ...commentData,
      createdAt: serverTimestamp()
    });

    // Increment comment count on post
    const postRef = doc(db, 'tenants', tenantId, 'feed_posts', commentData.postId);
    const postSnap = await getDoc(postRef);
    const post = postSnap.data() as FeedPost;

    await updateDoc(postRef, {
      commentsCount: increment(1)
    });

    // Notify post author
    if (post && post.authorId !== commentData.authorId) {
      const notifRef = collection(db, 'social_notifications');
      await addDoc(notifRef, {
        recipientId: post.authorId,
        senderId: commentData.authorId,
        senderName: commentData.authorName,
        type: 'comment',
        targetId: post.id,
        isRead: false,
        createdAt: serverTimestamp()
      });
    }

    return docRef;
  },

  async deleteComment(tenantId: string, postId: string, commentId: string) {
    const commentRef = doc(db, 'tenants', tenantId, 'feed_comments', commentId);
    await deleteDoc(commentRef);

    // Decrement comment count on post
    const postRef = doc(db, 'tenants', tenantId, 'feed_posts', postId);
    await updateDoc(postRef, {
      commentsCount: increment(-1)
    });
  },

  async toggleReaction(tenantId: string, postId: string, userId: string, emoji: string) {
    const postRef = doc(db, 'tenants', tenantId, 'feed_posts', postId);
    const postSnap = await getDoc(postRef);
    if (!postSnap.exists()) return;

    const postData = postSnap.data() as FeedPost;
    const reactions = postData.reactions || {};
    const userReactions = reactions[emoji] || [];

    let newReactions = { ...reactions };
    let likesCount = postData.likesCount || 0;

    if (userReactions.includes(userId)) {
      // Remove reaction
      newReactions[emoji] = userReactions.filter(id => id !== userId);
      if (emoji === '👍') likesCount = Math.max(0, likesCount - 1);
    } else {
      // Add reaction
      newReactions[emoji] = [...userReactions, userId];
      if (emoji === '👍') likesCount += 1;
    }

    return updateDoc(postRef, {
      reactions: newReactions,
      likesCount: likesCount
    });
  },

  async uploadAttachment(tenantId: string, file: File) {
    const storageRef = ref(storage, `tenants/${tenantId}/feed/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return {
      name: file.name,
      url,
      type: file.type,
      size: file.size
    };
  },

  subscribeToFeed(tenantId: string, filters: any, callback: (posts: FeedPost[]) => void) {
    let q = query(
      collection(db, 'tenants', tenantId, 'feed_posts'),
      orderBy('isPinned', 'desc'),
      orderBy('createdAt', 'desc')
    );

    if (filters.type && filters.type !== 'all') {
      q = query(q, where('type', '==', filters.type));
    }
    
    if (filters.entityType && filters.entityId) {
      q = query(q, where('entityType', '==', filters.entityType), where('entityId', '==', filters.entityId));
    }

    return onSnapshot(q, (snap) => {
      const posts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeedPost));
      callback(posts);
    });
  },

  subscribeToComments(tenantId: string, postId: string, callback: (comments: FeedComment[]) => void) {
    const q = query(
      collection(db, 'tenants', tenantId, 'feed_comments'),
      where('postId', '==', postId),
      orderBy('createdAt', 'asc')
    );

    return onSnapshot(q, (snap) => {
      const comments = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeedComment));
      callback(comments);
    });
  }
};
