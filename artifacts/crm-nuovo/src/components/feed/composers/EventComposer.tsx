import React, { useState } from 'react';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Users,
  Clock,
  Plus,
  Paperclip
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { supabaseFeedService } from '@/services/supabaseFeedService';
import { toast } from 'sonner';

interface EventComposerProps {
  onCancel: () => void;
}

export const EventComposer: React.FC<EventComposerProps> = ({ onCancel }) => {
  const { profile, tenant } = useAuth();
  const [title, setTitle] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSend = async () => {
    if (!title.trim() || !tenant || !profile) return;
    
    setIsSubmitting(true);
    try {
      await supabaseFeedService.createPost({
        author_id: profile.uid,
        type: 'event',
        content: title,
        content_html: contentHtml,
        targets: ['all'],
        event: {
          title,
          start_date: startDate,
          end_date: startDate, // Placeholder
          location
        },
        reactions: [],
        comments_count: 0,
        is_pinned: false
      });
      toast.success('Evento creato con successo');
      onCancel();
    } catch (error) {
      toast.error('Errore durante la creazione dell\'evento');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col bg-slate-50/10">
      <div className="p-5 space-y-4">
        <div className="flex flex-col gap-1.5">
          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Titolo Evento</Label>
          <Input 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nome dell'evento..."
            className="border-none bg-white shadow-sm font-bold text-slate-700 placeholder:text-slate-300 h-10 rounded-md"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data e Ora</Label>
            <div className="relative group">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <Input 
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="pl-9 border-none bg-white shadow-sm h-10 rounded-md text-sm"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Luogo</Label>
            <div className="relative group">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <Input 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Dove si terra?"
                className="pl-9 border-none bg-white shadow-sm h-10 rounded-md text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descrizione</Label>
          <div className="bg-white rounded-md border border-slate-100 p-3 shadow-sm min-h-[100px]">
            <RichTextEditor 
              content={contentHtml} 
              onChange={setContentHtml} 
              placeholder="Dettagli dell'evento..."
              className="text-sm"
            />
          </div>
        </div>

        <button className="text-blue-500 hover:text-blue-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 w-fit">
          <Users size={12} /> Seleziona Partecipanti
        </button>
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
            {isSubmitting ? 'CREAZIONE...' : 'CREA EVENTO'}
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
