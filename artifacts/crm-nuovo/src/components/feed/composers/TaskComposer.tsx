import React, { useState } from 'react';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Calendar as CalendarIcon, 
  User, 
  CheckSquare, 
  Flag,
  Plus,
  Paperclip
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { supabaseFeedService } from '@/services/supabaseFeedService';
import { toast } from 'sonner';

interface TaskComposerProps {
  onCancel: () => void;
}

export const TaskComposer: React.FC<TaskComposerProps> = ({ onCancel }) => {
  const { profile, tenant } = useAuth();
  const [title, setTitle] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [responsible, setResponsible] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSend = async () => {
    if (!title.trim() || !tenant || !profile) return;
    
    setIsSubmitting(true);
    try {
      await supabaseFeedService.createPost({
        author_id: profile.uid,
        type: 'task',
        content: title,
        content_html: contentHtml,
        targets: ['all'],
        task: {
          title,
          responsible_id: responsible || profile.uid,
          priority,
          due_date: dueDate
        },
        reactions: [],
        comments_count: 0,
        is_pinned: false
      });
      toast.success('Incarico creato con successo');
      onCancel();
    } catch (error) {
      toast.error('Errore durante la creazione dell\'incarico');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col bg-slate-50/10">
      <div className="p-5 space-y-4">
        <div className="flex flex-col gap-1.5">
          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Titolo Incarico</Label>
          <Input 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Cosa deve essere fatto?"
            className="border-none bg-white shadow-sm font-bold text-slate-700 placeholder:text-slate-300 h-10 rounded-md"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descrizione</Label>
          <div className="bg-white rounded-md border border-slate-100 p-3 shadow-sm min-h-[100px]">
            <RichTextEditor 
              content={contentHtml} 
              onChange={setContentHtml} 
              placeholder="Aggiungi dettagli..."
              className="text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Responsabile</Label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <Input 
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
                placeholder="Seleziona utente..."
                className="pl-9 border-none bg-white shadow-sm h-10 rounded-md text-sm"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Scadenza</Label>
            <div className="relative group">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <Input 
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="pl-9 border-none bg-white shadow-sm h-10 rounded-md text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 pt-2">
          <div className="flex items-center gap-2">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Priorità:</Label>
            <div className="flex gap-1.5">
              {(['low', 'medium', 'high'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={cn(
                    "w-6 h-6 rounded flex items-center justify-center transition-all",
                    priority === p 
                      ? (p === 'high' ? "bg-red-500 text-white" : p === 'medium' ? "bg-yellow-500 text-white" : "bg-slate-500 text-white")
                      : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                  )}
                >
                  <Flag size={12} />
                </button>
              ))}
            </div>
          </div>
          <button className="text-blue-500 hover:text-blue-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
            <CheckSquare size={12} /> Checklist
          </button>
          <button className="text-blue-500 hover:text-blue-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
            <Plus size={12} /> Collegamento CRM
          </button>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-1">
           <button className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-slate-50 rounded transition-all">
            <Paperclip size={16} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            disabled={isSubmitting}
            onClick={handleSend}
            className="bg-[#2FC6F6] hover:bg-[#1eb0e0] text-white font-bold px-6 h-9 rounded text-xs uppercase tracking-widest"
          >
            {isSubmitting ? 'CREAZIONE...' : 'CREA INCARICO'}
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
