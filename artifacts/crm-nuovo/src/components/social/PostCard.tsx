import React, { useState } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreHorizontal, 
  CheckCircle2, 
  ExternalLink,
  Volume2,
  VolumeX,
  Play
} from 'lucide-react';
import { SocialPost, SocialPoll } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import PollCard from './PollCard';

interface PostCardProps {
  post: SocialPost;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onSave?: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike, onComment, onShare, onSave }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.();
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave?.();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-slate-100 md:rounded-2xl overflow-hidden mb-4 shadow-sm"
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border-2 border-slate-50">
            <AvatarImage src={post.userPhoto} />
            <AvatarFallback className="bg-brand-blue text-white">{post.username?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-bold text-slate-800 text-sm hover:underline cursor-pointer">{post.username}</span>
              {post.isSponsored && (
                <Badge variant="secondary" className="bg-slate-100 text-[9px] uppercase tracking-widest font-black py-0.5 px-1.5 ml-1">
                  Sponsorizzato
                </Badge>
              )}
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              {post.createdAt ? formatDistanceToNow(post.createdAt.toDate ? post.createdAt.toDate() : post.createdAt, { addSuffix: true, locale: it }) : 'Ora'}
            </span>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-800">
          <MoreHorizontal size={20} />
        </Button>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        {post.content && (
          <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap mb-3">
            {post.content}
          </p>
        )}
      </div>

      {/* Media Rendering */}
      {post.type === 'image' && post.mediaUrls && post.mediaUrls.length > 0 && (
        <div className={cn(
          "grid gap-1 px-1",
          post.mediaUrls.length === 1 ? "grid-cols-1" : post.mediaUrls.length === 2 ? "grid-cols-2" : "grid-cols-2"
        )}>
          {post.mediaUrls.map((url, i) => (
            <div key={i} className="aspect-square relative overflow-hidden bg-slate-50 group">
              <img 
                src={url} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                alt={`Post image ${i}`}
                referrerPolicy="no-referrer"
              />
            </div>
          ))}
        </div>
      )}

      {post.type === 'video' && post.mediaUrls && post.mediaUrls[0] && (
        <div className="aspect-video relative bg-black group cursor-pointer overflow-hidden">
          <video 
            src={post.mediaUrls[0]} 
            className="w-full h-full object-contain"
            muted={isVideoMuted}
            autoPlay
            loop
            playsInline
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button 
              variant="secondary" 
              size="icon" 
              className="rounded-full bg-white/20 backdrop-blur-md border-none text-white hover:bg-white/40"
              onClick={() => setIsVideoMuted(!isVideoMuted)}
            >
              {isVideoMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </Button>
          </div>
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
             <Badge className="bg-black/60 backdrop-blur-md text-white border-none text-[9px] font-black uppercase">Video</Badge>
          </div>
        </div>
      )}

      {post.type === 'poll' && post.pollData && (
        <div className="px-4 pb-4">
          <PollCard poll={post.pollData} />
        </div>
      )}

      {post.type === 'ad' && (
        <div className="px-4 py-8 bg-slate-50 border-y border-slate-100 flex flex-col items-center text-center">
          <Badge className="bg-brand-blue text-white mb-4 uppercase tracking-widest text-[9px] font-black">AdMob Native Ad</Badge>
          <div className="w-full aspect-[16/9] bg-slate-200 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
             <img src="https://picsum.photos/seed/ads/800/450" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
             <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
               <Button className="bg-white text-black font-bold rounded-full">SCOPRI DI PIÙ</Button>
             </div>
          </div>
          <h4 className="font-bold text-slate-800 mb-1 leading-tight">Migliora la tua produttività con Skyline AI</h4>
          <p className="text-xs text-slate-500 mb-4 px-6">La piattaforma All-in-One per gestire team e progetti.</p>
          <Button variant="outline" className="w-full rounded-xl border-slate-200 font-bold text-sm">Visita il sito</Button>
        </div>
      )}

      {/* Footer Actions */}
      <div className="p-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLike}
              className={cn(
                "flex items-center gap-1.5 transition-all active:scale-125",
                isLiked ? "text-rose-500" : "text-slate-500 hover:text-slate-800"
              )}
            >
              <Heart size={22} fill={isLiked ? "currentColor" : "none"} strokeWidth={2} />
              <span className="text-xs font-bold">{post.likesCount + (isLiked ? 1 : 0)}</span>
            </button>
            <button 
              onClick={() => onComment?.()}
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <MessageCircle size={22} strokeWidth={2} />
              <span className="text-xs font-bold">{post.commentsCount}</span>
            </button>
            <button 
              onClick={() => onShare?.()}
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <Share2 size={22} strokeWidth={2} />
            </button>
          </div>
          <button 
            onClick={handleSave}
            className={cn(
              "transition-all active:scale-125 text-slate-500 hover:text-slate-800",
              isSaved && "text-brand-blue"
            )}
          >
            <Bookmark size={22} fill={isSaved ? "currentColor" : "none"} strokeWidth={2} />
          </button>
        </div>

        {/* Recent Interaction info */}
        {post.likesCount > 0 && (
          <p className="text-[11px] text-slate-500">
            Piace a <span className="font-bold text-slate-800">utente_esempio</span> e <span className="font-bold text-slate-800">{post.likesCount} altri</span>
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default PostCard;
