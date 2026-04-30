import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Send, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Upload, 
  Plus,
  PenTool,
  QrCode,
  ExternalLink,
  Loader2,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CRMDeal, CRMSignature } from '@/types/crm';
import { supabaseCRMService } from '@/services/supabaseCRMService';
import { storageService } from '@/services/storageService';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { toast } from 'sonner';
import { SignaturePad } from './SignaturePad';
import { motion, AnimatePresence } from 'motion/react';

interface DealSignaturesProps {
  deal: CRMDeal;
}

export const DealSignatures: React.FC<DealSignaturesProps> = ({ deal }) => {
  const [signatures, setSignatures] = useState<CRMSignature[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [activeSigningId, setActiveSigningId] = useState<string | null>(null);

  const loadSignatures = async () => {
    setLoading(true);
    try {
      const data = await supabaseCRMService.getSignatures(deal.id);
      setSignatures(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSignatures();
  }, [deal.id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Upload document for signature
      const crmFile = await storageService.uploadFile(file, deal.id, 'deal', 'contract');
      
      // 2. Create signature request
      await supabaseCRMService.saveSignature({
        deal_id: deal.id,
        document_name: file.name,
        document_url: crmFile.url,
        status: 'draft',
        client_name: deal.contact,
        client_email: deal.email
      });
      
      toast.success('Richiesta firma creata');
      loadSignatures();
    } catch (e) {
      toast.error('Errore creazione richiesta');
    } finally {
      setIsUploading(false);
    }
  };

  const updateStatus = async (id: string, status: CRMSignature['status']) => {
    try {
      await supabaseCRMService.saveSignature({ id, status });
      setSignatures(prev => prev.map(s => s.id === id ? { ...s, status } : s));
      toast.success(`Stato aggiornato: ${status}`);
    } catch (e) {
      toast.error('Errore aggiornamento');
    }
  };

  const handleSigned = async (dataUrl: string) => {
    if (!activeSigningId) return;
    
    try {
      await supabaseCRMService.saveSignature({
        id: activeSigningId,
        status: 'signed',
        signed_at: new Date().toISOString(),
        signature_data_url: dataUrl
      });
      toast.success('Documento firmato con successo');
      setActiveSigningId(null);
      loadSignatures();
    } catch (e) {
      toast.error('Errore salvataggio firma');
    }
  };

  const getStatusDisplay = (status: CRMSignature['status']) => {
    switch (status) {
      case 'draft': return { label: 'Bozza', color: 'bg-slate-100 text-slate-500', icon: FileText };
      case 'sent': return { label: 'Inviato', color: 'bg-blue-100 text-blue-600', icon: Send };
      case 'signed': return { label: 'Firmato', color: 'bg-emerald-100 text-emerald-600', icon: CheckCircle2 };
      case 'rejected': return { label: 'Rifiutato', color: 'bg-rose-100 text-rose-600', icon: XCircle };
      default: return { label: status, color: 'bg-slate-100', icon: Clock };
    }
  };

  return (
    <div className="space-y-8 h-full flex flex-col">
      {/* Header Strategico */}
      <div className="flex items-center justify-between p-7 bg-slate-50/50 rounded-[40px] border border-slate-100">
        <div className="flex items-center gap-5">
           <div className="w-14 h-14 rounded-3xl bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-200">
             <PenTool size={24} />
           </div>
           <div>
             <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter leading-none mb-1">E-Signature</h3>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Gestione contrattualistica digitale</p>
           </div>
        </div>
        <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] uppercase font-black tracking-widest h-12 px-8 shadow-xl shadow-blue-100 flex items-center gap-2 transition-all hover:scale-105 active:scale-95">
          {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
          Invia Contratto
          <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
        </label>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
        {loading ? (
          <div className="py-20 text-center animate-pulse text-[10px] font-black uppercase text-slate-400 tracking-widest">Caricamento protocolli...</div>
        ) : signatures.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-[40px] bg-slate-50/20">
              <QrCode size={48} className="mx-auto text-slate-200 mb-6" />
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">Ancora nessun contratto</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Carica un PDF per iniziare il ciclo di firma</p>
          </div>
        ) : (
          <div className="space-y-4">
            {signatures.map(sig => {
              const status = getStatusDisplay(sig.status);
              const StatusIcon = status.icon;
              
              return (
                <div key={sig.id} className="group relative bg-white border border-slate-100 rounded-[32px] p-6 hover:shadow-2xl hover:shadow-slate-100 transition-all duration-500 overflow-hidden">
                  {/* Status Side Accent */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${status.color.split(' ')[0]}`} />
                  
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${status.color}`}>
                          <StatusIcon size={12} />
                          {status.label}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {format(new Date(sig.requested_at), 'dd MMM yyyy', { locale: it })}
                        </span>
                      </div>
                      
                      <h4 className="text-base font-black text-slate-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors mb-2">
                        {sig.document_name}
                      </h4>
                      
                      <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>Richiedente: {deal.assigned_to || 'Admin'}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                        <span>Firmante: {sig.client_name}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                       {sig.status === 'draft' && (
                         <Button 
                          onClick={() => updateStatus(sig.id, 'sent')}
                          className="bg-slate-900 text-white rounded-xl h-10 px-6 text-[10px] font-black uppercase tracking-widest gap-2"
                         >
                           <Send size={14} /> Invia a Cliente
                         </Button>
                       )}
                       {sig.status === 'sent' && (
                         <Button 
                          onClick={() => setActiveSigningId(sig.id)}
                          className="bg-blue-600 text-white rounded-xl h-10 px-6 text-[10px] font-black uppercase tracking-widest gap-2 shadow-lg shadow-blue-100"
                         >
                           <PenTool size={14} /> Firma Ora
                         </Button>
                       )}
                       <a href={sig.document_url} target="_blank" rel="noreferrer" className="flex items-center justify-center h-10 w-full rounded-xl border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all gap-2">
                         <ExternalLink size={14} /> Vedi Doc
                       </a>
                    </div>
                  </div>

                  {/* Signed info footer */}
                  {sig.status === 'signed' && sig.signed_at && (
                    <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                           <CheckCircle2 size={16} />
                         </div>
                         <div>
                           <p className="text-[10px] font-black uppercase text-slate-900">Documento Firmato</p>
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{format(new Date(sig.signed_at), 'dd MMM yyyy HH:mm', { locale: it })}</p>
                         </div>
                       </div>
                       {sig.signature_data_url && (
                         <img src={sig.signature_data_url} alt="Firma" className="h-10 opacity-60 grayscale hover:grayscale-0 transition-all" />
                       )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Signature Modal */}
      <AnimatePresence>
        {activeSigningId && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
              onClick={() => setActiveSigningId(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[48px] shadow-2xl p-10 overflow-hidden"
            >
              <div className="mb-10 text-center">
                 <div className="w-20 h-20 rounded-[32px] bg-slate-900 flex items-center justify-center text-white mx-auto mb-6 shadow-2xl shadow-blue-200">
                    <PenTool size={32} />
                 </div>
                 <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Conferma la Firma</h3>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Stai firmando: {signatures.find(s => s.id === activeSigningId)?.document_name}</p>
              </div>

              <SignaturePad 
                onSave={handleSigned}
                onCancel={() => setActiveSigningId(null)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
