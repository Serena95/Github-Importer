import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  MoreVertical, 
  Download, 
  Send, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Euro,
  Trash2,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CRMDeal, CRMQuote } from '@/types/crm';
import { supabaseCRMService } from '@/services/supabaseCRMService';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { toast } from 'sonner';
import { CreateQuoteModal } from './CreateQuoteModal';
import { motion, AnimatePresence } from 'motion/react';

interface DealQuotesProps {
  deal: CRMDeal;
}

export const DealQuotes: React.FC<DealQuotesProps> = ({ deal }) => {
  const [quotes, setQuotes] = useState<CRMQuote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<CRMQuote | undefined>();

  const loadQuotes = async () => {
    setIsLoading(true);
    try {
      // Seed products if none exist
      const products = await supabaseCRMService.getProducts();
      if (products.length === 0) {
        const demoProducts = [
          { name: 'Consulenza Strategica', price: 1500, category: 'Servizi' },
          { name: 'Sviluppo Web Core', price: 5000, category: 'Sviluppo' },
          { name: 'Piano Marketing Mensile', price: 800, category: 'Marketing' },
          { name: 'Analisi Dati Avanzata', price: 2500, category: 'Servizi' }
        ];
        for (const p of demoProducts) {
          await supabaseCRMService.saveProduct(p);
        }
      }

      const data = await supabaseCRMService.getQuotes(deal.id);
      setQuotes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuotes();
  }, [deal.id]);

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminare questo preventivo?')) return;
    try {
      await supabaseCRMService.deleteQuote(id);
      setQuotes(quotes.filter(q => q.id !== id));
      toast.success('Preventivo eliminato');
    } catch (e) {
      toast.error('Errore eliminazione');
    }
  };

  const updateStatus = async (id: string, status: CRMQuote['status']) => {
    try {
      await supabaseCRMService.saveQuote({ id, status });
      setQuotes(quotes.map(q => q.id === id ? { ...q, status } : q));
      toast.success(`Stato aggiornato a ${status}`);
    } catch (e) {
      toast.error('Errore aggiornamento stato');
    }
  };

  const getStatusColor = (status: CRMQuote['status']) => {
    switch (status) {
      case 'draft': return 'bg-slate-100 text-slate-500';
      case 'sent': return 'bg-blue-100 text-blue-600';
      case 'accepted': return 'bg-emerald-100 text-emerald-600';
      case 'rejected': return 'bg-rose-100 text-rose-600';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  return (
    <div className="space-y-8 flex flex-col h-full">
      {/* Header Strategico */}
      <div className="flex items-center justify-between p-7 bg-slate-50/50 rounded-[40px] border border-slate-100">
        <div className="flex items-center gap-5">
           <div className="w-14 h-14 rounded-3xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-100">
             <Calculator size={24} />
           </div>
           <div>
             <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter leading-none mb-1">Preventivi</h3>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Creazione ed invio offerte</p>
           </div>
        </div>
        <Button 
          onClick={() => { setSelectedQuote(undefined); setIsModalOpen(true); }}
          className="bg-slate-900 hover:bg-black text-white rounded-2xl text-[10px] uppercase font-black tracking-widest h-12 px-8 shadow-xl shadow-slate-200 flex items-center gap-2 transition-all"
        >
          <Plus size={18} /> Nuovo Preventivo
        </Button>
      </div>

      {/* Quotes List */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
        {isLoading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-slate-300" /></div>
        ) : quotes.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-[40px] bg-slate-50/10">
             <FileText size={48} className="mx-auto text-slate-200 mb-6" />
             <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">Nessun preventivo</h4>
             <p className="text-[10px] text-slate-400 font-bold uppercase">Crea il primo preventivo per questo affare</p>
          </div>
        ) : (
          <div className="space-y-4">
            {quotes.map(quote => (
              <motion.div 
                key={quote.id}
                layoutId={quote.id}
                className="group relative bg-white border border-slate-100 rounded-[32px] p-6 hover:shadow-2xl hover:shadow-slate-100 transition-all duration-500 overflow-hidden"
              >
                <div className="flex items-start justify-between gap-6">
                   <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                         <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusColor(quote.status)}`}>
                           {quote.status}
                         </span>
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                           {format(new Date(quote.created_at), 'dd MMM yyyy', { locale: it })}
                         </span>
                      </div>
                      
                      <h4 className="text-base font-black text-slate-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors mb-2">
                        {quote.title}
                      </h4>
                      
                      <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span className="text-slate-900 font-black">{quote.total_amount.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                        <span>{quote.items.length} Articoli</span>
                      </div>
                   </div>

                   <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {quote.status === 'draft' && (
                        <Button 
                          onClick={() => updateStatus(quote.id, 'sent')}
                          className="bg-blue-600 text-white rounded-xl h-10 px-5 text-[9px] font-black uppercase tracking-widest gap-2"
                        >
                          <Send size={14} /> Invia
                        </Button>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => { setSelectedQuote(quote); setIsModalOpen(true); }}
                          className="w-10 h-10 rounded-xl border-slate-100 text-slate-400 hover:text-blue-600"
                        >
                          <ExternalLink size={16} />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => handleDelete(quote.id)}
                          className="w-10 h-10 rounded-xl border-slate-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                   </div>
                </div>

                {/* Accept/Reject quick actions if sent */}
                {quote.status === 'sent' && (
                  <div className="mt-6 pt-6 border-t border-slate-50 flex items-center gap-4">
                     <Button 
                       onClick={() => updateStatus(quote.id, 'accepted')}
                       className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-2xl h-12 text-[10px] font-black uppercase tracking-widest gap-2"
                     >
                       <CheckCircle2 size={16} /> Accetta
                     </Button>
                     <Button 
                       onClick={() => updateStatus(quote.id, 'rejected')}
                       className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl h-12 text-[10px] font-black uppercase tracking-widest gap-2"
                     >
                       <XCircle size={16} /> Rifiuta
                     </Button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <CreateQuoteModal 
            deal={deal}
            quote={selectedQuote}
            onClose={() => setIsModalOpen(false)}
            onSave={loadQuotes}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Internal icon fix for missing Calculator import in some scopes
const Calculator = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect width="16" height="20" x="4" y="2" rx="2" />
    <line x1="8" x2="16" y1="6" y2="6" />
    <line x1="16" x2="16" y1="14" y2="18" />
    <path d="M16 10h.01" />
    <path d="M12 10h.01" />
    <path d="M8 10h.01" />
    <path d="M12 14h.01" />
    <path d="M8 14h.01" />
    <path d="M12 18h.01" />
    <path d="M8 18h.01" />
  </svg>
);
