import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Settings2, 
  GripVertical,
  DollarSign,
  Briefcase,
  Ticket,
  ClipboardList,
  MessageSquare,
  Shield,
  Save,
  X,
  Workflow,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SmartProcess, CRMStage, SmartFieldDefinition } from '@/types/crm';
import { supabaseCRMService } from '@/services/supabaseCRMService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const ICONS = [
  { name: 'DollarSign', icon: DollarSign },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'Ticket', icon: Ticket },
  { name: 'ClipboardList', icon: ClipboardList },
  { name: 'MessageSquare', icon: MessageSquare },
  { name: 'Shield', icon: Shield },
  { name: 'Workflow', icon: Workflow },
];

const COLORS = [
  'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 
  'bg-indigo-500', 'bg-violet-500', 'bg-cyan-500', 'bg-slate-500'
];

interface SmartProcessManagerProps {
  onProcessCreated?: (process: SmartProcess) => void;
  onClose: () => void;
}

export const SmartProcessManager: React.FC<SmartProcessManagerProps> = ({ onProcessCreated, onClose }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'fields'>('info');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Briefcase');
  const [selectedColor, setSelectedColor] = useState('bg-blue-500');
  const [customFields, setCustomFields] = useState<Partial<SmartFieldDefinition>[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name) {
      toast.error('Inserisci un nome per il processo');
      return;
    }

    setIsSaving(true);
    try {
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const newProcess = await supabaseCRMService.saveSmartProcess({
        name,
        description,
        slug,
        icon: selectedIcon,
        color: selectedColor,
      });

      // Save fields too
      // Note: In a real implementation we'd need a bulk insert or loop
      // supabaseCRMService.saveSmartFields(newProcess.id, customFields);

      toast.success('Processo creato con successo');
      onProcessCreated?.(newProcess);
      onClose();
    } catch (error) {
      toast.error('Errore durante il salvataggio');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Crea Nuovo Processo</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Configura un nuovo flusso di lavoro personalizzato</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="px-8 py-2 border-b border-slate-100 flex gap-6 bg-white shrink-0">
          <button 
            onClick={() => setActiveTab('info')}
            className={cn("px-4 py-4 text-[11px] font-black uppercase tracking-widest transition-all relative", activeTab === 'info' ? "text-blue-600" : "text-slate-400")}
          >
            Info Base
            {activeTab === 'info' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full" />}
          </button>
          <button 
            onClick={() => setActiveTab('fields')}
            className={cn("px-4 py-4 text-[11px] font-black uppercase tracking-widest transition-all relative", activeTab === 'fields' ? "text-blue-600" : "text-slate-400")}
          >
            Campi Personalizzati
            {activeTab === 'fields' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full" />}
          </button>
        </div>

        <div className="p-8 overflow-y-auto nexus-scrollbar flex-1">
          {activeTab === 'info' ? (
            <div className="space-y-8 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nome Processo</Label>
                  <Input 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="es. Gestione Ticket, Pratiche Legali..."
                    className="h-12 border-slate-100 rounded-xl font-bold text-slate-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Descrizione (opzionale)</Label>
                  <Input 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Breve descrizione del flusso..."
                    className="h-12 border-slate-100 rounded-xl font-bold text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Icona Rappresentativa</Label>
                <div className="flex flex-wrap gap-3">
                  {ICONS.map(item => (
                    <button
                      key={item.name}
                      onClick={() => setSelectedIcon(item.name)}
                      className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all border-2",
                        selectedIcon === item.name 
                          ? "bg-blue-50 border-blue-500 text-blue-600 shadow-md" 
                          : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                      )}
                    >
                      <item.icon size={20} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Colore Tema</Label>
                <div className="flex flex-wrap gap-3">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        "w-8 h-8 rounded-full transition-all border-4 border-white shadow-sm ring-2",
                        selectedColor === color ? "ring-slate-800 scale-110" : "ring-transparent hover:scale-105",
                        color
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 pb-4">
               <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Definizione Campi</h4>
                  <Button 
                    onClick={() => setCustomFields([...customFields, { label: '', type: 'text', required: false, show_in_kanban: false }])}
                    variant="outline" 
                    className="h-9 rounded-xl text-[10px] font-black border-blue-100 text-blue-600 hover:bg-blue-50"
                  >
                    <Plus size={14} className="mr-2" /> Aggiungi Campo
                  </Button>
               </div>

               <div className="space-y-3">
                  {customFields.length === 0 ? (
                    <div className="py-12 border-2 border-dashed border-slate-100 rounded-[32px] flex flex-col items-center justify-center bg-slate-50/50">
                       <Settings2 size={32} className="text-slate-200 mb-2" />
                       <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Nessun campo personalizzato aggiunto</p>
                    </div>
                  ) : (
                    customFields.map((field, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-4 group"
                      >
                         <div className="flex-1">
                            <Input 
                              value={field.label}
                              onChange={e => {
                                const newFields = [...customFields];
                                newFields[idx].label = e.target.value;
                                setCustomFields(newFields);
                              }}
                              placeholder="Nome del campo (es. Matricola, Scadenza...)"
                              className="h-10 bg-white border-slate-100 text-xs font-bold"
                            />
                         </div>
                         <div className="w-40">
                           <select 
                             value={field.type}
                             onChange={e => {
                               const newFields = [...customFields];
                               newFields[idx].type = e.target.value as any;
                               setCustomFields(newFields);
                             }}
                             className="w-full h-10 bg-white border border-slate-100 rounded-xl text-xs font-bold px-3 focus:outline-none focus:ring-2 focus:ring-blue-100"
                           >
                             <option value="text">Testo</option>
                             <option value="number">Numero</option>
                             <option value="date">Data</option>
                             <option value="textarea">Area di testo</option>
                             <option value="checkbox">Checkbox</option>
                           </select>
                         </div>
                         <button 
                           onClick={() => setCustomFields(customFields.filter((_, i) => i !== idx))}
                           className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 size={16} />
                         </button>
                      </motion.div>
                    ))
                  )}
               </div>
            </div>
          )}
        </div>

        <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3 shrink-0">
           <Button 
             variant="ghost" 
             onClick={onClose}
             className="text-[11px] font-black uppercase tracking-widest text-slate-400"
           >
             Annulla
           </Button>
           <Button 
             onClick={handleSave}
             disabled={isSaving}
             className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 rounded-full text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-100"
           >
             {isSaving ? 'Creazione in corso...' : 'Crea Processo Smart'}
           </Button>
        </div>
      </motion.div>
    </div>
  );
};
