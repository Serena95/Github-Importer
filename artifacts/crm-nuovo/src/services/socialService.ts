import { 
  collection, 
  doc, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp, 
  increment,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SocialPost, SocialUser, SocialComment, SocialPoll, SocialNotification } from '@/types';

class SocialService {
  // --- Users ---
  async getProfile(uid: string): Promise<SocialUser | null> {
    const docRef = doc(db, 'social_users', uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() as SocialUser : null;
  }

  async updateProfile(uid: string, data: Partial<SocialUser>) {
    const docRef = doc(db, 'social_users', uid);
    await updateDoc(docRef, data);
  }

  // --- Posts ---
  async createPost(post: Omit<SocialPost, 'id' | 'createdAt' | 'likesCount' | 'commentsCount'>) {
    const newDoc = doc(collection(db, 'social_posts'));
    const id = newDoc.id;
    await setDoc(newDoc, {
      ...post,
      id,
      likesCount: 0,
      commentsCount: 0,
      createdAt: serverTimestamp(),
      score: 0
    });
    return id;
  }

  async getPosts(filter?: 'algorithmic' | 'chronological' | 'trending') {
    let q = query(collection(db, 'social_posts'), orderBy('createdAt', 'desc'), limit(50));
    
    if (filter === 'trending') {
      q = query(collection(db, 'social_posts'), orderBy('score', 'desc'), limit(50));
    } else if (filter === 'algorithmic') {
      // Basic algorithmic sorting: score + recency
      // In production, this would be a more complex compound query or handled in the engine
      q = query(collection(db, 'social_posts'), orderBy('score', 'desc'), orderBy('createdAt', 'desc'), limit(50));
    }
    
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SocialPost));
  }

  // --- Polls ---
  async createPoll(poll: Omit<SocialPoll, 'id' | 'totalVotes'>) {
    const newDoc = doc(collection(db, 'social_polls'));
    const id = newDoc.id;
    await setDoc(newDoc, {
      ...poll,
      id,
      totalVotes: 0
    });
    return id;
  }

  async votePoll(pollId: string, optionId: string, userId: string) {
    const pollRef = doc(db, 'social_polls', pollId);
    const voteRef = doc(db, 'social_poll_votes', `${pollId}_${userId}`);
    
    // In a real app, use a transaction to ensure atomicity
    await updateDoc(pollRef, {
      totalVotes: increment(1),
      [`options.${optionId}.votes`]: increment(1)
    });
    
    await addDoc(collection(db, 'social_notifications'), {
      recipientId: (await getDoc(pollRef)).data()?.createdBy,
      senderId: userId,
      type: 'poll_vote',
      targetId: pollId,
      createdAt: serverTimestamp(),
      isRead: false
    });
  }

  // --- Comments ---
  async addComment(comment: Omit<SocialComment, 'id' | 'createdAt' | 'likesCount'>) {
    const newDoc = doc(collection(db, 'social_comments'));
    const id = newDoc.id;
    await setDoc(newDoc, {
      ...comment,
      id,
      likesCount: 0,
      createdAt: serverTimestamp()
    });
    
    // Update parent post comment count
    const postRef = doc(db, 'social_posts', comment.postId);
    await updateDoc(postRef, {
      commentsCount: increment(1),
      score: increment(4) // Comment adds more score than like
    });
    
    return id;
  }

  // --- Likes ---
  async toggleLike(postId: string, userId: string, isLiked: boolean) {
    const postRef = doc(db, 'social_posts', postId);
    const likeId = `${postId}_${userId}`;
    const likeRef = doc(db, 'social_likes', likeId);
    
    if (isLiked) {
      await deleteDoc(likeRef);
      await updateDoc(postRef, {
        likesCount: increment(-1),
        score: increment(-3)
      });
    } else {
      await setDoc(likeRef, {
        postId,
        userId,
        createdAt: serverTimestamp()
      });
      await updateDoc(postRef, {
        likesCount: increment(1),
        score: increment(3)
      });
    }
  }

  // --- Following ---
  async followUser(followerId: string, followingId: string) {
    const followId = `${followerId}_${followingId}`;
    await addDoc(collection(db, 'social_followers'), {
      followerId,
      followingId,
      createdAt: serverTimestamp()
    });
    
    // Update counts
    await updateDoc(doc(db, 'social_users', followerId), { followingCount: increment(1) });
    await updateDoc(doc(db, 'social_users', followingId), { followersCount: increment(1) });
  }

  async unfollowUser(followerId: string, followingId: string) {
    // In production, find the doc by compound query or fixed ID
    const q = query(collection(db, 'social_followers'), 
      where('followerId', '==', followerId), 
      where('followingId', '==', followingId)
    );
    const snap = await getDocs(q);
    snap.forEach(async (d) => await deleteDoc(d.ref));
    
    // Update counts
    await updateDoc(doc(db, 'social_users', followerId), { followingCount: increment(-1) });
    await updateDoc(doc(db, 'social_users', followingId), { followersCount: increment(-1) });
  }
}

export const socialService = new SocialService();
