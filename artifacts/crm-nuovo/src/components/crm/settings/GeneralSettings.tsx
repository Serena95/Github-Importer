import React, { useState, useEffect } from 'react';
import { useCRMStore } from '@/stores/crmStore';
import { supabaseCRMService } from '@/services/supabaseCRMService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Save, Building2, Globe, Mail } from 'lucide-react';

export const GeneralSettings: React.FC = () => {
  const { activeWorkspace, setWorkspaces, setActiveWorkspace } = useCRMStore();
  const [name, setName] = useState(activeWorkspace?.name || '');
  const [description, setDescription] = useState(''); // Assuming description might be added to schema later
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (activeWorkspace) {
      setName(activeWorkspace.name);
    }
  }, [activeWorkspace]);

  const handleSave = async () => {
    if (!activeWorkspace) return;
    setIsSaving(true);
    try {
      const updated = await supabaseCRMService.saveWorkspace({
        ...activeWorkspace,
        name
      });
      setActiveWorkspace(updated);
      // Update workspaces list in store
      const allWs = await supabaseCRMService.getWorkspaces();
      setWorkspaces(allWs);
      toast.success('Impostazioni salvate con successo');
    } catch (error) {
      toast.error('Errore durante il salvataggio');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Profilo Workspace</h3>
        <p className="text-sm text-slate-500 mb-8 border-b border-slate-50 pb-4">Personalizza l'identità del tuo spazio di lavoro.</p>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Building2 size={12} /> Nome Workspace
            </Label>
            <Input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="E es. Vendite Globali, Reparto Marketing..."
              className="h-12 border-slate-100 rounded-xl font-bold"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Descrizione</Label>
            <Textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Racconta brevemente lo scopo di questo workspace..."
              className="min-h-[100px] border-slate-100 rounded-xl font-medium"
            />
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-slate-50">
        <h3 className="text-xl font-bold text-slate-800 mb-2">Localizzazione</h3>
        <p className="text-sm text-slate-500 mb-6">Configura la lingua e la valuta predefinita.</p>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lingua</Label>
            <Input disabled value="Italiano (IT)" className="h-12 border-slate-100 rounded-xl bg-slate-50 font-bold opacity-60" />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Valuta</Label>
            <Input disabled value="Euro (€)" className="h-12 border-slate-100 rounded-xl bg-slate-50 font-bold opacity-60" />
          </div>
        </div>
      </div>

      <div className="pt-8 flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 rounded-full text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 transition-all active:scale-95"
        >
          {isSaving ? 'Salvataggio...' : (
            <>
              <Save size={18} className="mr-2" /> Salva Modifiche
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
