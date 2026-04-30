import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  Calendar as CalendarIcon,
  User,
  Activity,
  Layers,
  Save,
  Clock,
  MessageSquare
} from 'lucide-react';
import { SmartRecord, SmartFieldDefinition, SmartProcess } from '@/types/crm';
import { supabaseCRMService } from '@/services/supabaseCRMService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { motion } from 'motion/react';
import { toast } from 'sonner';

interface SmartDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  recordId: string | null;
  processId: string;
  onUpdate?: () => void;
}

export const SmartDetailDrawer: React.FC<SmartDetailDrawerProps> = ({ isOpen, onClose, recordId, processId, onUpdate }) => {
  const [record, setRecord] = useState<SmartRecord | null>(null);
  const [fields, setFields] = useState<SmartFieldDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && recordId) {
      fetchDetail();
    }
  }, [isOpen, recordId]);

  const fetchDetail = async () => {
    setIsLoading(true);
    try {
      const [recordData, fieldsData] = await Promise.all([
        supabaseCRMService.getSmartRecordById(recordId!),
        supabaseCRMService.getSmartFieldDefinitions(processId)
      ]);
      setRecord(recordData);
      setFields(fieldsData);
    } catch (error) {
      console.error(error);
      toast.error('Errore nel caricamento del dettaglio');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (updates: Partial<SmartRecord>) => {
    if (!record) return;
    try {
      const updated = await supabaseCRMService.saveSmartRecord({ 
        ...record, 
        ...updates,
        custom_fields: { ...record.custom_fields, ...(updates.custom_fields || {}) }
      });
      setRecord(updated);
      onUpdate?.();
    } catch (error) {
      toast.error('Errore nel salvataggio');
    }
  };

  const handleDelete = async () => {
    if (!record || !window.confirm('Sei sicuro di voler eliminare questo record?')) return;
    try {
      await supabaseCRMService.deleteSmartRecord(record.id);
      toast.success('Record eliminato');
      onClose();
      onUpdate?.();
    } catch (error) {
      toast.error('Errore nell\'eliminazione');
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl p-0 border-none shadow-2xl bg-slate-50 flex flex-col focus-visible:outline-none">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
             <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : record && (
          <>
            <div className="bg-white border-b border-slate-100 p-6 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                     <Layers size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-none">{record.title}</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Smart Record Detail</p>
                  </div>
               </div>
               <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={24} />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto nexus-scrollbar p-6 space-y-6">
               {/* CORE INFORMATION SECTION */}
               <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm space-y-6"
               >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Informazioni Base</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Titolo</Label>
                      <Input 
                        value={record.title}
                        onChange={(e) => handleUpdate({ title: e.target.value })}
                        className="h-11 border-slate-100 bg-slate-50/50 rounded-xl focus:bg-white font-bold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Valore (€)</Label>
                      <Input 
                        type="number"
                        value={record.value}
                        onChange={(e) => handleUpdate({ value: parseFloat(e.target.value) || 0 })}
                        className="h-11 border-slate-100 bg-slate-50/50 rounded-xl focus:bg-white font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Note / Descrizione</Label>
                    <Textarea 
                      value={record.content}
                      onChange={(e) => handleUpdate({ content: e.target.value })}
                      className="min-h-[100px] border-slate-100 bg-slate-50/50 rounded-xl focus:bg-white font-medium text-xs leading-relaxed"
                    />
                  </div>
               </motion.div>

               {/* DYNAMIC CUSTOM FIELDS SECTION */}
               {fields.length > 0 && (
                 <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.1 }}
                   className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm space-y-6"
                 >
                   <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Campi Personalizzati</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {fields.map(field => {
                      const value = record.custom_fields?.[field.name] || '';
                      return (
                        <div key={field.id} className="space-y-1.5">
                          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-tight flex items-center justify-between">
                            <span>{field.label} {field.required && <span className="text-rose-500">*</span>}</span>
                          </Label>

                          {field.type === 'textarea' ? (
                            <Textarea 
                              value={value}
                              onChange={(e) => handleUpdate({ custom_fields: { ...record.custom_fields, [field.name]: e.target.value } })}
                              className="min-h-[80px] border-slate-100 bg-slate-50/50 rounded-xl text-xs font-bold"
                            />
                          ) : field.type === 'checkbox' ? (
                            <div className="flex items-center gap-3 h-11 px-4 bg-slate-50/50 rounded-xl border border-slate-100 uppercase">
                               <Checkbox 
                                 checked={!!value}
                                 onCheckedChange={(checked) => handleUpdate({ custom_fields: { ...record.custom_fields, [field.name]: checked } })}
                               />
                               <span className="text-[11px] font-bold text-slate-600">{field.label}</span>
                            </div>
                          ) : (
                            <Input 
                              type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                              value={value}
                              onChange={(e) => handleUpdate({ custom_fields: { ...record.custom_fields, [field.name]: e.target.value } })}
                              className="h-11 border-slate-100 bg-slate-50/50 rounded-xl font-bold text-xs"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                 </motion.div>
               )}
            </div>

            <div className="bg-white border-t border-slate-100 p-6 flex items-center gap-4 shrink-0">
               <Button 
                 variant="ghost" 
                 onClick={handleDelete}
                 className="h-12 w-12 p-0 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl"
               >
                 <Trash2 size={20} />
               </Button>
               <Button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase text-[11px] tracking-widest h-12 rounded-2xl shadow-lg shadow-emerald-50">
                 <Save size={18} className="mr-2" /> Salva ed Esci
               </Button>
               <Button variant="outline" onClick={onClose} className="border-slate-200 text-slate-500 font-black h-12 rounded-2xl px-8 uppercase text-[11px] tracking-widest">
                 Chiudi
               </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
