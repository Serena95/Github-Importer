import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabaseFeedService } from '@/services/supabaseFeedService';
import { FeedPost as FeedPostType } from '@/types/feed';
import { FeedPost } from './FeedPost';
import { useFeedStore } from '@/stores/feedStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Search, Filter, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const FeedList: React.FC<{ entityType?: string, entityId?: string }> = ({ entityType, entityId }) => {
  const { tenant } = useAuth();
  const { posts, setPosts, activeFilter, isPinnedOnly } = useFeedStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!tenant) return;

    setIsLoading(true);
    const unsub = supabaseFeedService.subscribeToPosts((data) => {
      setPosts(data as any);
      setIsLoading(false);
    });

    return () => {
      if (typeof unsub === 'function') {
        unsub();
      }
    };
  }, [tenant]);

  const filteredPosts = posts.filter(post => {
    if (isPinnedOnly) return post.isPinned;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-10 w-10 text-brand-blue animate-spin opacity-20" />
        <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Caricamento Feed...</span>
      </div>
    );
  }

  if (filteredPosts.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-20 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
          <Layers size={32} />
        </div>
        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Nessun post trovato</h3>
        <p className="text-slate-500 text-sm max-w-sm mt-2">
          Non ci sono ancora aggiornamenti partecipa alla discussione creando il tuo primo post!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <AnimatePresence mode="popLayout">
        {filteredPosts.map((post) => (
          <FeedPost key={post.id} post={post as any} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default FeedList;
