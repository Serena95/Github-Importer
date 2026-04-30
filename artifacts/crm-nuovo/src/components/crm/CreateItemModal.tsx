import React, { useState, useMemo } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useCRMStore } from '@/stores/crmStore';
import { supabaseCRMService } from '@/services/supabaseCRMService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

import { CRM_USERS } from '@/constants/crm';

interface CreateItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'lead' | 'deal' | 'contact' | 'company';
  pipelineId?: string;
  stageId?: string;
  initialData?: any;
}

export const CreateItemModal: React.FC<CreateItemModalProps> = ({ isOpen, onClose, type, pipelineId: propPipelineId, stageId: propStageId, initialData }) => {
  const { user } = useAuth();
  const { structures, activeStructure, activeWorkspace, fetchInitialData, stages: allStages } = useCRMStore();
  const [loading, setLoading] = useState(false);
  
  const [selectedPipelineId, setSelectedPipelineId] = useState(propPipelineId || activeStructure?.id || '');
  const [selectedStageId, setSelectedStageId] = useState(propStageId || '');
  
  const [formData, setFormData] = useState<any>({
    title: '',
    company: '',
    contact: '',
    email: '',
    phone: '',
    value: 0,
    assigned_to: 'user-1', // Default to first user (Marco Rossini)
    notes: '',
    ...initialData
  });

  // Handle initialData changes if modal is reopened with new data
  React.useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  // Filter stages based on selected pipeline
  const filteredStages = useMemo(() => {
    if (!selectedPipelineId) return [];
    return allStages.filter(s => s.structure_id === selectedPipelineId);
  }, [allStages, selectedPipelineId]);

  // Set default stage (Form preanalisi) if available
  React.useEffect(() => {
    if (!propStageId && filteredStages.length > 0) {
      const preanalysisStage = filteredStages.find(s => s.name.toLowerCase().includes('preanalisi'));
      if (preanalysisStage) {
        setSelectedStageId(preanalysisStage.id);
      } else {
        setSelectedStageId(filteredStages[0].id);
      }
    }
  }, [propStageId, filteredStages]);

  // Update pipeline if prop changes or active structure changes
  React.useEffect(() => {
    if (propPipelineId) setSelectedPipelineId(propPipelineId);
    else if (activeStructure) setSelectedPipelineId(activeStructure.id);
  }, [propPipelineId, activeStructure]);

  const selectedStructure = useMemo(() => {
    return structures.find(s => s.id === selectedPipelineId);
  }, [structures, selectedPipelineId]);

  const isLeadMode = selectedStructure?.slug === 'leads';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      if (type === 'deal') {
        const payload = {
          workspace_id: activeWorkspace?.id,
          structure_id: selectedPipelineId,
          stage_id: selectedStageId,
          title: formData.company || formData.title,
          company: formData.company || formData.title,
          contact: formData.contact,
          phone: formData.phone,
          email: formData.email,
          value: formData.value,
          assigned_to: formData.assigned_to,
          custom_fields: { notes: formData.notes }
        };

        if (!payload.structure_id || !payload.stage_id) {
          throw new Error("Pipeline e Fase sono obbligatori");
        }

        await supabaseCRMService.createDeal(payload);
        toast.success("Affare creato con successo");
        await fetchInitialData();
      }

      onClose();
      // Reset form
      setFormData({ title: '', company: '', contact: '', email: '', phone: '', value: 0, assigned_to: user.email || 'Admin', notes: '' });
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Errore durante la creazione");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "bg-white rounded-none md:rounded-[32px] p-0 border-none shadow-2xl transition-all duration-300",
        "w-full h-full md:h-auto md:max-w-[700px] flex flex-col" // Fullscreen on mobile, 700px on desktop
      )}>
        <DialogHeader className="p-6 border-b border-slate-50 shrink-0">
          <DialogTitle className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-tighter">
            Nuovo {type === 'deal' ? 'Affare' : type.charAt(0).toUpperCase() + type.slice(1)}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 bg-[#f8fafc]">
          <ScrollArea className="flex-1 px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 max-w-3xl mx-auto">
              
              {/* Pipeline Selection */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Pipeline</Label>
                <Select value={selectedPipelineId} onValueChange={setSelectedPipelineId}>
                  <SelectTrigger className="h-12 rounded-2xl border-slate-100 bg-white shadow-sm focus:ring-blue-100">
                    <SelectValue placeholder="Seleziona pipeline..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                    {structures.map(s => (
                      <SelectItem key={s.id} value={s.id} className="font-bold text-xs uppercase tracking-tight">
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Stage Selection */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Fase Attuale</Label>
                <Select value={selectedStageId} onValueChange={setSelectedStageId}>
                  <SelectTrigger className="h-12 rounded-2xl border-slate-100 bg-white shadow-sm focus:ring-blue-100">
                    <SelectValue placeholder="Seleziona fase..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                    {filteredStages.map(s => (
                      <SelectItem key={s.id} value={s.id} className="font-bold text-xs uppercase tracking-tight">
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 col-span-1 md:col-span-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                  {isLeadMode ? 'Titolo Lead / Azienda' : 'Azienda / Titolo'}
                </Label>
                <Input 
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  placeholder={isLeadMode ? "Es: Nuovo contatto fiera o Nome Azienda" : "Nome dell'azienda o titolo del deal"}
                  className="h-12 rounded-2xl border-slate-100 bg-white shadow-sm focus:ring-blue-100 text-sm font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Persona di Contatto</Label>
                <Input 
                  value={formData.contact}
                  onChange={(e) => setFormData({...formData, contact: e.target.value})}
                  placeholder="Nome del referente"
                  className="h-12 rounded-2xl border-slate-100 bg-white shadow-sm focus:ring-blue-100 text-sm font-bold"
                />
              </div>

              {!isLeadMode && (
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Valore Atteso (€)</Label>
                  <Input 
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: Number(e.target.value)})}
                    className="h-12 rounded-2xl border-slate-100 bg-white shadow-sm focus:ring-blue-100 text-sm font-black text-emerald-600"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email</Label>
                <Input 
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="azienda@esempio.it"
                  className="h-12 rounded-2xl border-slate-100 bg-white shadow-sm focus:ring-blue-100 text-sm font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Telefono</Label>
                <Input 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+39 000 000 0000"
                  className="h-12 rounded-2xl border-slate-100 bg-white shadow-sm focus:ring-blue-100 text-sm font-bold"
                />
              </div>

              <div className="space-y-1.5 col-span-1 md:col-span-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Responsabile</Label>
                <Select value={formData.assigned_to} onValueChange={(val) => setFormData({...formData, assigned_to: val})}>
                  <SelectTrigger className="h-12 rounded-2xl border-slate-100 bg-white shadow-sm focus:ring-blue-100 text-sm font-bold text-blue-600">
                    <SelectValue placeholder="Seleziona responsabile..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                    {CRM_USERS.map(u => (
                      <SelectItem key={u.id} value={u.id} className="font-bold text-xs">
                        {u.name} ({u.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 col-span-1 md:col-span-2 pb-10">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Note Extra</Label>
                <Textarea 
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Inserisci dettagli utili per la qualificazione..."
                  className="min-h-[100px] rounded-2xl border-slate-100 bg-white shadow-sm focus:ring-blue-100 text-sm font-medium p-4"
                />
              </div>

            </div>
          </ScrollArea>

          <DialogFooter className="p-6 bg-white border-t border-slate-50 shrink-0 flex flex-row gap-3">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose} 
              className="flex-1 rounded-2xl h-12 font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-50"
            >
              Annulla
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl h-12 text-[10px] uppercase tracking-widest shadow-xl shadow-blue-100"
            >
              {loading ? 'CREAZIONE...' : isLeadMode ? 'CREA LEAD' : 'CREA AFFARE'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
