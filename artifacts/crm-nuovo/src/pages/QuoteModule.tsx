import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  deleteDoc,
  doc,
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Quote, NexusClient, Company, Deal } from '@/types';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal, 
  FileText, 
  Trash2, 
  Copy, 
  FileSignature,
  ExternalLink,
  ChevronLeft,
  TrendingUp
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';
import { QuoteEditor } from '@/components/crm/QuoteEditor';
import { generateQuotePDF } from '@/lib/pdf-generator';
import { toast } from 'sonner';

const QuoteModule: React.FC = () => {
  const { tenant } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [clients, setClients] = useState<NexusClient[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!tenant) return;

    const unsubQuotes = onSnapshot(collection(db, 'tenants', tenant.id, 'quotes'), (snap) => {
      setQuotes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quote)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `tenants/${tenant.id}/quotes`));

    const unsubClients = onSnapshot(collection(db, 'tenants', tenant.id, 'client_records'), (snap) => {
      setClients(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as NexusClient)));
    });

    const unsubCompanies = onSnapshot(collection(db, 'tenants', tenant.id, 'companies'), (snap) => {
      setCompanies(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Company)));
    });

    const unsubDeals = onSnapshot(collection(db, 'tenants', tenant.id, 'deals'), (snap) => {
      setDeals(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Deal)));
    });

    return () => {
      unsubQuotes();
      unsubClients();
      unsubCompanies();
      unsubDeals();
    };
  }, [tenant]);

  const handleDelete = async () => {
    if (!tenant || !deleteId) return;
    try {
      await deleteDoc(doc(db, 'tenants', tenant.id, 'quotes', deleteId));
      toast.success('Preventivo eliminato');
      setDeleteId(null);
    } catch (error) {
      toast.error('Errore durante l\'eliminazione');
    }
  };

  const handleDuplicate = async (quote: Quote) => {
    if (!tenant) return;
    try {
      const { id, data_creazione, ...rest } = quote;
      await addDoc(collection(db, 'tenants', tenant.id, 'quotes'), {
        ...rest,
        titolo: `${rest.titolo} (Copia)`,
        stato: 'bozza',
        data_creazione: serverTimestamp()
      });
      toast.success('Preventivo duplicato');
    } catch (error) {
      toast.error('Errore durante la duplicazione');
    }
  };

  const handleDownloadPDF = (quote: Quote) => {
    const client = clients.find(c => c.id === quote.cliente_id);
    // In a real app we might want to fetch the full contact/company details
    // For now we pass what we have
    generateQuotePDF(quote, client as any);
  };

  const filteredQuotes = quotes.filter(q => 
    q.titolo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    clients.find(c => c.id === q.cliente_id)?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'bozza': return <Badge className="bg-slate-100 text-slate-600 border-none uppercase">BOZZA</Badge>;
      case 'inviato': return <Badge className="bg-blue-100 text-blue-600 border-none uppercase">INVIATO</Badge>;
      case 'accettato': return <Badge className="bg-emerald-100 text-emerald-600 border-none uppercase">ACCETTATO</Badge>;
      case 'rifiutato': return <Badge className="bg-red-100 text-red-600 border-none uppercase">RIFIUTATO</Badge>;
      default: return <Badge className="uppercase">{status}</Badge>;
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#f5f7fb]">
      <div className="bg-white border-b border-slate-200 px-8 py-6 shrink-0 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Preventivi</h1>
            <p className="text-sm text-slate-400 font-medium mt-1">Gestione offerte commerciali e preventivi PDF.</p>
          </div>
          <div className="flex gap-3">
            <div className="relative group w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={14} />
              <Input 
                placeholder="Cerca preventivi o clienti..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-slate-50 border-none shadow-sm h-9 rounded-full text-xs focus-visible:ring-2 focus-visible:ring-blue-400/30"
              />
            </div>
            <Button variant="outline" size="sm" className="rounded-full px-4 font-bold text-[10px] uppercase tracking-widest border-slate-200">
              <Filter size={12} className="mr-2" /> FILTRI
            </Button>
            <Button 
              onClick={() => { setSelectedQuote(null); setIsEditorOpen(true); }}
              className="bg-[#2FC6F6] hover:bg-[#1eb0e0] text-white font-bold rounded-full px-6 text-[10px] uppercase tracking-widest shadow-lg shadow-blue-200"
            >
              <Plus size={12} className="mr-2" /> NUOVO PREVENTIVO
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 lg:p-8 overflow-auto">
        <div className="max-w-[1400px] mx-auto space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/10">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {filteredQuotes.length} Preventivi trovati
              </span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-bold text-slate-400 uppercase">Sistema Online</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-16">#</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Stato</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Titolo</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Totale</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredQuotes.map((quote, index) => (
                    <tr key={quote.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-6 py-4 text-center">
                        <span className="text-[10px] font-black text-slate-300">{(index + 1).toString().padStart(2, '0')}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(quote.stato)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500 shrink-0">
                            <FileText size={16} />
                          </div>
                          <span className="font-bold text-slate-700 truncate max-w-[200px]">{quote.titolo}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <p className="text-sm font-bold text-slate-700 truncate">
                            {clients.find(c => c.id === quote.cliente_id)?.name || 'Cliente Nexus'}
                          </p>
                          {quote.azienda_id && (
                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">
                              {companies.find(c => c.id === quote.azienda_id)?.name}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-black text-slate-800">
                        {quote.totale.toFixed(2)} {quote.valuta}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400 font-medium">
                        {quote.data_creazione ? new Date(quote.data_creazione.seconds * 1000).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '--'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDownloadPDF(quote)}
                            className="h-8 w-8 text-blue-500 hover:bg-blue-50"
                            title="Scarica PDF"
                          >
                            <Download size={16} />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-800">
                                <MoreHorizontal size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => { setSelectedQuote(quote); setIsEditorOpen(true); }}>
                                <FileSignature size={14} className="mr-2" /> Modifica
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicate(quote)}>
                                <Copy size={14} className="mr-2" /> Duplica
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600" onClick={() => setDeleteId(quote.id)}>
                                <Trash2 size={14} className="mr-2" /> Elimina
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredQuotes.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                            <Plus size={24} className="rotate-45" />
                          </div>
                          <span className="text-sm text-slate-400 font-medium italic">Nessun preventivo trovato nel archivio.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Totale Emesso</span>
                <span className="text-2xl font-black text-slate-800 tracking-tight">€{filteredQuotes.reduce((a, b) => a + b.totale, 0).toLocaleString()}</span>
             </div>
             <div className="bg-emerald-500 p-6 rounded-2xl border border-emerald-400 shadow-xl shadow-emerald-100 text-white">
                <span className="text-[10px] font-black opacity-80 uppercase tracking-widest block mb-2">Preventivi Accettati</span>
                <span className="text-2xl font-black tracking-tight">{filteredQuotes.filter(q => q.stato === 'accettato').length}</span>
             </div>
             <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Efficienza Conversion</span>
                  <span className="text-2xl font-black text-slate-800 tracking-tight">
                    {filteredQuotes.length > 0 ? ((filteredQuotes.filter(q => q.stato === 'accettato').length / filteredQuotes.length) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                  <TrendingUp size={20} />
                </div>
             </div>
          </div>
        </div>
      </div>

      <QuoteEditor 
        isOpen={isEditorOpen} 
        onClose={() => setIsEditorOpen(false)} 
        quote={selectedQuote} 
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-slate-800">Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium">
              Questa azione non può essere annullata. Il preventivo verrà eliminato definitivamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel 
              className="rounded-full font-bold border-slate-200"
              variant="outline"
            >
              Annulla
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="rounded-full font-bold bg-red-500 hover:bg-red-600 shadow-lg shadow-red-100"
            >
              Elimina Definitivamente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default QuoteModule;
