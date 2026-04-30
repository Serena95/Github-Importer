import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckSquare, Clock, User, Flag, MessageSquare, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CRMTask, TaskStatus, TaskPriority, CRMDeal } from '@/types/crm';
import { supabaseCRMService } from '@/services/supabaseCRMService';
import { toast } from 'sonner';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (task: CRMTask) => void;
  deals?: CRMDeal[];
  initialData?: Partial<CRMTask>;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  deals = [],
  initialData 
}) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    status: (initialData?.status || 'todo') as TaskStatus,
    priority: (initialData?.priority || 'medium') as TaskPriority,
    due_date: initialData?.due_date || new Date().toISOString().slice(0, 16),
    related_to_id: initialData?.related_to_id || '',
    related_to_type: (initialData?.related_to_type || 'deal') as 'deal' | 'contact' | 'company',
    assigned_to: initialData?.assigned_to || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const priorities: { value: TaskPriority, label: string, color: string }[] = [
    { value: 'low', label: 'Bassa', color: 'bg-slate-400' },
    { value: 'medium', label: 'Media', color: 'bg-blue-500' },
    { value: 'high', label: 'Alta', color: 'bg-amber-500' },
    { value: 'urgent', label: 'Urgente', color: 'bg-rose-500' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const selectedDeal = deals.find(d => d.id === formData.related_to_id);
      const task = await supabaseCRMService.saveTask({
        ...formData,
        related_to_name: selectedDeal?.title || selectedDeal?.contact
      });
      toast.success('Task creato con successo');
      onSuccess(task);
      onClose();
    } catch (error) {
      toast.error('Errore durante la creazione del task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
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
                <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-200">
                  <CheckSquare size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Nuovo Task</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Gestione Attività</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-100">
                <X size={20} />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Titolo Task</label>
                  <Input 
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Es: Call di follow-up post demo"
                    className="border-slate-100 rounded-2xl focus:ring-amber-500/10 h-12 text-sm font-bold shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priorità</label>
                    <select 
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                      className="w-full border border-slate-100 rounded-2xl focus:ring-2 focus:ring-amber-500/10 h-12 text-sm font-bold px-4 outline-none appearance-none bg-slate-50"
                    >
                      {priorities.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Scadenza</label>
                    <Input 
                      type="datetime-local"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      className="border-slate-100 rounded-2xl focus:ring-amber-500/10 h-12 text-sm font-bold shadow-sm"
                    />
                  </div>
                </div>

                {!initialData?.related_to_id && deals.length > 0 && (
                   <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Collega a Affare</label>
                    <select 
                      value={formData.related_to_id}
                      onChange={(e) => setFormData({ ...formData, related_to_id: e.target.value })}
                      className="w-full border border-slate-100 rounded-2xl focus:ring-2 focus:ring-amber-500/10 h-12 text-sm font-bold px-4 outline-none appearance-none bg-slate-50"
                    >
                      <option value="">Nessun collegamento</option>
                      {deals.map(deal => (
                        <option key={deal.id} value={deal.id}>{deal.title} ({deal.contact})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descrizione</label>
                  <Textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Dettagli dell'attività..."
                    className="border-slate-100 rounded-2xl focus:ring-amber-500/10 min-h-[100px] text-sm font-medium resize-none shadow-sm"
                  />
                </div>
              </div>
            </form>

            <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex gap-3">
              <Button type="button" variant="ghost" onClick={onClose} className="flex-1 rounded-2xl h-12 font-bold uppercase tracking-widest text-[10px]">Annulla</Button>
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl h-12 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-amber-100 transition-all"
              >
                {isSubmitting ? 'Salvataggio...' : 'Crea Task'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
