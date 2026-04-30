import React from 'react';
import { CustomFieldsSettings } from './settings/CustomFieldsSettings';
import { GeneralSettings } from './settings/GeneralSettings';
import { TeamSettings } from './settings/TeamSettings';
import { NotificationSettings } from './settings/NotificationSettings';
import { 
  Settings, 
  Database, 
  ShieldCheck, 
  Bell, 
  Zap,
  Globe,
  Users
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

export const CRMConfig: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#f8fafc]">
      <div className="px-6 py-4 border-b border-slate-100 bg-white shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Impostazioni CRM</h2>
          <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest">Configura il tuo ambiente di lavoro</p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-6">
        <Tabs defaultValue="general" className="h-full flex flex-col">
          <div className="flex items-start gap-8 h-full">
            <TabsList className="flex flex-col h-auto bg-white border border-slate-100 p-2 rounded-2xl w-64 shrink-0 shadow-sm">
              <TabsTrigger value="general" className="w-full justify-start gap-3 px-4 py-3 text-xs font-bold rounded-xl data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 transition-all">
                <Settings size={16} /> Generale
              </TabsTrigger>
              <TabsTrigger value="fields" className="w-full justify-start gap-3 px-4 py-3 text-xs font-bold rounded-xl data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 transition-all">
                <Database size={16} /> Campi Personalizzati
              </TabsTrigger>
              <TabsTrigger value="team" className="w-full justify-start gap-3 px-4 py-3 text-xs font-bold rounded-xl data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 transition-all">
                <Users size={16} /> Gestione Team
              </TabsTrigger>
              <TabsTrigger value="notifications" className="w-full justify-start gap-3 px-4 py-3 text-xs font-bold rounded-xl data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 transition-all">
                <Bell size={16} /> Notifiche
              </TabsTrigger>
              <TabsTrigger value="automations" className="w-full justify-start gap-3 px-4 py-3 text-xs font-bold rounded-xl data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 transition-all">
                <Zap size={16} /> Regole Avanzate
              </TabsTrigger>
              <TabsTrigger value="integrations" className="w-full justify-start gap-3 px-4 py-3 text-xs font-bold rounded-xl data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 transition-all">
                <Globe size={16} /> Integrazioni
              </TabsTrigger>
              <TabsTrigger value="permissions" className="w-full justify-start gap-3 px-4 py-3 text-xs font-bold rounded-xl data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 transition-all">
                <ShieldCheck size={16} /> Sicurezza
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 h-full bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden flex flex-col">
              <ScrollArea className="flex-1">
                <div className="p-8">
                  <TabsContent value="general" className="m-0 focus-visible:ring-0">
                    <GeneralSettings />
                  </TabsContent>

                  <TabsContent value="fields" className="m-0 focus-visible:ring-0">
                    <CustomFieldsSettings />
                  </TabsContent>

                  <TabsContent value="team" className="m-0 focus-visible:ring-0">
                     <TeamSettings />
                  </TabsContent>

                  <TabsContent value="notifications" className="m-0 focus-visible:ring-0">
                    <NotificationSettings />
                  </TabsContent>

                  <TabsContent value="permissions" className="m-0 focus-visible:ring-0">
                     <div className="max-w-2xl">
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Sicurezza e Permessi</h3>
                        <p className="text-sm text-slate-500 mb-8 border-b border-slate-50 pb-4">Controlla chi può fare cosa all'interno della piattaforma.</p>
                        <div className="p-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl opacity-40">
                          <ShieldCheck size={48} className="text-slate-300 mb-4" />
                          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Gestione permessi coming soon</p>
                        </div>
                     </div>
                  </TabsContent>

                  <TabsContent value="automations" className="m-0 focus-visible:ring-0">
                     <div className="max-w-2xl">
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Regole Avanzate</h3>
                        <p className="text-sm text-slate-500 mb-8 border-b border-slate-50 pb-4">Definisci regole globali per il trattamento dei dati.</p>
                        <div className="p-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl opacity-40">
                          <Zap size={48} className="text-slate-300 mb-4" />
                          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Regole sandbox coming soon</p>
                        </div>
                     </div>
                  </TabsContent>

                  <TabsContent value="integrations" className="m-0 focus-visible:ring-0">
                     <div className="max-w-2xl">
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Integrazioni</h3>
                        <p className="text-sm text-slate-500 mb-8 border-b border-slate-50 pb-4">Collega i tuoi strumenti preferiti (WhatsApp, Email, Zapier).</p>
                        <div className="p-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl opacity-40">
                          <Globe size={48} className="text-slate-300 mb-4" />
                          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Marketplace coming soon</p>
                        </div>
                     </div>
                  </TabsContent>
                </div>
              </ScrollArea>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
};
