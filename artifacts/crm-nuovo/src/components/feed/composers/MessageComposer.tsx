import React, { useState } from 'react';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { Button } from '@/components/ui/button';
import { 
  Paperclip, 
  FileText, 
  AtSign, 
  Smile, 
  Video, 
  Tags,
  Plus,
  Users,
  CheckSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { supabaseFeedService } from '@/services/supabaseFeedService';
import { toast } from 'sonner';

interface MessageComposerProps {
  onCancel: () => void;
  onSwitchTab?: (tab: string) => void;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({ onCancel, onSwitchTab }) => {
  const { profile, tenant } = useAuth();
  const [contentHtml, setContentHtml] = useState('');
  const [recipients, setRecipients] = useState<string[]>(['all']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);

  const users = [
    { id: 'user-1', name: 'Marco Rossini' },
    { id: 'user-2', name: 'Laura Bianchi' },
    { id: 'user-3', name: 'Giuseppe Verdi' },
  ];

  const handleMention = (userName: string) => {
    setContentHtml(prev => prev + ` <span class="text-blue-600 font-bold">@${userName}</span> `);
    setShowMentions(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleSend = async () => {
    if (!contentHtml.replace(/<[^>]*>/g, '').trim() || !tenant || !profile) return;
    
    setIsSubmitting(true);
    try {
      await supabaseFeedService.createPost({
        author_id: profile.uid,
        author_name: profile.displayName || 'Utente',
        author_photo: profile.photoURL || undefined,
        type: 'message',
        content: contentHtml.replace(/<[^>]*>/g, ''), // Plain text version
        content_html: contentHtml,
        targets: recipients,
        reactions: [],
        comments_count: 0,
        is_pinned: false,
        attachments: attachments.map(f => ({
          id: Math.random().toString(36),
          name: f.name,
          url: '', // Simulated
          type: f.type,
          size: f.size
        }))
      });
      setContentHtml('');
      setAttachments([]);
      toast.success('Messaggio pubblicato nel feed');
    } catch (error) {
      toast.error('Errore durante la pubblicazione');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col relative">
      {/* Mentions Popover Simulation */}
      {showMentions && (
        <div className="absolute left-4 top-10 z-50 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 p-2 animate-in fade-in zoom-in duration-200">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest p-2 border-b border-slate-50 mb-1">Menziona Utente</p>
           {users.map(u => (
             <button 
              key={u.id}
              onClick={() => handleMention(u.name)}
              className="w-full text-left px-3 py-2 text-xs font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors flex items-center gap-2"
             >
               <div className="w-5 h-5 bg-blue-100 rounded text-blue-600 flex items-center justify-center text-[8px]">{u.name[0]}</div>
               {u.name}
             </button>
           ))}
        </div>
      )}

      {/* Editor Area */}
      <div className="p-4 min-h-[140px]">
        <RichTextEditor 
          content={contentHtml} 
          onChange={setContentHtml} 
          placeholder="Scrivi un messaggio... usa @ per menzionare"
          className="text-sm"
        />
      </div>

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="px-4 py-2 flex flex-wrap gap-2 border-t border-slate-50">
          {attachments.map((file, i) => (
            <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 flex items-center gap-2 text-[10px] font-bold text-slate-500">
              <FileText size={12} className="text-blue-500" />
              {file.name}
              <button onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))} className="hover:text-rose-500">
                <Plus size={12} className="rotate-45" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Recipient Selector (Bitrix Style) */}
      <div className="px-4 py-2 bg-slate-50/50 border-t border-slate-100 flex items-center flex-wrap gap-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">A:</span>
        {recipients.map((r) => (
          <div key={r} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            {r === 'all' ? 'Tutti i dipendenti' : r}
            <button className="hover:text-blue-800" onClick={() => setRecipients(recipients.filter(rec => rec !== r))}>×</button>
          </div>
        ))}
        <button className="text-blue-500 hover:text-blue-600 text-xs font-bold flex items-center gap-1 ml-2">
          <Plus size={12} /> Aggiungi
        </button>
      </div>

      {/* Toolbar & Buttons */}
      <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-1">
          <div className="relative">
            <input 
              type="file" 
              multiple 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={handleFileUpload}
            />
            <button className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-slate-50 rounded transition-all">
              <Paperclip size={16} />
            </button>
          </div>
          <button 
            className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-slate-50 rounded transition-all"
            onClick={() => setShowMentions(!showMentions)}
          >
            <AtSign size={16} />
          </button>
          {[
            { icon: Smile, title: "Emoji" },
            { icon: Video, title: "Registra" },
            { icon: Tags, title: "Tag" },
            { icon: CheckSquare, title: "Crea Incarico", action: () => onSwitchTab?.('task') }
          ].map((item, idx) => (
            <button 
              key={idx} 
              title={item.title}
              onClick={item.action}
              className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-slate-50 rounded transition-all"
            >
              <item.icon size={16} />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button 
            disabled={isSubmitting}
            onClick={handleSend}
            className="bg-[#2FC6F6] hover:bg-[#1eb0e0] text-white font-bold px-6 h-9 rounded text-xs uppercase tracking-widest"
          >
            {isSubmitting ? 'INVIO...' : 'INVIA'}
          </Button>
          <Button 
            variant="ghost" 
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 font-bold px-4 h-9 rounded text-xs uppercase tracking-widest"
          >
            ANNULLA
          </Button>
        </div>
      </div>
    </div>
  );
};
