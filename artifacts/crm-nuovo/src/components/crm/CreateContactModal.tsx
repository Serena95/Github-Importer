import React, { useState, useEffect } from 'react';
import { useCRMStore } from '@/stores/crmStore';
import { supabaseCRMService } from '@/services/supabaseCRMService';
import { CRMContact, CRMCompany } from '@/types/crm';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Building, 
  Briefcase,
  Tag,
  Save,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface CreateContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact?: CRMContact | null;
}

export const CreateContactModal: React.FC<CreateContactModalProps> = ({ isOpen, onClose, contact }) => {
  const { activeWorkspace, companies, fetchContacts } = useCRMStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<CRMContact>>({
    name: '',
    email: '',
    phone: '',
    company_id: '',
    company_name: '',
    position: '',
    status: 'prospect',
    tags: []
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (contact) {
      setFormData(contact);
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        company_id: '',
        company_name: '',
        position: '',
        status: 'prospect',
        tags: []
      });
    }
  }, [contact, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace) return;
    
    setIsLoading(true);
    try {
      await supabaseCRMService.saveContact({
        ...formData,
        workspace_id: activeWorkspace.id,
        assigned_to: formData.assigned_to || '' // To be handled with actual user list
      });
      toast.success(contact ? 'Contatto aggiornato' : 'Contatto creato con successo');
      fetchContacts();
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
      <div className="bg-white w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{contact ? 'Modifica Contatto' : 'Nuovo Contatto'}</h2>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Informazioni Anagrafiche</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white">
            <X size={20} className="text-slate-400" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <User size={12} /> Nome Completo
              </Label>
              <Input 
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="es. Mario Rossi"
                className="h-11 border-slate-100 rounded-xl font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Mail size={12} /> Email
              </Label>
              <Input 
                required
                type="email"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="mario.rossi@esempio.com"
                className="h-11 border-slate-100 rounded-xl font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Phone size={12} /> Telefono
              </Label>
              <Input 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                placeholder="+39 340 1234567"
                className="h-11 border-slate-100 rounded-xl font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Briefcase size={12} /> Ruolo / Posizione
              </Label>
              <Input 
                value={formData.position}
                onChange={e => setFormData({...formData, position: e.target.value})}
                placeholder="es. CEO, Marketing Manager..."
                className="h-11 border-slate-100 rounded-xl font-bold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Building size={12} /> Azienda Associata
            </Label>
            <Select 
              value={formData.company_id} 
              onValueChange={val => {
                const comp = companies.find(c => c.id === val);
                setFormData({...formData, company_id: val, company_name: comp?.name || ''});
              }}
            >
              <SelectTrigger className="h-11 border-slate-100 rounded-xl font-bold">
                <SelectValue placeholder="Seleziona un'azienda" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100">
                {companies.map(c => (
                  <SelectItem key={c.id} value={c.id} className="font-medium">{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Stato Lead</Label>
              <Select 
                value={formData.status} 
                onValueChange={val => setFormData({...formData, status: val as any})}
              >
                <SelectTrigger className="h-11 border-slate-100 rounded-xl font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100">
                  <SelectItem value="prospect">Prospect</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Tag size={12} /> Tags
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
          </div>

          <div className="pt-4 flex gap-3">
             <Button type="button" variant="ghost" onClick={onClose} className="flex-1 h-12 rounded-xl text-slate-500 font-bold">
               Annulla
             </Button>
             <Button type="submit" disabled={isLoading} className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-blue-100">
               {isLoading ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save size={18} className="mr-2" />}
               {contact ? 'Salva Modifiche' : 'Crea Contatto'}
             </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
