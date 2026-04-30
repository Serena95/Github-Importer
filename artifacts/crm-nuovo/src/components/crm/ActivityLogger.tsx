import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Calendar, 
  Send,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabaseCRMService } from '@/services/supabaseCRMService';
import { toast } from 'sonner';

interface ActivityLoggerProps {
  entityId: string;
  entityType: 'contact' | 'company' | 'deal';
  onActivityAdded: () => void;
}

export const ActivityLogger: React.FC<ActivityLoggerProps> = ({ entityId, entityType, onActivityAdded }) => {
  const [note, setNote] = useState('');
  const [type, setType] = useState<'note' | 'call' | 'email' | 'meeting'>('note');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!note.trim()) return;
    setIsSubmitting(true);
    try {
      await supabaseCRMService.createActivity({
        entity_id: entityId,
        entity_type: entityType,
        type,
        title: type === 'note' ? 'Nuova Nota' : type === 'call' ? 'Chiamata Registrata' : type === 'email' ? 'Email Inviata' : 'Meeting Svolto',
        description: note,
        author_name: 'Serena Serena', // Ideally from auth
      });
      setNote('');
      toast.success('Attività registrata');
      onActivityAdded();
    } catch (error) {
      toast.error('Errore durante il salvataggio');
    } finally {
      setIsSubmitting(false);
    }
  };

  const types = [
    { id: 'note', icon: MessageSquare, label: 'Nota', color: 'text-blue-600 bg-blue-50' },
    { id: 'call', icon: Phone, label: 'Chiamata', color: 'text-emerald-600 bg-emerald-50' },
    { id: 'email', icon: Mail, label: 'Email', color: 'text-amber-600 bg-amber-50' },
    { id: 'meeting', icon: Calendar, label: 'Meeting', color: 'text-indigo-600 bg-indigo-50' },
  ];

  return (
    <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden">
      <div className="flex border-b border-slate-50">
        {types.map((t) => (
          <button
            key={t.id}
            onClick={() => setType(t.id as any)}
            className={cn(
              "flex-1 py-3 flex flex-col items-center gap-1 transition-all border-b-2",
              type === t.id ? "bg-slate-50 border-blue-600" : "hover:bg-slate-50/50 border-transparent"
            )}
          >
            <t.icon size={16} className={cn(type === t.id ? "text-blue-600" : "text-slate-400")} />
            <span className={cn(
              "text-[9px] font-black uppercase tracking-widest",
              type === t.id ? "text-slate-900" : "text-slate-400"
            )}>
              {t.label}
            </span>
          </button>
        ))}
      </div>
      
      <div className="p-4">
        <Textarea 
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={`Scrivi un commento o registra ${type === 'call' ? 'l\'esito della chiamata' : 'una nota'}...`}
          className="min-h-[100px] border-none focus-visible:ring-0 p-0 text-sm font-medium resize-none placeholder:text-slate-300"
        />
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
           <div className="flex gap-2">
             <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300">
               <MoreHorizontal size={16} />
             </Button>
           </div>
           <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || !note.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-9 px-4 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100"
           >
             {isSubmitting ? '...' : (
               <>
                <Send size={14} className="mr-2" /> Pubblica
               </>
             )}
           </Button>
        </div>
      </div>
    </div>
  );
};
