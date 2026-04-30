import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  FileText, 
  Upload, 
  PenTool, 
  Calculator,
  MessageSquare,
  ChevronRight,
  Download,
  AlertCircle,
  Loader2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CRMDeal, CRMQuote, CRMSignature, CRMFile, ClientPortalAccess } from '@/types/crm';
import { supabaseCRMService } from '@/services/supabaseCRMService';
import { storageService } from '@/services/storageService';
import { DealSignatures } from '@/components/crm/DealSignatures';
import { DealFiles } from '@/components/crm/DealFiles';
import { DealQuotes } from '@/components/crm/DealQuotes';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface ClientPortalProps {
  token: string;
}

export const ClientPortal: React.FC<ClientPortalProps> = ({ token }) => {
  const [loading, setLoading] = useState(true);
  const [access, setAccess] = useState<ClientPortalAccess | null>(null);
  const [deal, setDeal] = useState<CRMDeal | null>(null);
  const [activeTab, setActiveTab] = useState<'status' | 'documents' | 'quotes' | 'signature'>('status');

  useEffect(() => {
    const initPortal = async () => {
      setLoading(true);
      try {
        const portalData = await supabaseCRMService.getPortalAccess(token);
        if (!portalData) {
          toast.error('Link non valido o scaduto');
          return;
        }

        // Check expiration
        if (new Date(portalData.expires_at) < new Date()) {
          toast.error('Il link è scaduto');
          return;
        }

        setAccess(portalData);
        
        // Fetch Deal Data
        const allDeals = await supabaseCRMService.getDeals();
        const currentDeal = allDeals.find(d => d.id === portalData.deal_id);
        if (currentDeal) {
          setDeal(currentDeal);
        } else {
          toast.error('Pratica non trovata');
        }
      } catch (e) {
        console.error(e);
        toast.error('Errore durante l\'accesso al portale');
      } finally {
        setLoading(false);
      }
    };

    initPortal();
  }, [token]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white/60 font-black uppercase tracking-widest text-[10px]">Autenticazione Pratica in corso...</p>
        </div>
      </div>
    );
  }

  if (!access || !deal) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900 p-6">
        <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[48px] text-center">
            <div className="w-20 h-20 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <AlertCircle size={40} />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Accesso Negato</h2>
            <p className="text-white/40 text-sm font-medium mb-10">Il link di accesso è scaduto o non è più valido. Contatta il tuo consulente per riceverne uno nuovo.</p>
            <Button className="w-full h-14 rounded-2xl bg-white text-slate-900 font-black uppercase tracking-widest text-[11px]">Torna al sito principale</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Client Header */}
      <header className="bg-slate-900 text-white p-8 md:p-12 pb-32">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8">
           <div>
             <div className="flex items-center gap-3 mb-4">
                <div className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                  Portale Cliente Sicuro
                </div>
                <div className="flex items-center gap-1.5 text-white/40">
                   <Lock size={12} />
                   <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">SSL Criptato</span>
                </div>
             </div>
             <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-2">Nexus Portal</h1>
             <p className="text-white/60 text-sm font-medium uppercase tracking-widest">Benvenuto, {deal.contact}</p>
           </div>
           
           <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-[32px] flex items-center gap-4 group hover:bg-white/10 transition-all cursor-default">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-500/20">
                <CheckCircle2 size={24} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-1">Stato Pratica</p>
                <div className="flex items-center gap-2">
                   <span className="text-lg font-black uppercase tracking-tight">{deal.stage_id || 'In Corso'}</span>
                   <ArrowRight size={16} className="text-blue-500 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
           </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto -mt-16 px-6 pb-20">
         <div className="bg-white rounded-[48px] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100">
            {/* Tabs Navigation */}
            <div className="flex overflow-x-auto no-scrollbar border-b border-slate-50 p-4 gap-2 bg-white sticky top-0 z-50">
               {[
                 { id: 'status', label: 'Riepilogo', icon: Clock },
                 { id: 'documents', label: 'Documenti', icon: FileText },
                 { id: 'quotes', label: 'Preventivi', icon: Calculator },
                 { id: 'signature', label: 'Firma', icon: PenTool }
               ].map(tab => (
                 <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    activeTab === tab.id 
                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
                    : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                 >
                   <tab.icon size={16} />
                   {tab.label}
                 </button>
               ))}
            </div>

            <div className="p-8 md:p-12">
               <AnimatePresence mode="wait">
                 {activeTab === 'status' && (
                   <motion.div 
                    key="status"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-12"
                   >
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="p-10 rounded-[40px] bg-slate-50 border border-slate-100 flex flex-col justify-between h-[300px]">
                          <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">Informazioni Pratica</h3>
                            <div className="space-y-4">
                               <div className="flex justify-between items-center text-sm">
                                 <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Riferimento</span>
                                 <span className="font-black text-slate-900 uppercase">#{deal.id.substring(0, 8)}</span>
                               </div>
                               <div className="flex justify-between items-center text-sm">
                                 <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Creato il</span>
                                 <span className="font-black text-slate-900 uppercase">{format(new Date(deal.created_at), 'dd MMM yyyy', { locale: it })}</span>
                               </div>
                               <div className="flex justify-between items-center text-sm">
                                 <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Consulente</span>
                                 <span className="font-black text-slate-900 uppercase">{deal.assigned_to || 'Team Nexus'}</span>
                               </div>
                            </div>
                          </div>
                          <div className="pt-8 border-t border-slate-100">
                             <Button className="w-full h-14 bg-white border border-slate-200 text-slate-900 hover:bg-slate-900 hover:text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all gap-2 group">
                               <MessageSquare size={16} /> Contatta Assistenza
                             </Button>
                          </div>
                       </div>

                       <div className="p-10 rounded-[40px] bg-blue-600 text-white relative overflow-hidden h-[300px]">
                          <div className="relative z-10 h-full flex flex-col justify-between">
                             <div>
                               <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-6 font-mono">Status Tracker</h3>
                               <div className="space-y-2">
                                  <p className="text-4xl font-black uppercase tracking-tighter leading-none">{deal.stage_id || 'In Corso'}</p>
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">La tua pratica è in fase di elaborazione</p>
                               </div>
                             </div>
                             <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest">Aggiornato ora</span>
                                <div className="flex gap-1">
                                   {[1,2,3,4,5].map(i => (
                                     <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < 4 ? 'bg-white' : 'bg-white/20'}`} />
                                   ))}
                                </div>
                             </div>
                          </div>
                          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
                       </div>
                     </div>

                     <div className="p-10 rounded-[40px] bg-white border border-slate-100">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-8">Timeline Avanzamento</h3>
                        <div className="space-y-10">
                           {[
                             { label: 'Apertura Pratica', sub: 'Pratica acquisita correttamente', active: true, done: true },
                             { label: 'Analisi Tecnica', sub: 'Verifica documenti in corso', active: true, done: true },
                             { label: 'Elaborazione Offerta', sub: 'Il team sta preparando il preventivo', active: true, done: false },
                             { label: 'Conclusione', sub: 'Firma finale e setup', active: false, done: false }
                           ].map((step, i) => (
                             <div key={i} className={`flex gap-6 relative ${i < 3 ? 'after:content-[""] after:absolute after:left-3 after:top-10 after:bottom-[-20px] after:w-px after:bg-slate-100' : ''}`}>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${
                                  step.done ? 'bg-emerald-500 text-white' : step.active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-300'
                                }`}>
                                   {step.done ? <CheckCircle2 size={12} /> : <div className="w-2 h-2 rounded-full bg-current" />}
                                </div>
                                <div>
                                   <p className={`text-xs font-black uppercase tracking-tight mb-1 ${step.active ? 'text-slate-900' : 'text-slate-300'}`}>{step.label}</p>
                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{step.sub}</p>
                                </div>
                             </div>
                           ))}
                        </div>
                     </div>
                   </motion.div>
                 )}

                 {activeTab === 'documents' && (
                   <motion.div 
                    key="documents"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                   >
                     <DealFiles dealId={deal.id} />
                   </motion.div>
                 )}

                 {activeTab === 'quotes' && (
                   <motion.div 
                    key="quotes"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                   >
                     <DealQuotes deal={deal} />
                   </motion.div>
                 )}

                 {activeTab === 'signature' && (
                   <motion.div 
                    key="signature"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="h-full"
                   >
                     <DealSignatures deal={deal} />
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
         </div>
      </main>

      {/* Portal Footer */}
      <footer className="py-12 border-t border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black">N</div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">© 2026 Nexus Business CRM. All rights reserved.</p>
           </div>
           <div className="flex gap-8">
              <a href="#" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Privacy</a>
              <a href="#" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Sicurezza</a>
              <a href="#" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Assistenza</a>
           </div>
        </div>
      </footer>
    </div>
  );
};
