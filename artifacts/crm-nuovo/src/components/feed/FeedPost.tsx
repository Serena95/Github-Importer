import React, { useState } from 'react';
import { FeedPost as FeedPostType } from '@/types/feed';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MoreHorizontal, 
  ThumbsUp, 
  MessageSquare, 
  UserPlus, 
  MoreVertical,
  CheckSquare,
  Calendar,
  BarChart3,
  Clock,
  Pin,
  Paperclip,
  TrendingUp,
  DollarSign,
  User as UserIcon,
  Building,
  Target,
  FileText as FileIcon,
  StickyNote,
  X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabaseFeedService } from '@/services/supabaseFeedService';
import { FeedComments } from './FeedComments';
import { Badge } from '@/components/ui/badge';

interface FeedPostProps {
  post: FeedPostType;
}

export const FeedPost: React.FC<FeedPostProps> = ({ post }) => {
  const { profile } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const isLiked = post.reactions?.some(r => r.user_id === profile?.uid && r.emoji === '👍');

  const handleLike = () => {
    if (!profile) return;
    supabaseFeedService.toggleReaction(post.id, profile.uid, '👍');
  };

  const renderPostContent = () => {
    switch (post.type) {
      case 'task':
        return (
          <div className="bg-slate-50 rounded-lg p-5 border border-slate-100 flex gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
              <CheckSquare size={20} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-800 text-base">{post.task?.title}</h4>
              <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Responsabile:</span>
                  <span className="text-blue-600">Mario Rossi</span>
                </div>
                {post.task?.due_date && (
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} />
                    <span>Scadenza: {new Date(post.task.due_date).toLocaleDateString()}</span>
                  </div>
                )}
                <Badge variant="outline" className={cn(
                  "text-[9px] font-black uppercase",
                  post.task?.priority === 'high' ? "text-red-500 border-red-100 bg-red-50" : "text-slate-500"
                )}>
                  Prio: {post.task?.priority}
                </Badge>
              </div>
              <div className="mt-4 prose prose-sm max-w-none text-slate-600" dangerouslySetInnerHTML={{ __html: post.content_html }} />
            </div>
          </div>
        );
      case 'event':
        return (
          <div className="bg-amber-50/50 rounded-lg p-5 border border-amber-100 flex gap-4 text-slate-800">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 shrink-0">
              <Calendar size={20} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-base">{post.event?.title}</h4>
              <div className="mt-2 space-y-1 text-sm">
                <p className="flex items-center gap-2">
                  <Clock size={14} className="text-amber-500" />
                  {post.event?.start_date ? new Date(post.event.start_date).toLocaleString() : '--'}
                </p>
                {post.event?.location && (
                  <p className="flex items-center gap-2">
                    <span className="font-bold text-slate-400">Luogo:</span>
                    {post.event.location}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      case 'poll':
        return (
          <div className="bg-white rounded-lg p-5 border border-slate-100 space-y-4">
            <h4 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <BarChart3 size={18} className="text-blue-500" />
              {post.poll?.question}
            </h4>
            <div className="space-y-2">
              {post.poll?.options.map((opt) => (
                <div key={opt.id} className="relative group cursor-pointer">
                  <div className="h-9 w-full bg-slate-50 rounded-md border border-slate-100 overflow-hidden">
                    <div 
                      className="absolute left-0 top-0 bottom-0 bg-blue-100/50 transition-all" 
                      style={{ width: `${opt.votes > 0 ? (opt.votes / (post.poll?.options.reduce((a, b) => a + b.votes, 0) || 1)) * 100 : 0}%` }}
                    />
                    <div className="absolute inset-0 px-4 flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>{opt.text}</span>
                      <span>{opt.votes}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
              {post.poll?.is_anonymous ? 'Sondaggio Anonimo' : 'Sondaggio Pubblico'}
              <span>•</span>
              {post.poll?.options.reduce((a, b) => a + b.votes, 0)} Voti totali
            </div>
          </div>
        );
      case 'crm_activity':
        const crmType = post.metadata?.crm_activity_type;
        const dealTitle = post.metadata?.deal_title;
        const dealId = post.entity_id;
        
        const openDeal = () => {
          if (dealId) {
            window.dispatchEvent(new CustomEvent('crm:openDealGlobal', { 
              detail: { dealId } 
            }));
          }
        };

        const getCrmBg = () => {
          switch (crmType) {
            case 'deal_won': return 'bg-emerald-50 border-emerald-100 hover:bg-emerald-100/50';
            case 'deal_lost': return 'bg-rose-50 border-rose-100 hover:bg-rose-100/50';
            case 'deal_created': return 'bg-blue-50/50 border-blue-100 hover:bg-blue-50';
            default: return 'bg-slate-50/50 border-slate-100 hover:bg-slate-50';
          }
        };

        const getCrmIcon = () => {
          switch (crmType) {
            case 'deal_created': return <DollarSign className="text-blue-500" />;
            case 'deal_won': return <TrendingUp className="text-emerald-600" />;
            case 'deal_lost': return <X size={20} className="text-rose-600" />;
            case 'stage_change': return <Target className="text-blue-500" />;
            case 'comment': return <MessageSquare className="text-slate-500" />;
            case 'task': return <CheckSquare className="text-purple-500" />;
            case 'note': return <StickyNote className="text-amber-500" />;
            case 'file': return <FileIcon className="text-blue-400" />;
            default: return <TrendingUp className="text-slate-400" />;
          }
        };

        return (
          <div className="space-y-3">
             <div className={cn("rounded-2xl p-5 border group/crm cursor-pointer transition-all", getCrmBg())} onClick={openDeal}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover/crm:scale-110 transition-transform">
                    {getCrmIcon()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-black text-slate-800 text-[13px] uppercase tracking-tight flex items-center gap-2">
                        {crmType === 'deal_created' && "Nuovo Affare"}
                        {crmType === 'deal_won' && <span className="text-emerald-600">Affare Vinto 🏆</span>}
                        {crmType === 'deal_lost' && <span className="text-rose-600">Affare Perso ❌</span>}
                        {crmType === 'stage_change' && "Cambio Stage"}
                        {crmType === 'comment' && "Nuovo Commento"}
                        {crmType === 'task' && "Nuovo Task"}
                        {crmType === 'note' && "Nuova Nota"}
                        {crmType === 'file' && "Nuovo Allegato"}
                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                        <span className="text-blue-600 hover:underline">{dealTitle}</span>
                      </h4>
                    </div>
                    <div 
                      className="mt-2 text-sm text-slate-700 font-medium leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: post.content_html || post.content }}
                    />
                    {post.metadata?.new_stage_name && (
                      <div className="mt-3 flex items-center gap-2">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aggiornato a:</span>
                         <Badge variant="secondary" className="bg-white text-blue-600 border-blue-100 font-black text-[10px] px-3 py-0.5">
                           {post.metadata.new_stage_name}
                         </Badge>
                      </div>
                    )}
                  </div>
                </div>
             </div>
          </div>
        );
      default:
        return (
          <div 
            className="text-slate-700 text-[15px] leading-relaxed tiptap-content"
            dangerouslySetInnerHTML={{ __html: post.content_html || post.content }} 
          />
        );
    }
  };

  return (
    <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden mb-6 group transition-all hover:shadow-md">
      {/* Post Header */}
      <div className="p-5 flex items-start justify-between">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10 rounded-md ring-2 ring-white shadow-sm shrink-0">
            <AvatarImage src={post.author_photo} />
            <AvatarFallback className="rounded-md">{post.author_name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-blue-600 hover:underline cursor-pointer text-sm">
                {post.author_name || 'Utente Nexus'}
              </span>
              <span className="text-slate-400 text-sm">per</span>
              <div className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-black text-slate-500 uppercase tracking-widest">
                {post.targets.includes('all') ? 'Tutti i dipendenti' : 'Destinatari specifici'}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-slate-400 font-medium">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: it })}
              </span>
              {post.is_pinned && <Pin size={10} className="text-blue-500 rotate-45" />}
            </div>
          </div>
        </div>
        <button className="text-slate-300 hover:text-slate-500 p-1">
          <MoreVertical size={18} />
        </button>
      </div>

      {/* Post Content */}
      <div className="px-5 pb-4">
        {renderPostContent()}
      </div>

      {/* Attachments */}
      {post.attachments && post.attachments.length > 0 && (
        <div className="px-5 pb-4 flex flex-wrap gap-2">
          {post.attachments.map(file => (
            <div key={file.id} className="bg-slate-50 border border-slate-100 rounded p-2 flex items-center gap-2 text-xs font-bold text-slate-600">
              <Paperclip size={12} className="text-slate-400" />
              {file.name}
              <span className="text-[10px] text-slate-400">({Math.round(file.size / 1024)} KB)</span>
            </div>
          ))}
        </div>
      )}

      {/* Action Bar */}
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/20 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={handleLike}
            className={cn(
              "flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest transition-colors",
              isLiked ? "text-blue-600" : "text-slate-500 hover:text-blue-600"
            )}
          >
            <ThumbsUp size={14} className={isLiked ? "fill-blue-600" : ""} />
            Mi piace
          </button>
          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 text-[11px] font-black uppercase tracking-widest transition-colors"
          >
            <MessageSquare size={14} />
            Commenta
          </button>
          <button className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 text-[11px] font-black uppercase tracking-widest transition-colors">
            <UserPlus size={14} />
            Segui
          </button>
          <button className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 text-[11px] font-black uppercase tracking-widest transition-colors">
             Altro
          </button>
        </div>
        
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400">
          <span>{post.reactions.length} MI PIACE</span>
          <span>•</span>
          <span>{post.comments_count} COMMENTI</span>
        </div>
      </div>

      {/* Inline Comments Area */}
      {showComments && (
        <div className="border-t border-slate-100">
          <FeedComments post={post} />
        </div>
      )}
    </div>
  );
};
