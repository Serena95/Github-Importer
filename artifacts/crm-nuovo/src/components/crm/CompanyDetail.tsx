import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Plus, 
  Users, 
  History,
  MoreVertical,
  Building,
  Target,
  FileText,
  Clock,
  PieChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CRMCompany, CRMContact, CRMDeal, CRMActivity } from '@/types/crm';
import { supabaseCRMService } from '@/services/supabaseCRMService';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { ActivityLogger } from './ActivityLogger';

interface CompanyDetailProps {
  company: CRMCompany;
  onClose: () => void;
}

export const CompanyDetail: React.FC<CompanyDetailProps> = ({ company, onClose }) => {
  const [deals, setDeals] = useState<CRMDeal[]>([]);
  const [contacts, setContacts] = useState<CRMContact[]>([]);
  const [activities, setActivities] = useState<CRMActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [allDeals, allContacts, allActivities] = await Promise.all([
        supabaseCRMService.getDeals(),
        supabaseCRMService.getContacts(),
        supabaseCRMService.getActivities()
      ]);
      setDeals(allDeals.filter(d => d.company_id === company.id || d.company === company.name));
      setContacts(allContacts.filter(c => c.company_id === company.id || c.company_name === company.name));
      setActivities(allActivities.filter(a => a.entity_id === company.id).sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [company.id]);

  const totalDealValue = deals.reduce((sum, d) => sum + (d.value || 0), 0);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-8 border-b border-slate-50 relative group">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full"
        >
          <X size={20} className="text-slate-400" />
        </Button>

        <div className="flex items-start gap-6">
          <div className="h-20 w-20 rounded-[28px] bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-200">
            <Building size={36} />
          </div>
          
          <div className="pt-2 flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{company.name}</h2>
              <Badge className="bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border-none">
                {company.industry || 'Settore non definito'}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-2 text-slate-400 font-medium">
               <Globe size={14} />
               <a href={company.website} target="_blank" rel="noreferrer" className="text-sm hover:text-blue-600 transition-colors">
                 {company.website || 'Nessun sito web'}
               </a>
               <span className="mx-2 text-slate-200">|</span>
               <MapPin size={14} />
               <span className="text-sm">{company.address || 'Nessun indirizzo'}</span>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              {company.tags?.map(tag => (
                <Badge key={tag} variant="secondary" className="bg-slate-50 text-slate-500 font-bold border-none text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] py-1 px-4 rounded-full shadow-lg shadow-blue-100 uppercase tracking-widest gap-2 h-9"
              onClick={() => {
                // Dispatch event to open deal modal with this company pre-selected
                window.dispatchEvent(new CustomEvent('crm:openCreateDeal', { 
                  detail: { companyId: company.id, companyName: company.name }
                }));
              }}
            >
              <Plus size={14} /> NUOVO AFFARE
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 divide-x divide-slate-50 border-b border-slate-50">
        <div className="p-6 text-center">
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Deal Totali</p>
           <p className="text-lg font-black text-slate-800">{deals.length}</p>
        </div>
        <div className="p-6 text-center">
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Volume Affari</p>
           <p className="text-lg font-black text-blue-600">€ {totalDealValue.toLocaleString()}</p>
        </div>
        <div className="p-6 text-center">
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Dipendenti</p>
           <p className="text-lg font-black text-slate-800">{company.size || 'N/A'}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="flex-1 flex flex-col">
        <div className="px-8 border-b border-slate-50">
          <TabsList className="bg-transparent h-auto p-0 gap-8">
            <TabsTrigger value="info" className="p-0 py-4 h-auto border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none text-xs font-black uppercase tracking-widest text-slate-400 data-[state=active]:text-slate-900">
              Profilo
            </TabsTrigger>
            <TabsTrigger value="contacts" className="p-0 py-4 h-auto border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none text-xs font-black uppercase tracking-widest text-slate-400 data-[state=active]:text-slate-900">
              Contatti ({contacts.length})
            </TabsTrigger>
            <TabsTrigger value="deals" className="p-0 py-4 h-auto border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none text-xs font-black uppercase tracking-widest text-slate-400 data-[state=active]:text-slate-900">
              Deals ({deals.length})
            </TabsTrigger>
            <TabsTrigger value="activity" className="p-0 py-4 h-auto border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none text-xs font-black uppercase tracking-widest text-slate-400 data-[state=active]:text-slate-900">
              Timeline
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-8">
            <TabsContent value="info" className="m-0 space-y-8">
              <ActivityLogger 
                entityId={company.id} 
                entityType="company" 
                onActivityAdded={fetchData} 
              />
              
              <section className="space-y-4 pt-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Dati Fiscali</h3>
                <div className="p-6 bg-slate-50/50 rounded-[28px] border border-slate-100/50 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Partita IVA / VAT</p>
                        <p className="text-sm font-black text-slate-800">{company.vat || 'Nessun dato fiscale'}</p>
                      </div>
                   </div>
                   <Button variant="ghost" className="text-xs font-bold text-blue-600">Modifica</Button>
                </div>
              </section>

              <section className="space-y-4">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Informazioni Aziendali</h3>
                 <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <Mail size={16} className="text-slate-300" />
                       <span className="text-sm font-medium text-slate-600">{company.email || 'Nessuna email corporate'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <Phone size={16} className="text-slate-300" />
                       <span className="text-sm font-medium text-slate-600">{company.phone || 'Nessun recapito telefonico'}</span>
                    </div>
                 </div>
              </section>
            </TabsContent>

            <TabsContent value="contacts" className="m-0 space-y-3">
              {contacts.length === 0 ? (
                <div className="py-20 text-center">
                   <p className="text-xs font-bold text-slate-300">Nessun contatto associato</p>
                </div>
              ) : (
                contacts.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-[9px] font-bold bg-slate-100">{c.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{c.name}</p>
                        <p className="text-[10px] text-slate-400">{c.position}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300">
                       <MoreVertical size={14} />
                    </Button>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="deals" className="m-0 space-y-4">
               {deals.map(deal => (
                 <div key={deal.id} className="p-5 border border-slate-100 rounded-2xl hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-2">
                       <h4 className="font-bold text-slate-800">{deal.title}</h4>
                       <span className={cn(
                         "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                         deal.stage_id.toLowerCase().includes('vinto') ? "bg-emerald-50 text-emerald-600" : 
                         deal.stage_id.toLowerCase().includes('perso') ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600"
                       )}>
                         {deal.stage_id}
                       </span>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-xs font-black text-slate-900">€ {deal.value?.toLocaleString()}</span>
                       <span className="text-[10px] text-slate-400 font-medium">Aggiornato {deal.updated_at ? format(new Date(deal.updated_at), 'dd/MM/yyyy') : format(new Date(deal.created_at), 'dd/MM/yyyy')}</span>
                    </div>
                 </div>
               ))}
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>

      {/* Footer */}
      <div className="p-6 border-t border-slate-50 flex items-center gap-3">
        <Button className="flex-1 bg-slate-900 border-none h-12 rounded-2xl font-black uppercase tracking-widest text-[11px] text-white">
          <PieChart size={18} className="mr-2" /> Report Aziendale
        </Button>
      </div>
    </div>
  );
};
