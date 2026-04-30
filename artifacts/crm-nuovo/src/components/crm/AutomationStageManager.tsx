import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Plus, 
  X, 
  Trash2, 
  Edit3, 
  ChevronRight, 
  Power, 
  PowerOff,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CRMStage, CRMAutomation, CRMStructure } from '@/types/crm';
import { supabaseCRMService } from '@/services/supabaseCRMService';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AutomationBuilder } from './AutomationBuilder';

interface AutomationStageManagerProps {
  pipeline: CRMStructure;
  stage: CRMStage;
  allStages: CRMStage[];
  onClose: () => void;
}

export const AutomationStageManager: React.FC<AutomationStageManagerProps> = ({ pipeline, stage, allStages, onClose }) => {
  const [automations, setAutomations] = useState<CRMAutomation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingAutomation, setEditingAutomation] = useState<CRMAutomation | null | 'new'>(null);

  const fetchAutomations = async () => {
    setIsLoading(true);
    try {
      const data = await supabaseCRMService.getAutomations(pipeline.id, stage.id);
      setAutomations(data);
    } catch (e) {
      toast.error('Errore nel caricamento automazioni');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAutomations();
  }, [pipeline.id, stage.id]);

  const toggleStatus = async (auto: CRMAutomation) => {
    try {
      await supabaseCRMService.saveAutomation({
        ...auto,
        is_active: !auto.is_active
      });
      fetchAutomations();
      toast.success(auto.is_active ? 'Automazione disattivata' : 'Automazione attivata');
    } catch (e) {
      toast.error('Errore durante l\'aggiornamento');
    }
  };

  const deleteAutomation = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa automazione?')) return;
    try {
      await supabaseCRMService.deleteAutomation(id);
      fetchAutomations();
      toast.success('Automazione eliminata');
    } catch (e) {
      toast.error('Errore durante l\'eliminazione');
    }
  };

  if (editingAutomation) {
    return (
      <AutomationBuilder 
        pipeline={pipeline}
        stages={allStages}
        automation={editingAutomation === 'new' ? undefined : editingAutomation}
        onClose={() => setEditingAutomation(null)}
        onSave={() => fetchAutomations()}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-2xl h-[70vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-slate-200"
      >
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-100">
              <Zap size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Automazioni Workflow</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stage: <span className="text-blue-600">{stage.name}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-4">
          <div className="flex items-center justify-between mb-2">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Automazioni attive ({automations.length})</h3>
             <Button 
              onClick={() => setEditingAutomation('new')}
              className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest gap-2"
             >
               <Plus size={14} /> Crea Automazione
             </Button>
          </div>

          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-blue-500" size={32} />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Caricamento...</p>
            </div>
          ) : automations.length > 0 ? (
            <div className="space-y-3">
              {automations.map(auto => (
                <div 
                  key={auto.id}
                  className="group relative bg-white border border-slate-100 rounded-3xl p-5 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${auto.is_active ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                        <Zap size={20} fill={auto.is_active ? "currentColor" : "none"} />
                     </div>
                     <div>
                       <h4 className="text-sm font-bold text-slate-800">{auto.name}</h4>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                         Trigger: {auto.trigger.type.replace('_', ' ')} • {auto.actions.length} Azioni
                       </p>
                     </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => toggleStatus(auto)}
                      className={`p-2 rounded-xl transition-colors ${auto.is_active ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-300 hover:bg-slate-100'}`}
                      title={auto.is_active ? 'Disattiva' : 'Attiva'}
                    >
                      {auto.is_active ? <Power size={18} /> : <PowerOff size={18} />}
                    </button>
                    <button 
                      onClick={() => setEditingAutomation(auto)}
                      className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                      title="Modifica"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={() => deleteAutomation(auto.id)}
                      className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Elimina"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
               <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4 border border-slate-100 shadow-sm">
                  <Zap size={24} />
               </div>
               <h4 className="text-sm font-black text-slate-700 uppercase">Nessuna Automazione</h4>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 max-w-[200px] mx-auto">Crea un workflow per automatizzare i task manuali.</p>
            </div>
          )}
        </div>

        <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/30 flex items-center justify-center">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full">
              <AlertCircle size={14} className="text-blue-500" />
              <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Le automazioni vengono eseguite istantaneamente al trigger.</p>
            </div>
        </div>
      </motion.div>
    </div>
  );
};
