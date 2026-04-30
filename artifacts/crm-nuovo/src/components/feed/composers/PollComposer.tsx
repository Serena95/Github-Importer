import React, { useState } from 'react';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  BarChart3, 
  Plus, 
  Trash2,
  Lock,
  Clock,
  Paperclip
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { supabaseFeedService } from '@/services/supabaseFeedService';
import { toast } from 'sonner';

interface PollComposerProps {
  onCancel: () => void;
}

export const PollComposer: React.FC<PollComposerProps> = ({ onCancel }) => {
  const { profile, tenant } = useAuth();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addOption = () => setOptions([...options, '']);
  const removeOption = (idx: number) => setOptions(options.filter((_, i) => i !== idx));
  const updateOption = (idx: number, val: string) => {
    const newOptions = [...options];
    newOptions[idx] = val;
    setOptions(newOptions);
  };

  const handleSend = async () => {
    if (!question.trim() || options.filter(o => o.trim()).length < 2 || !tenant || !profile) return;
    
    setIsSubmitting(true);
    try {
      await supabaseFeedService.createPost({
        author_id: profile.uid,
        type: 'poll',
        content: question,
        content_html: question,
        targets: ['all'],
        poll: {
          question,
          options: options.filter(o => o.trim()).map((o, i) => ({ id: `${i}`, text: o, votes: 0 })),
          is_anonymous: isAnonymous
        },
        reactions: [],
        comments_count: 0,
        is_pinned: false
      });
      toast.success('Sondaggio creato con successo');
      onCancel();
    } catch (error) {
      toast.error('Errore durante la creazione del sondaggio');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col bg-slate-50/10">
      <div className="p-5 space-y-4">
        <div className="flex flex-col gap-1.5">
          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Domanda</Label>
          <Input 
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Qual è la tua domanda?"
            className="border-none bg-white shadow-sm font-bold text-slate-700 placeholder:text-slate-300 h-10 rounded-md"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Opzioni</Label>
          <div className="space-y-2">
            {options.map((opt, idx) => (
              <div key={idx} className="flex gap-2">
                <Input 
                  value={opt}
                  onChange={(e) => updateOption(idx, e.target.value)}
                  placeholder={`Opzione ${idx + 1}`}
                  className="border-none bg-white shadow-sm h-9 rounded-md text-sm pr-10"
                />
                {options.length > 2 && (
                  <button 
                    onClick={() => removeOption(idx)}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            <button 
              onClick={addOption}
              className="text-blue-500 hover:text-blue-600 text-xs font-bold flex items-center gap-1 mt-1 ml-1"
            >
              <Plus size={14} /> Aggiungi opzione
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6 pt-2">
          <button 
            onClick={() => setIsAnonymous(!isAnonymous)}
            className={cn(
              "text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors",
              isAnonymous ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <Lock size={12} /> Sondaggio Anonimo
          </button>
          <button className="text-slate-400 hover:text-slate-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
            <Clock size={12} /> Imposta Scadenza
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
            {isSubmitting ? 'CREAZIONE...' : 'CREA SONDAGGIO'}
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
