import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  setDoc,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FeedPost, FeedComment, FeedReaction } from '@/types/feed';

export const supabaseFeedService = {
  async createPost(post: Omit<FeedPost, 'id' | 'created_at'>) {
    const docRef = await addDoc(collection(db, 'feed_posts'), {
      ...post,
      created_at: new Date().toISOString()
    });
    
    const snap = await getDoc(docRef);
    return { id: snap.id, ...snap.data() } as FeedPost;
  },

  async updatePost(id: string, updates: Partial<FeedPost>) {
    const docRef = doc(db, 'feed_posts', id);
    await updateDoc(docRef, updates);
    const snap = await getDoc(docRef);
    return { id: snap.id, ...snap.data() } as FeedPost;
  },

  async deletePost(id: string) {
    await deleteDoc(doc(db, 'feed_posts', id));
  },

  async addComment(comment: Omit<FeedComment, 'id' | 'created_at'>) {
    const docRef = await addDoc(collection(db, 'feed_comments'), {
      ...comment,
      created_at: new Date().toISOString()
    });
    
    // Update comment count on post
    const postRef = doc(db, 'feed_posts', comment.post_id);
    await updateDoc(postRef, {
      comments_count: increment(1)
    });

    const snap = await getDoc(docRef);
    return { id: snap.id, ...snap.data() } as FeedComment;
  },

  async deleteComment(id: string) {
    const commentSnap = await getDoc(doc(db, 'feed_comments', id));
    if (commentSnap.exists()) {
      const commentData = commentSnap.data() as FeedComment;
      await deleteDoc(doc(db, 'feed_comments', id));
      
      // Update comment count on post
      const postRef = doc(db, 'feed_posts', commentData.post_id);
      await updateDoc(postRef, {
        comments_count: increment(-1)
      });
    }
  },

  async toggleReaction(postId: string, userId: string, emoji: string) {
    const q = query(
      collection(db, 'feed_reactions'), 
      where('post_id', '==', postId), 
      where('user_id', '==', userId), 
      where('emoji', '==', emoji)
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      await deleteDoc(doc(db, 'feed_reactions', snap.docs[0].id));
    } else {
      await addDoc(collection(db, 'feed_reactions'), { 
        post_id: postId, 
        user_id: userId, 
        emoji,
        created_at: new Date().toISOString()
      });
    }
  },

  subscribeToPosts(callback: (posts: FeedPost[]) => void) {
    const q = query(
      collection(db, 'feed_posts'), 
      orderBy('is_pinned', 'desc'), 
      orderBy('created_at', 'desc')
    );

    return onSnapshot(q, async (snapshot) => {
      const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeedPost));
      
      // Fetch reactions for each post (optimization: real apps might use a more efficient way)
      const postsWithReactions = await Promise.all(posts.map(async (post) => {
        const reactionsQ = query(collection(db, 'feed_reactions'), where('post_id', '==', post.id));
        const reactionsSnap = await getDocs(reactionsQ);
        const reactionsData = reactionsSnap.docs.map(d => ({ id: d.id, ...d.data() } as any)) as FeedReaction[];
        return { ...post, reactions: reactionsData };
      }));

      callback(postsWithReactions as FeedPost[]);
    });
  },

  async getPosts() {
    const q = query(
      collection(db, 'feed_posts'), 
      orderBy('is_pinned', 'desc'), 
      orderBy('created_at', 'desc')
    );
    const snapshot = await getDocs(q);
    const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeedPost));

    const postsWithReactions = await Promise.all(posts.map(async (post) => {
      const reactionsQ = query(collection(db, 'feed_reactions'), where('post_id', '==', post.id));
      const reactionsSnap = await getDocs(reactionsQ);
      const reactionsData = reactionsSnap.docs.map(d => ({ id: d.id, ...d.data() } as any)) as FeedReaction[];
      return { ...post, reactions: reactionsData };
    }));

    return postsWithReactions as FeedPost[];
  },

  async logCRMActivity(params: {
    type: 'deal_created' | 'deal_won' | 'deal_lost' | 'stage_change' | 'comment' | 'task' | 'note' | 'file';
    dealId: string;
    dealTitle: string;
    content: string;
    authorId: string;
    authorName: string;
    authorPhoto?: string;
    metadata?: any;
  }) {
    const post: Omit<FeedPost, 'id' | 'created_at'> = {
      tenant_id: 'default', 
      author_id: params.authorId,
      author_name: params.authorName,
      author_photo: params.authorPhoto,
      content: params.content,
      type: 'crm_activity',
      entity_type: 'deal',
      entity_id: params.dealId,
      targets: ['all'],
      metadata: {
        crm_activity_type: params.type,
        deal_title: params.dealTitle,
        ...params.metadata
      },
      reactions: [],
      comments_count: 0,
      is_pinned: false
    };

    return this.createPost(post);
  }
};

