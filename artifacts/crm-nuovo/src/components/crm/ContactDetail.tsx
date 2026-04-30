import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  Plus, 
  MessageSquare, 
  History,
  MoreVertical,
  Briefcase,
  ExternalLink,
  Target,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CRMContact, CRMDeal, CRMActivity } from '@/types/crm';
import { supabaseCRMService } from '@/services/supabaseCRMService';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ActivityLogger } from './ActivityLogger';

interface ContactDetailProps {
  contact: CRMContact;
  onClose: () => void;
}

export const ContactDetail: React.FC<ContactDetailProps> = ({ contact, onClose }) => {
  const [deals, setDeals] = useState<CRMDeal[]>([]);
  const [activities, setActivities] = useState<CRMActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [allDeals, allActivities] = await Promise.all([
        supabaseCRMService.getDeals(),
        supabaseCRMService.getActivities()
      ]);
      setDeals(allDeals.filter(d => d.contact_id === contact.id || d.contact === contact.name));
      setActivities(allActivities.filter(a => a.entity_id === contact.id).sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [contact.id]);

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
          <Avatar className="h-20 w-20 border-4 border-slate-50 shadow-sm">
            <AvatarImage src="" />
            <AvatarFallback className="bg-blue-600 text-white text-2xl font-black">
              {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="pt-2 flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{contact.name}</h2>
              <Badge className={cn(
                "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border-none",
                contact.status === 'customer' ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
              )}>
                {contact.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-2 text-slate-400 font-medium">
               <Briefcase size={14} />
               <span className="text-sm">{contact.position || 'Nessuna posizione definita'}</span>
               <span className="mx-2 text-slate-200">|</span>
               <Building size={14} />
               <span className="text-sm">{contact.company_name || 'Nessuna azienda'}</span>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              {contact.tags?.map(tag => (
                <Badge key={tag} variant="secondary" className="bg-slate-50 text-slate-500 font-bold border-none text-[10px]">
                  {tag}
                </Badge>
              ))}
              <Button variant="ghost" size="sm" className="h-6 px-2 rounded-lg text-blue-600 hover:bg-blue-50 text-[10px] font-black">
                <Plus size={12} className="mr-1" /> TAG
              </Button>
            </div>
          </div>

          <div className="pt-2">
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] py-1 px-4 rounded-full shadow-lg shadow-blue-100 uppercase tracking-widest gap-2 h-9"
              onClick={() => {
                // Dispatch event to open deal modal with this contact pre-selected
                window.dispatchEvent(new CustomEvent('crm:openCreateDeal', { 
                  detail: { contactId: contact.id, contactName: contact.name }
                }));
              }}
            >
              <Plus size={14} /> NUOVO AFFARE
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="flex-1 flex flex-col">
        <div className="px-8 border-b border-slate-50">
          <TabsList className="bg-transparent h-auto p-0 gap-8">
            <TabsTrigger value="info" className="p-0 py-4 h-auto border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none text-xs font-black uppercase tracking-widest text-slate-400 data-[state=active]:text-slate-900">
              Informazioni
            </TabsTrigger>
            <TabsTrigger value="deals" className="p-0 py-4 h-auto border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none text-xs font-black uppercase tracking-widest text-slate-400 data-[state=active]:text-slate-900">
              Affari ({deals.length})
            </TabsTrigger>
            <TabsTrigger value="activity" className="p-0 py-4 h-auto border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none text-xs font-black uppercase tracking-widest text-slate-400 data-[state=active]:text-slate-900">
              Cronologia
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-8">
            <TabsContent value="info" className="m-0 space-y-8">
              <section className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Contatti Diretti</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm">
                      <Mail size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Email</p>
                      <p className="text-xs font-black text-slate-700">{contact.email}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                      <Phone size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Telefono</p>
                      <p className="text-xs font-black text-slate-700">{contact.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Dettagli Aziendali</h3>
                <div className="p-6 border border-slate-100 rounded-[32px] space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <Building className="text-slate-300" size={20} />
                       <span className="font-bold text-slate-800">{contact.company_name || 'Libero professionista'}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 rounded-xl text-blue-600 font-bold">Vedi Azienda <ExternalLink size={12} className="ml-2" /></Button>
                  </div>
                  <div className="grid grid-cols-2 gap-y-4 border-t border-slate-50 pt-6">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Ruolo</p>
                      <p className="text-xs font-bold text-slate-700 mt-1">{contact.position || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Settore</p>
                      <p className="text-xs font-bold text-slate-700 mt-1">Sviluppo Software</p>
                    </div>
                  </div>
                </div>
              </section>
            </TabsContent>

            <TabsContent value="deals" className="m-0 space-y-4">
               {deals.length === 0 ? (
                 <div className="py-20 text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-100">
                    <Target size={40} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-xs font-black uppercase tracking-widest text-slate-300">Nessun affare aperto</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-4 text-blue-600 font-black tracking-widest uppercase text-[10px]"
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('crm:openCreateDeal', { 
                          detail: { contactId: contact.id, contactName: contact.name }
                        }));
                      }}
                    >
                      <Plus size={14} className="mr-2" /> Crea Deal
                    </Button>
                 </div>
               ) : (
                 deals.map(deal => (
                   <div key={deal.id} className="p-5 border border-slate-100 rounded-2xl hover:shadow-md transition-all group">
                     <div className="flex items-center justify-between">
                       <h4 className="font-bold text-slate-800">{deal.title}</h4>
                       <span className="text-sm font-black text-blue-600">€ {deal.value?.toLocaleString()}</span>
                     </div>
                     <div className="flex items-center gap-4 mt-3">
                       <Badge variant="outline" className={cn(
                         "bg-slate-50 border-none text-[9px] font-black uppercase tracking-widest",
                         deal.stage_id.toLowerCase().includes('vinto') ? "text-emerald-600 bg-emerald-50" :
                         deal.stage_id.toLowerCase().includes('perso') ? "text-rose-600 bg-rose-50" : "text-slate-500"
                       )}>
                         {deal.stage_id}
                       </Badge>
                       <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                         <Clock size={12} /> Aggiornato {deal.updated_at ? format(new Date(deal.updated_at), 'dd MMM', { locale: it }) : format(new Date(deal.created_at), 'dd MMM', { locale: it })}
                       </span>
                     </div>
                   </div>
                 ))
               )}
            </TabsContent>

            <TabsContent value="activity" className="m-0 space-y-6">
               <ActivityLogger 
                 entityId={contact.id} 
                 entityType="contact" 
                 onActivityAdded={fetchData} 
               />

               <div className="flex items-center gap-4 mb-4 mt-8">
                  <div className="flex-1 h-[1px] bg-slate-100" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Timeline Attività</span>
                  <div className="flex-1 h-[1px] bg-slate-100" />
               </div>
               
               <div className="space-y-8 relative">
                 {activities.length > 0 && <div className="absolute left-4 top-2 bottom-2 w-[2px] bg-slate-50" />}
                 
                 {activities.length === 0 ? (
                   <div className="text-center py-10">
                     <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Nessuna attività registrata</p>
                   </div>
                 ) : (
                   activities.map((act) => (
                     <div key={act.id} className="relative pl-12">
                       <div className={cn(
                         "absolute left-2.5 top-0 w-3 h-3 rounded-full border-2 border-white shadow-sm",
                         act.type === 'call' ? "bg-emerald-500" : act.type === 'email' ? "bg-amber-500" : "bg-blue-600"
                       )} />
                       <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                             <span className={cn(
                               "text-[10px] font-black uppercase tracking-widest",
                               act.type === 'call' ? "text-emerald-600" : act.type === 'email' ? "text-amber-600" : "text-blue-600"
                             )}>
                               {act.title}
                             </span>
                             <span className="text-[10px] text-slate-400">
                               {format(new Date(act.created_at), 'HH:mm - dd MMM', { locale: it })}
                             </span>
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed font-medium">{act.description}</p>
                          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-[8px] bg-slate-100">
                                {act.author_name?.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">{act.author_name}</span>
                          </div>
                       </div>
                     </div>
                   ))
                 )}
               </div>
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>

      {/* Footer Actions */}
      <div className="p-6 border-t border-slate-50 flex items-center gap-3">
        <Button className="flex-1 bg-slate-900 border-none h-12 rounded-2xl font-black uppercase tracking-widest text-[11px] text-white">
          <MessageSquare size={18} className="mr-2" /> Invia Messaggio
        </Button>
        <Button variant="outline" className="h-12 w-12 rounded-2xl border-slate-100">
          <MoreVertical size={18} className="text-slate-400" />
        </Button>
      </div>
    </div>
  );
};
