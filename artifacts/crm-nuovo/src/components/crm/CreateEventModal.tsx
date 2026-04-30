import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Clock, User, FileText, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CRMCalendarEvent, CalendarEventType, CRMDeal } from '@/types/crm';
import { supabaseCRMService } from '@/services/supabaseCRMService';
import { toast } from 'sonner';
import { CRM_USERS } from '@/constants/crm';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (event: CRMCalendarEvent) => void;
  deals: CRMDeal[];
  initialData?: Partial<CRMCalendarEvent>;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  deals,
  initialData 
}) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    type: (initialData?.type || 'meeting') as CalendarEventType,
    deal_id: initialData?.deal_id || '',
    start_date: initialData?.start_date || new Date().toISOString().slice(0, 16),
    end_date: initialData?.end_date || new Date(Date.now() + 3600000).toISOString().slice(0, 16),
    description: initialData?.description || '',
    location: initialData?.location || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const eventTypes: { value: CalendarEventType, label: string, color: string }[] = [
    { value: 'call', label: 'Chiamata', color: 'bg-blue-500' },
    { value: 'meeting', label: 'Meeting', color: 'bg-emerald-500' },
    { value: 'task', label: 'Task', color: 'bg-amber-500' },
    { value: 'followup', label: 'Follow-up', color: 'bg-indigo-500' },
    { value: 'deadline', label: 'Scadenza', color: 'bg-rose-500' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const selectedDeal = deals.find(d => d.id === formData.deal_id);
      const event = await supabaseCRMService.saveCalendarEvent({
        ...formData,
        deal_title: selectedDeal?.title,
        status: 'scheduled'
      });
      toast.success('Evento creato con successo');
      onSuccess(event);
      onClose();
    } catch (error) {
      toast.error('Errore durante la creazione dell\'evento');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-50 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                  <Calendar size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Nuovo Evento</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Calendario CRM</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-100">
                <X size={20} />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Event Type Grid */}
              <div className="grid grid-cols-3 gap-2">
                {eventTypes.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.value })}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all gap-2 ${
                      formData.type === type.value 
                        ? `border-${type.color.split('-')[1]}-500 bg-${type.color.split('-')[1]}-50` 
                        : 'border-slate-50 bg-white hover:border-slate-200'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${type.color}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">{type.label}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Titolo Evento</label>
                  <Input 
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Esempio: Call di approfondimento"
                    className="border-slate-100 rounded-2xl focus:ring-blue-500/10 h-12 text-sm font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Affare Associato</label>
                  <select 
                    value={formData.deal_id}
                    onChange={(e) => setFormData({ ...formData, deal_id: e.target.value })}
                    className="w-full border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/10 h-12 text-sm font-bold px-4 outline-none appearance-none bg-slate-50"
                  >
                    <option value="">Seleziona un affare...</option>
                    {deals.map(deal => (
                      <option key={deal.id} value={deal.id}>{deal.title} - {deal.contact}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Inizio</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <Input 
                        required
                        type="datetime-local"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        className="pl-11 border-slate-100 rounded-2xl focus:ring-blue-500/10 h-12 text-sm font-bold"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fine</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <Input 
                        required
                        type="datetime-local"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        className="pl-11 border-slate-100 rounded-2xl focus:ring-blue-500/10 h-12 text-sm font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Note / Agenda</label>
                  <Textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Cosa verrà discusso durante l'incontro?"
                    className="border-slate-100 rounded-2xl focus:ring-blue-500/10 min-h-[100px] text-sm font-medium resize-none"
                  />
                </div>
              </div>
            </form>

            <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex gap-3">
              <Button type="button" variant="ghost" onClick={onClose} className="flex-1 rounded-2xl h-12 font-bold uppercase tracking-widest text-[10px]">Annulla</Button>
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-12 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-blue-100"
              >
                {isSubmitting ? 'Salvataggio...' : 'Crea Evento'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
