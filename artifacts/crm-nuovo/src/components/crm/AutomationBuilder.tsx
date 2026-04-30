import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Settings, 
  Save, 
  Play, 
  Clock, 
  Mail, 
  MessageSquare, 
  CheckCircle2, 
  UserPlus, 
  Webhook, 
  ChevronDown, 
  ChevronLeft,
  GripVertical,
  X,
  Zap,
  ArrowDown,
  Copy,
  Loader2,
  List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  CRMAutomation, 
  CRMAutomationAction, 
  CRMAutomationType, 
  CRMAutomationTriggerType,
  CRMStage,
  CRMStructure
} from '@/types/crm';
import { supabaseCRMService } from '@/services/supabaseCRMService';
import { toast } from 'sonner';
import { motion, AnimatePresence, Reorder } from 'motion/react';

interface AutomationBuilderProps {
  pipeline: CRMStructure;
  stages: CRMStage[];
  automation?: CRMAutomation;
  onClose: () => void;
  onSave: () => void;
}

const TRIGGER_OPTIONS: { type: CRMAutomationTriggerType; label: string; icon: any; description: string }[] = [
  { type: 'stage_changed', label: 'Stage Cambiato', icon: Zap, description: 'Si attiva quando un affare entra in questo stage' },
  { type: 'deal_created', label: 'Nuovo Affare', icon: Plus, description: 'Si attiva alla creazione di un nuovo affare' },
  { type: 'quote_accepted', label: 'Preventivo Accettato', icon: CheckCircle2, description: 'Si attiva quando il cliente accetta un preventivo' },
  { type: 'field_updated', label: 'Campo Aggiornato', icon: Settings, description: 'Si attiva quando un campo specifico viene modificato' },
  { type: 'timer', label: 'Timer', icon: Clock, description: 'Si attiva dopo un periodo di inattività' },
];

const ACTION_OPTIONS: { type: CRMAutomationType; label: string; icon: any; color: string }[] = [
  { type: 'task', label: 'Crea Task', icon: CheckCircle2, color: 'bg-emerald-500 shadow-emerald-200' },
  { type: 'email', label: 'Invia Email', icon: Mail, color: 'bg-blue-500 shadow-blue-200' },
  { type: 'whatsapp', label: 'Invia WhatsApp', icon: MessageSquare, color: 'bg-green-500 shadow-green-200' },
  { type: 'assignee', label: 'Cambia Resp.', icon: UserPlus, color: 'bg-indigo-500 shadow-indigo-200' },
  { type: 'note', label: 'Aggiungi Nota', icon: Settings, color: 'bg-slate-500 shadow-slate-200' },
  { type: 'webhook', label: 'Webhook', icon: Webhook, color: 'bg-rose-500 shadow-rose-200' },
  { type: 'wait', label: 'Attendi Tempo', icon: Clock, color: 'bg-amber-500 shadow-amber-200' },
  { type: 'change_stage', label: 'Sposta Stage', icon: List, color: 'bg-purple-500 shadow-purple-200' },
];

export const AutomationBuilder: React.FC<AutomationBuilderProps> = ({ pipeline, stages, automation, onClose, onSave }) => {
  const [name, setName] = useState(automation?.name || 'Nuova Automazione');
  const [trigger, setTrigger] = useState<{ type: CRMAutomationTriggerType; config: any }>(
    automation?.trigger || { type: 'stage_changed', config: { stage_id: stages[0]?.id } }
  );
  const [actions, setActions] = useState<CRMAutomationAction[]>(automation?.actions || []);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState(automation?.stage_id || stages[0]?.id);
  const [viewMode, setViewMode] = useState<'flow' | 'list'>('flow');

  const addAction = (type: CRMAutomationType) => {
    const newAction: CRMAutomationAction = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      config: {}
    };
    setActions([...actions, newAction]);
  };

  const removeAction = (id: string) => {
    setActions(actions.filter(a => a.id !== id));
  };

  const duplicateAction = (action: CRMAutomationAction) => {
    const duplicated: CRMAutomationAction = {
      ...action,
      id: Math.random().toString(36).substr(2, 9),
      config: { ...action.config }
    };
    const index = actions.findIndex(a => a.id === action.id);
    const newActions = [...actions];
    newActions.splice(index + 1, 0, duplicated);
    setActions(newActions);
  };

  const updateActionConfig = (id: string, config: any) => {
    setActions(actions.map(a => a.id === id ? { ...a, config: { ...a.config, ...config } } : a));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await supabaseCRMService.saveAutomation({
        id: automation?.id,
        pipeline_id: pipeline.id,
        stage_id: selectedStageId,
        name,
        trigger,
        actions,
        is_active: true
      }, pipeline.workspace_id);
      toast.success('Automazione salvata con successo');
      onSave();
      onClose();
    } catch (e) {
      toast.error('Errore durante il salvataggio');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-[#f8fafc]">
      {/* Top Header */}
      <div className="h-20 bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4 sm:gap-6">
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors flex items-center gap-2 group">
            <ChevronLeft size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
            <span className="text-xs font-bold text-slate-400 group-hover:text-blue-600 uppercase tracking-widest hidden sm:inline">Indietro</span>
          </button>
          <div className="hidden sm:block h-8 w-px bg-slate-100" />
          <div className="flex flex-col">
            <input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-base sm:text-lg font-black text-slate-900 bg-transparent border-none focus:ring-0 w-48 sm:w-64 p-0 truncate"
              placeholder="Nome automazione..."
            />
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Pipeline: {pipeline.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden lg:flex bg-slate-100 p-1 rounded-xl">
             <button 
              onClick={() => setViewMode('flow')}
              className={`px-4 h-8 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'flow' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
             >
               Flow
             </button>
             <button 
              onClick={() => setViewMode('list')}
              className={`px-4 h-8 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
             >
               Lista
             </button>
          </div>

          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-2xl h-11 px-4 sm:px-8 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 gap-2"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span className="hidden sm:inline">Salva Workflow</span>
            <span className="sm:hidden">Salva</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar py-8 sm:py-12 px-4 sm:px-6">
        <div className={`max-w-3xl mx-auto flex flex-col items-center ${viewMode === 'list' ? 'items-stretch' : ''}`}>
          
          {/* TRIGGER NODE */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`w-full bg-white border-2 p-6 sm:p-8 relative ${
              viewMode === 'flow' 
              ? 'rounded-[40px] border-blue-500 shadow-2xl shadow-blue-500/5' 
              : 'rounded-3xl border-slate-200 mb-6 shadow-sm'
            }`}
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
              Trigger
            </div>
            
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Zap size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase">Ogni volta che...</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Scegli l'evento scatenante</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {TRIGGER_OPTIONS.map(opt => (
                  <button
                    key={opt.type}
                    onClick={() => setTrigger({ ...trigger, type: opt.type })}
                    className={`p-4 rounded-3xl border-2 transition-all text-left flex flex-col gap-3 group ${
                      trigger.type === opt.type 
                      ? 'border-blue-500 bg-blue-50/50' 
                      : 'border-slate-50 bg-slate-50/50 hover:border-slate-200 hover:bg-white'
                    }`}
                  >
                    <opt.icon size={20} className={trigger.type === opt.type ? 'text-blue-600' : 'text-slate-400'} />
                    <p className={`text-[10px] font-black uppercase tracking-tight ${trigger.type === opt.type ? 'text-blue-600' : 'text-slate-900'}`}>{opt.label}</p>
                  </button>
                ))}
              </div>

              {trigger.type === 'stage_changed' && (
                <div className="p-5 bg-slate-50 rounded-3xl space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Quando l'affare entra in:</label>
                  <select 
                    value={selectedStageId}
                    onChange={(e) => setSelectedStageId(e.target.value)}
                    className="w-full h-11 bg-white rounded-xl border border-slate-100 font-bold text-sm px-4 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                  >
                    {stages.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {trigger.type === 'field_updated' && (
                <div className="p-5 bg-slate-50 rounded-3xl space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Campo da monitorare:</label>
                    <select 
                      value={trigger.config?.field || 'score'}
                      onChange={(e) => setTrigger({ ...trigger, config: { ...trigger.config, field: e.target.value } })}
                      className="w-full h-11 bg-white rounded-xl border border-slate-100 font-bold text-sm px-4 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                    >
                      <option value="score">Lead Score</option>
                      <option value="value">Valore Affare</option>
                      <option value="status">Stato</option>
                    </select>
                  </div>

                  {trigger.config?.field === 'score' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Condizione:</label>
                        <select 
                          value={trigger.config?.condition || 'greater_than'}
                          onChange={(e) => setTrigger({ ...trigger, config: { ...trigger.config, condition: e.target.value } })}
                          className="w-full h-11 bg-white rounded-xl border border-slate-100 font-bold text-sm px-4 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                        >
                          <option value="greater_than">Maggiore di</option>
                          <option value="less_than">Minore di</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Threshold:</label>
                        <input 
                          type="number"
                          value={trigger.config?.threshold || 0}
                          onChange={(e) => setTrigger({ ...trigger, config: { ...trigger.config, threshold: Number(e.target.value) } })}
                          className="w-full h-11 bg-white rounded-xl border border-slate-100 font-bold text-sm px-4 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                          placeholder="Esempio: 70"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {viewMode === 'flow' && (
            <div className="h-12 w-px bg-slate-200 relative flex items-center justify-center">
               <ArrowDown size={14} className="text-slate-300 absolute -bottom-1" />
            </div>
          )}

          {/* ACTIONS LIST */}
          <Reorder.Group 
            axis="y" 
            values={actions} 
            onReorder={setActions}
            className={`w-full ${viewMode === 'flow' ? 'space-y-8 flex flex-col items-center' : 'space-y-4'}`}
          >
            {actions.map((action, index) => (
              <Reorder.Item 
                key={action.id} 
                value={action}
                className={`w-full flex flex-col items-center group/item ${viewMode === 'list' ? 'block' : ''}`}
              >
                <div className={`w-full bg-white border transition-all relative ${
                  viewMode === 'flow' 
                  ? 'rounded-[40px] border-slate-200 hover:border-blue-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 p-6 sm:p-8' 
                  : 'rounded-3xl border-slate-200 p-5'
                }`}>
                  <div className="flex items-start justify-between gap-4 sm:gap-6">
                    <div className="flex items-center gap-4 sm:gap-5 flex-1">
                      <div className="cursor-grab active:cursor-grabbing p-2 hover:bg-slate-50 rounded-lg text-slate-300">
                        <GripVertical size={20} />
                      </div>
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                        ACTION_OPTIONS.find(o => o.type === action.type)?.color
                      }`}>
                         {React.createElement(ACTION_OPTIONS.find(o => o.type === action.type)?.icon || Settings, { size: 24 })}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="text-sm font-black text-slate-900 uppercase truncate">
                            {ACTION_OPTIONS.find(o => o.type === action.type)?.label}
                          </h4>
                          <span className="hidden sm:inline text-[9px] font-bold text-slate-300 uppercase tracking-widest whitespace-nowrap">Step {index + 1}</span>
                        </div>
                        <ActionConfig 
                          action={action} 
                          stages={stages}
                          updateConfig={(config) => updateActionConfig(action.id, config)} 
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 sm:gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                      <button 
                        onClick={() => duplicateAction(action)}
                        className="p-2 hover:bg-slate-50 text-slate-300 hover:text-blue-500 rounded-xl transition-all"
                        title="Duplica"
                      >
                        <Copy size={16} />
                      </button>
                      <button 
                        onClick={() => removeAction(action.id)}
                        className="p-2 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-xl transition-all"
                        title="Elimina"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                {viewMode === 'flow' && index < actions.length - 1 && (
                  <div className="h-8 w-px bg-slate-200 relative flex items-center justify-center">
                    <ArrowDown size={14} className="text-slate-300 absolute -bottom-1" />
                  </div>
                )}
              </Reorder.Item>
            ))}
          </Reorder.Group>

          {/* ADD ACTION NODE */}
          <div className="w-full flex flex-col items-center mt-6 sm:mt-8">
            {viewMode === 'flow' && actions.length > 0 && <div className="h-8 w-px bg-slate-200 mb-8" />}
            
            <div className={`bg-slate-900 p-6 sm:p-8 w-full border border-slate-800 shadow-2xl ${viewMode === 'flow' ? 'rounded-[32px]' : 'rounded-3xl'}`}>
               <div className="flex items-center gap-4 mb-6 sm:mb-8">
                 <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-blue-400">
                   <Plus size={20} />
                 </div>
                 <div>
                   <h3 className="text-sm font-black text-white uppercase">Sotto... poi fai questo:</h3>
                   <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Aggiungi un'azione alla sequenza</p>
                 </div>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                  {ACTION_OPTIONS.map(opt => (
                    <button
                      key={opt.type}
                      onClick={() => addAction(opt.type)}
                      className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500 hover:bg-blue-500/10 transition-all text-left flex flex-col gap-3 group"
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white ${opt.color}`}>
                        <opt.icon size={16} />
                      </div>
                      <p className="text-[9px] font-black uppercase text-white/80 leading-tight group-hover:text-white transition-colors">{opt.label}</p>
                    </button>
                  ))}
               </div>
            </div>
          </div>

          {viewMode === 'flow' && (
            <>
              <div className="h-12 w-px bg-slate-200 mt-8 mb-4" />
              <div className="px-5 py-2 bg-slate-100 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest mb-12">Fine Flusso</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const ActionConfig: React.FC<{ action: CRMAutomationAction; stages: CRMStage[]; updateConfig: (config: any) => void }> = ({ action, stages, updateConfig }) => {
  switch (action.type) {
    case 'task':
      return (
        <div className="grid grid-cols-1 gap-3 mt-4 animate-in slide-in-from-top-2 duration-300">
          <input 
            placeholder="Nome attività da fare..."
            value={action.config.title || ''}
            onChange={(e) => updateConfig({ title: e.target.value })}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl h-10 px-4 text-xs font-bold focus:ring-2 focus:ring-slate-100 focus:outline-none"
          />
          <textarea 
            placeholder="Dettagli extra..."
            value={action.config.description || ''}
            onChange={(e) => updateConfig({ description: e.target.value })}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs font-bold min-h-[80px] focus:ring-2 focus:ring-slate-100 focus:outline-none"
          />
        </div>
      );
    case 'email':
      return (
        <div className="grid grid-cols-1 gap-3 mt-4 animate-in slide-in-from-top-2 duration-300">
          <input 
            placeholder="Oggetto dell'email..."
            value={action.config.subject || ''}
            onChange={(e) => updateConfig({ subject: e.target.value })}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl h-10 px-4 text-xs font-bold focus:ring-2 focus:ring-slate-100 focus:outline-none"
          />
          <textarea 
            placeholder="Testo dell'email..."
            value={action.config.body || ''}
            onChange={(e) => updateConfig({ body: e.target.value })}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs font-bold min-h-[100px] focus:ring-2 focus:ring-slate-100 focus:outline-none"
          />
        </div>
      );
    case 'whatsapp':
    case 'note':
      return (
        <div className="grid grid-cols-1 gap-3 mt-4 animate-in slide-in-from-top-2 duration-300">
          <textarea 
            placeholder={action.type === 'whatsapp' ? "Scrivi il messaggio WhatsApp..." : "Contenuto della nota..."}
            value={action.config.body || ''}
            onChange={(e) => updateConfig({ body: e.target.value })}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs font-bold min-h-[100px] focus:ring-2 focus:ring-slate-100 focus:outline-none"
          />
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Dynamic: {"{{contact}}, {{deal}}"}</p>
        </div>
      );
    case 'wait':
      return (
        <div className="flex items-center gap-3 mt-4 animate-in slide-in-from-top-2 duration-300">
          <input 
            type="number"
            placeholder="Esempio: 30"
            value={action.config.wait_duration || ''}
            onChange={(e) => updateConfig({ wait_duration: Number(e.target.value) })}
            className="w-24 bg-slate-50 border border-slate-100 rounded-xl h-10 px-4 text-xs font-bold focus:ring-2 focus:ring-slate-100 focus:outline-none"
          />
          <select 
            value={action.config.wait_unit || 'minutes'}
            onChange={(e) => updateConfig({ wait_unit: e.target.value })}
            className="bg-slate-50 border border-slate-100 rounded-xl h-10 px-4 text-xs font-bold flex-1 focus:ring-2 focus:ring-slate-100 focus:outline-none"
          >
            <option value="minutes">Minuti</option>
            <option value="hours">Ore</option>
            <option value="days">Giorni</option>
          </select>
        </div>
      );
    case 'assignee':
      return (
        <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
          <select 
            value={action.config.assignee_id || ''}
            onChange={(e) => updateConfig({ assignee_id: e.target.value })}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl h-10 px-4 text-xs font-bold focus:ring-2 focus:ring-slate-100 focus:outline-none"
          >
            <option value="">Scegli collaboratore...</option>
            <option value="user-1">Marco Rossini</option>
            <option value="user-2">Elena Bianchi</option>
            <option value="user-3">Roberto Verdi</option>
          </select>
        </div>
      );
    case 'webhook':
      return (
        <div className="grid grid-cols-1 gap-3 mt-4 animate-in slide-in-from-top-2 duration-300">
          <input 
            placeholder="https://api.esempio.it/webhook"
            value={action.config.url || ''}
            onChange={(e) => updateConfig({ url: e.target.value })}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl h-10 px-4 text-xs font-bold focus:ring-2 focus:ring-slate-100 focus:outline-none"
          />
        </div>
      );
    case 'change_stage':
      return (
        <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
          <select 
            value={action.config.stage_id || ''}
            onChange={(e) => updateConfig({ stage_id: e.target.value })}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl h-10 px-4 text-xs font-bold focus:ring-2 focus:ring-slate-100 focus:outline-none"
          >
            <option value="">Scegli stage di destinazione...</option>
            {stages.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      );
    default:
      return <p className="text-[10px] text-slate-400 font-bold uppercase mt-4 italic">Nessuna configurazione extra richiesta.</p>;
  }
};
