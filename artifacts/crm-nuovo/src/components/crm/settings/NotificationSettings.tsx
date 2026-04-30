import React, { useState } from 'react';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Zap, 
  MessageSquare, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const NotificationSettings: React.FC = () => {
  const [channels, setChannels] = useState({
    email: true,
    push: false,
    whatsapp: true,
    inApp: true
  });

  const [events, setEvents] = useState({
    newDeal: true,
    dealMoved: true,
    taskAssigned: true,
    lateTask: true,
    commentMention: true
  });

  const handleSave = () => {
    toast.success('Preferenze di notifica aggiornate');
  };

  return (
    <div className="max-w-3xl space-y-12">
      <section>
        <div className="mb-8">
          <h3 className="text-xl font-bold text-slate-800">Canali di Notifica</h3>
          <p className="text-sm text-slate-500">Scegli come vuoi essere contattato per gli aggiornamenti.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 bg-white border border-slate-100 rounded-[28px] space-y-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Mail size={22} />
              </div>
              <Switch 
                checked={channels.email} 
                onCheckedChange={(val) => setChannels({...channels, email: val})} 
              />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 uppercase text-[12px] tracking-tight">Email Digest</h4>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-1">Ricevi riepiloghi giornalieri e notifiche importanti via email.</p>
            </div>
          </div>

          <div className="p-6 bg-white border border-slate-100 rounded-[28px] space-y-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Smartphone size={22} />
              </div>
              <Switch 
                checked={channels.push} 
                onCheckedChange={(val) => setChannels({...channels, push: val})} 
              />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 uppercase text-[12px] tracking-tight">Notifiche Push</h4>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-1">Avvisi in tempo reale direttamente sul tuo browser o smartphone.</p>
            </div>
          </div>

          <div className="p-6 bg-white border border-slate-100 rounded-[28px] space-y-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <MessageSquare size={22} />
              </div>
              <Switch 
                checked={channels.whatsapp} 
                onCheckedChange={(val) => setChannels({...channels, whatsapp: val})} 
              />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 uppercase text-[12px] tracking-tight">WhatsApp API</h4>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-1">Notifiche urgenti e reminder task tramite chat WhatsApp.</p>
            </div>
          </div>

          <div className="p-6 bg-white border border-slate-100 rounded-[28px] space-y-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Bell size={22} />
              </div>
              <Switch 
                checked={channels.inApp} 
                onCheckedChange={(val) => setChannels({...channels, inApp: val})} 
              />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 uppercase text-[12px] tracking-tight">Centro Notifiche</h4>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-1">Avvisi visibili nel pannello notifiche interno all'app.</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-8 p-6 bg-slate-900 rounded-[32px] text-white">
          <h3 className="text-xl font-bold flex items-center gap-3">
             <Zap size={20} className="text-amber-400 fill-amber-400" /> Eventi da notificare
          </h3>
          <p className="text-slate-400 text-sm mt-1">Configura quali azioni generano una notifica.</p>
          
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-800">
               <div className="flex items-center gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                 <span className="text-[11px] font-black uppercase tracking-widest text-slate-200">Nuovo Affare Creato</span>
               </div>
               <Switch checked={events.newDeal} onCheckedChange={(val) => setEvents({...events, newDeal: val})} />
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-800">
               <div className="flex items-center gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                 <span className="text-[11px] font-black uppercase tracking-widest text-slate-200">Spostamento Fase Pipeline</span>
               </div>
               <Switch checked={events.dealMoved} onCheckedChange={(val) => setEvents({...events, dealMoved: val})} />
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-800">
               <div className="flex items-center gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                 <span className="text-[11px] font-black uppercase tracking-widest text-slate-200">Nuovo Task Assegnato</span>
               </div>
               <Switch checked={events.taskAssigned} onCheckedChange={(val) => setEvents({...events, taskAssigned: val})} />
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-800">
               <div className="flex items-center gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                 <span className="text-[11px] font-black uppercase tracking-widest text-slate-200">Task Scaduto</span>
               </div>
               <Switch checked={events.lateTask} onCheckedChange={(val) => setEvents({...events, lateTask: val})} />
            </div>
          </div>
        </div>
      </section>

      <div className="flex justify-end pt-4">
        <Button 
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white px-12 h-12 rounded-full text-[11px] font-black uppercase tracking-widest shadow-xl shadow-blue-100"
        >
          Salva Preferenze
        </Button>
      </div>
    </div>
  );
};
