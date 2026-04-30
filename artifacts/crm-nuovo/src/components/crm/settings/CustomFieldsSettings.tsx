import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Settings2, 
  GripVertical,
  Type,
  Hash,
  List,
  Calendar,
  CheckCircle2,
  Link,
  Mail,
  Phone,
  DollarSign,
  AlignLeft,
  Eye,
  EyeOff,
  Save,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CRMCustomFieldDefinition, CRMCustomFieldType } from '@/types/crm';
import { supabaseCRMService } from '@/services/supabaseCRMService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const FIELD_TYPES: { type: CRMCustomFieldType; label: string; icon: any }[] = [
  { type: 'text', label: 'Testo', icon: Type },
  { type: 'number', label: 'Numero', icon: Hash },
  { type: 'select', label: 'Select', icon: List },
  { type: 'multi_select', label: 'Multi select', icon: List },
  { type: 'date', label: 'Data', icon: Calendar },
  { type: 'checkbox', label: 'Checkbox', icon: CheckCircle2 },
  { type: 'url', label: 'URL', icon: Link },
  { type: 'email', label: 'Email', icon: Mail },
  { type: 'phone', label: 'Telefono', icon: Phone },
  { type: 'currency', label: 'Valuta', icon: DollarSign },
  { type: 'textarea', label: 'Area di testo', icon: AlignLeft },
];

export const CustomFieldsSettings: React.FC = () => {
  const [fields, setFields] = useState<CRMCustomFieldDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<Partial<CRMCustomFieldDefinition> | null>(null);
  const [entityType, setEntityType] = useState<'deal' | 'contact' | 'company' | 'lead'>('deal');

  useEffect(() => {
    fetchFields();
  }, [entityType]);

  const fetchFields = async () => {
    setIsLoading(true);
    try {
      const data = await supabaseCRMService.getCustomFieldDefinitions(entityType);
      setFields(data);
    } catch (error) {
      toast.error('Errore nel caricamento dei campi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddField = () => {
    setIsEditing({
      entity_type: entityType,
      type: 'text',
      label: '',
      required: false,
      show_in_kanban: false,
      show_in_list: true,
      order: fields.length
    });
  };

  const handleSaveField = async () => {
    if (!isEditing?.label) {
      toast.error('Inserisci un\'etichetta per il campo');
      return;
    }

    try {
      // Basic translation from label to name (snake_case)
      const name = isEditing.name || isEditing.label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      await supabaseCRMService.saveCustomFieldDefinition({ ...isEditing, name });
      toast.success('Campo salvato con successo');
      setIsEditing(null);
      fetchFields();
    } catch (error) {
      toast.error('Errore nel salvataggio');
    }
  };

  const handleDeleteField = async (id: string) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo campo? I dati esistenti negli affari non verranno cancellati, ma il campo non sarà più visibile nel CRM.')) return;
    try {
      await supabaseCRMService.deleteCustomFieldDefinition(id);
      toast.success('Campo eliminato');
      fetchFields();
    } catch (error) {
      toast.error('Errore nell\'eliminazione');
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Campi Personalizzati</h1>
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest mt-1">Configura i dettagli aggiuntivi per le tue entità CRM</p>
        </div>
        <Button 
          onClick={handleAddField}
          className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[11px] tracking-widest px-8 h-12 rounded-full shadow-lg shadow-blue-100"
        >
          <Plus size={18} className="mr-2" /> Nuovo Campo
        </Button>
      </div>

      <div className="flex gap-4 mb-8">
        {(['deal', 'contact', 'company', 'lead'] as const).map(type => (
          <button
            key={type}
            onClick={() => setEntityType(type)}
            className={cn(
              "px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border",
              entityType === type 
                ? "bg-slate-900 border-slate-900 text-white shadow-lg" 
                : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"
            )}
          >
            {type === 'deal' && 'Affari'}
            {type === 'contact' && 'Contatti'}
            {type === 'company' && 'Aziende'}
            {type === 'lead' && 'Lead'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="py-20 text-center">
            <p className="text-slate-400 font-bold uppercase tracking-widest">Caricamento...</p>
          </div>
        ) : fields.length === 0 ? (
          <div className="py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] text-center">
             <Settings2 size={48} className="mx-auto text-slate-200 mb-4" />
             <p className="text-slate-400 font-black uppercase tracking-widest">Nessun campo personalizzato definito</p>
          </div>
        ) : (
          fields.map((field, idx) => {
            const typeInfo = FIELD_TYPES.find(t => t.type === field.type);
            return (
              <motion.div 
                key={field.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white border border-slate-100 rounded-[24px] p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-6">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 cursor-grab active:cursor-grabbing">
                    <GripVertical size={20} />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      {typeInfo && <typeInfo.icon size={22} />}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 uppercase tracking-tight">{field.label}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{typeInfo?.label}</span>
                        {field.required && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-500 text-[8px] font-black uppercase">Obbligatorio</span>
                        )}
                        {field.show_in_kanban && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[8px] font-black uppercase flex items-center gap-1">
                            <Eye size={10} /> Kanban
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setIsEditing(field)}
                    className="h-10 w-10 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                  >
                    <Settings2 size={18} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDeleteField(field.id)}
                    className="h-10 w-10 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                  {isEditing.id ? 'Modifica Campo' : 'Nuovo Campo'}
                </h3>
                <button onClick={() => setIsEditing(null)} className="text-slate-400"><X size={20} /></button>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Etichetta Campo</Label>
                  <Input 
                    value={isEditing.label}
                    onChange={e => setIsEditing({...isEditing, label: e.target.value})}
                    placeholder="E es. Partita IVA, Lingua, Budget..."
                    className="h-12 border-slate-100 rounded-xl font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tipo Campo</Label>
                  <Select 
                    value={isEditing.type} 
                    onValueChange={(val: CRMCustomFieldType) => setIsEditing({...isEditing, type: val})}
                  >
                    <SelectTrigger className="h-12 border-slate-100 rounded-xl font-bold">
                      <SelectValue placeholder="Seleziona tipo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELD_TYPES.map(t => (
                        <SelectItem key={t.type} value={t.type}>
                          <div className="flex items-center gap-2">
                            <t.icon size={16} className="text-blue-500" />
                            <span>{t.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600">Obbligatorio</Label>
                      <Switch 
                        checked={isEditing.required}
                        onCheckedChange={checked => setIsEditing({...isEditing, required: checked})}
                      />
                    </div>
                    <p className="text-[9px] font-medium text-slate-400">Impone la compilazione del campo.</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600">Mostra in Kanban</Label>
                      <Switch 
                        checked={isEditing.show_in_kanban}
                        onCheckedChange={checked => setIsEditing({...isEditing, show_in_kanban: checked})}
                      />
                    </div>
                    <p className="text-[9px] font-medium text-slate-400">Visibile sulla card dell'affare.</p>
                  </div>
                </div>
              </div>

              <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
                 <Button 
                   variant="ghost" 
                   onClick={() => setIsEditing(null)}
                   className="text-[11px] font-black uppercase tracking-widest text-slate-400"
                 >
                   Annulla
                 </Button>
                 <Button 
                   onClick={handleSaveField}
                   className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-11 rounded-full text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-100"
                 >
                   Salva Campo
                 </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
