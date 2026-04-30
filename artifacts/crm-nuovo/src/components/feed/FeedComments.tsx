import React, { useState, useEffect } from 'react';
import { FeedPost, FeedComment } from '@/types/feed';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Send, Trash2, Reply, Smile } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabaseFeedService } from '@/services/supabaseFeedService';
import { toast } from 'sonner';

interface FeedCommentsProps {
  post: FeedPost;
}

export const FeedComments: React.FC<FeedCommentsProps> = ({ post }) => {
  const { profile } = useAuth();
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // In a real app, subscribe to comments for this post
  // For now we'll mock the list or fetch once
  useEffect(() => {
    // Mock fetch or actual fetch logic
  }, [post.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !profile) return;

    setIsSubmitting(true);
    try {
      await supabaseFeedService.addComment({
        post_id: post.id,
        author_id: profile.uid,
        author_name: profile.displayName,
        author_photo: profile.photoURL,
        content: newComment,
      });
      setNewComment('');
      toast.success('Commento aggiunto');
    } catch (error) {
      toast.error('Errore durante l\'invio');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50/30 p-4 lg:p-6 space-y-6">
      {/* Comments List Area */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3 group">
            <Avatar className="h-8 w-8 rounded-md shrink-0">
              <AvatarImage src={comment.author_photo} />
              <AvatarFallback className="rounded-md text-[10px]">{comment.author_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-blue-600 text-xs hover:underline cursor-pointer">
                  {comment.author_name}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: it })}
                </span>
              </div>
              <p className="text-slate-700 text-sm mt-1 leading-relaxed">
                {comment.content}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">
                  Mi piace
                </button>
                <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors flex items-center gap-1">
                  Rispondi
                </button>
                {profile?.uid === comment.author_id && (
                  <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors">
                    Elimina
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Write Comment Form */}
      <form onSubmit={handleSubmit} className="flex items-start gap-3">
        <Avatar className="h-8 w-8 rounded-md shrink-0">
          <AvatarImage src={profile?.photoURL} />
          <AvatarFallback className="rounded-md text-[10px]">{profile?.displayName?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 relative">
          <textarea 
            placeholder="Scrivi un commento..." 
            className="w-full bg-white border border-slate-200 rounded-md p-3 text-sm focus:outline-none focus:border-blue-300 min-h-[40px] resize-none"
            rows={1}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <button type="button" className="text-slate-400 hover:text-blue-500 transition-colors">
                <Smile size={16} />
              </button>
              <button type="button" className="text-slate-400 hover:text-blue-500 transition-colors text-xs font-bold">
                 Allega
              </button>
            </div>
            <button 
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="text-blue-500 hover:text-blue-600 text-xs font-black uppercase tracking-widest disabled:opacity-30"
            >
              INVIA
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
