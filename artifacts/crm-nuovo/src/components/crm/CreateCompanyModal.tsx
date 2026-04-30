import React, { useState, useEffect } from 'react';
import { useCRMStore } from '@/stores/crmStore';
import { supabaseCRMService } from '@/services/supabaseCRMService';
import { CRMCompany } from '@/types/crm';
import { 
  X, 
  Building, 
  Mail, 
  Phone, 
  Globe, 
  MapPin,
  Tag,
  Save,
  Loader2,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface CreateCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  company?: CRMCompany | null;
}

export const CreateCompanyModal: React.FC<CreateCompanyModalProps> = ({ isOpen, onClose, company }) => {
  const { activeWorkspace, fetchCompanies } = useCRMStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<CRMCompany>>({
    name: '',
    email: '',
    phone: '',
    website: '',
    industry: '',
    size: '',
    address: '',
    vat: '',
    tags: []
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (company) {
      setFormData(company);
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        website: '',
        industry: '',
        size: '',
        address: '',
        vat: '',
        tags: []
      });
    }
  }, [company, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace) return;
    
    setIsLoading(true);
    try {
      await supabaseCRMService.saveCompany({
        ...formData,
        workspace_id: activeWorkspace.id,
        assigned_to: formData.assigned_to || ''
      });
      toast.success(company ? 'Azienda aggiornata' : 'Azienda creata con successo');
      fetchCompanies();
      onClose();
    } catch (error) {
      toast.error('Errore durante il salvataggio');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags?.includes(tagInput.trim())) {
        setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), tagInput.trim()] }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags?.filter(t => t !== tagToRemove) }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{company ? 'Modifica Azienda' : 'Nuova Azienda'}</h2>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Dati Societari</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white">
            <X size={20} className="text-slate-400" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Building size={12} /> Ragione Sociale
              </Label>
              <Input 
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="es. Acme Corp S.r.l."
                className="h-11 border-slate-100 rounded-xl font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <FileText size={12} /> Partita IVA / VAT
              </Label>
              <Input 
                value={formData.vat}
                onChange={e => setFormData({...formData, vat: e.target.value})}
                placeholder="IT0123456789"
                className="h-11 border-slate-100 rounded-xl font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Globe size={12} /> Sito Web
              </Label>
              <Input 
                value={formData.website}
                onChange={e => setFormData({...formData, website: e.target.value})}
                placeholder="https://www.azienda.it"
                className="h-11 border-slate-100 rounded-xl font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Mail size={12} /> Email Corporate
              </Label>
              <Input 
                type="email"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="info@azienda.it"
                className="h-11 border-slate-100 rounded-xl font-bold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <MapPin size={12} /> Indirizzo Sede
            </Label>
            <Input 
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
              placeholder="Via Roma 1, 20121 Milano (MI)"
              className="h-11 border-slate-100 rounded-xl font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Settore Industriale</Label>
              <Input 
                value={formData.industry}
                onChange={e => setFormData({...formData, industry: e.target.value})}
                placeholder="es. Software, Edilizia, Consulenza..."
                className="h-11 border-slate-100 rounded-xl font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dimensione Team</Label>
              <Select 
                value={formData.size} 
                onValueChange={val => setFormData({...formData, size: val})}
              >
                <SelectTrigger className="h-11 border-slate-100 rounded-xl font-bold">
                  <SelectValue placeholder="Seleziona dimensione" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100">
                  <SelectItem value="1-10">1-10 dipendenti</SelectItem>
                  <SelectItem value="11-50">11-50 dipendenti</SelectItem>
                  <SelectItem value="51-200">51-200 dipendenti</SelectItem>
                  <SelectItem value="200+">Oltre 200 dipendenti</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Tag size={12} /> Tags Aziendali
            </Label>
            <Input 
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Premi invio per aggiungere..."
              className="h-11 border-slate-100 rounded-xl font-bold"
            />
            <div className="flex flex-wrap gap-1 mt-2">
              {formData.tags?.map(tag => (
                <Badge key={tag} variant="secondary" className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                  {tag}
                  <X size={10} className="cursor-pointer hover:text-slate-900" onClick={() => removeTag(tag)} />
                </Badge>
              ))}
            </div>
          </div>

          <div className="pt-4 flex gap-3">
             <Button type="button" variant="ghost" onClick={onClose} className="flex-1 h-12 rounded-xl text-slate-500 font-bold">
               Annulla
             </Button>
             <Button type="submit" disabled={isLoading} className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-blue-100">
               {isLoading ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save size={18} className="mr-2" />}
               {company ? 'Salva Modifiche' : 'Crea Azienda'}
             </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
