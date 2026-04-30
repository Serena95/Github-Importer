import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Save, 
  Calculator, 
  FileText, 
  Hash, 
  Euro,
  Percent,
  Search,
  Package,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CRMDeal, CRMQuote, CRMProduct, QuoteItem } from '@/types/crm';
import { supabaseCRMService } from '@/services/supabaseCRMService';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

interface CreateQuoteModalProps {
  deal: CRMDeal;
  quote?: CRMQuote;
  onClose: () => void;
  onSave: () => void;
}

export const CreateQuoteModal: React.FC<CreateQuoteModalProps> = ({ deal, quote, onClose, onSave }) => {
  const [title, setTitle] = useState(quote?.title || `Preventivo - ${deal.contact}`);
  const [items, setItems] = useState<QuoteItem[]>(quote?.items || []);
  const [notes, setNotes] = useState(quote?.notes || '');
  const [products, setProducts] = useState<CRMProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const data = await supabaseCRMService.getProducts();
        setProducts(data);
        
        // Seed some products if empty (Demo purposes)
        if (data.length === 0) {
           const demoProducts = [
             { name: 'Consulenza Strategica', price: 1500, category: 'Servizi' },
             { name: 'Sviluppo Web Core', price: 5000, category: 'Sviluppo' },
             { name: 'Piano Marketing Mensile', price: 800, category: 'Marketing' },
             { name: 'Analisi Dati Avanzata', price: 2500, category: 'Servizi' }
           ];
           // In actual production we wouldn't auto-seed here daily, but for the turn it's fine
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    loadProducts();
  }, []);

  const addItem = (product?: CRMProduct) => {
    const newItem: QuoteItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: product?.name || '',
      description: product?.description || '',
      quantity: 1,
      price: product?.price || 0,
      tax_rate: 22,
      total: product?.price || 0
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, updates: Partial<QuoteItem>) => {
    setItems(items.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, ...updates };
      updated.total = updated.quantity * updated.price * (1 + updated.tax_rate / 100);
      return updated;
    }));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const taxTotal = items.reduce((sum, item) => sum + (item.total - (item.quantity * item.price)), 0);
  const total = subtotal + taxTotal;

  const handleSave = async () => {
    if (items.length === 0) {
      toast.error('Aggiungi almeno un articolo al preventivo');
      return;
    }

    setIsSaving(true);
    try {
      await supabaseCRMService.saveQuote({
        id: quote?.id,
        deal_id: deal.id,
        title,
        items,
        subtotal,
        tax_amount: taxTotal,
        total_amount: total,
        status: quote?.status || 'draft',
        notes
      });
      toast.success('Preventivo salvato');
      onSave();
      onClose();
    } catch (e) {
      toast.error('Errore nel salvataggio');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-5xl bg-white rounded-[40px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
              {quote ? 'Modifica Preventivo' : 'Nuovo Preventivo'}
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Configurazione offerta commerciale</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            {/* Left: General Info & Items */}
            <div className="lg:col-span-3 space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Titolo Preventivo</label>
                <input 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl h-14 px-6 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-100 transition-all"
                  placeholder="E es. Preventivo Software CRM"
                />
              </div>

              {/* Items List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Articoli e Servizi</h4>
                   <Button 
                    variant="ghost" 
                    onClick={() => addItem()}
                    className="text-[10px] font-black uppercase tracking-widest text-blue-600 gap-2 hover:bg-blue-50"
                   >
                     <Plus size={14} /> Aggiungi Riga
                   </Button>
                </div>

                <div className="space-y-4">
                  {items.map((item, index) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="group grid grid-cols-12 gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 transition-all"
                    >
                      <div className="col-span-5 space-y-2">
                        <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Descrizione</label>
                        <input 
                          value={item.name}
                          onChange={(e) => updateItem(item.id, { name: e.target.value })}
                          className="w-full bg-slate-50 rounded-xl h-10 px-3 text-xs font-bold"
                          placeholder="Nome servizio/prodotto"
                        />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Quantità</label>
                        <input 
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) })}
                          className="w-full bg-slate-50 rounded-xl h-10 px-3 text-xs font-bold"
                        />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Prezzo Un.</label>
                        <div className="relative">
                          <Euro size={10} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input 
                            type="number"
                            value={item.price}
                            onChange={(e) => updateItem(item.id, { price: Number(e.target.value) })}
                            className="w-full bg-slate-50 rounded-xl h-10 pl-7 pr-3 text-xs font-bold"
                          />
                        </div>
                      </div>
                      <div className="col-span-2 space-y-2 text-right">
                        <label className="text-[8px] font-black uppercase text-slate-400 mr-1">Totale (IVA incl.)</label>
                        <div className="h-10 flex items-center justify-end px-3 text-xs font-black text-slate-900">
                          {item.total.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                        </div>
                      </div>
                      <div className="col-span-1 flex items-end justify-center pb-1">
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="p-2 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Note e Condizioni</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-3xl p-6 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-100 transition-all min-h-[120px]"
                  placeholder="Inserisci eventuali note legali o condizioni di pagamento..."
                />
              </div>
            </div>

            {/* Right: Summary & Catalog */}
            <div className="space-y-8">
              <div className="p-8 rounded-[32px] bg-slate-900 text-white space-y-6 shadow-2xl shadow-slate-200">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Riepilogo Totale</h4>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm font-bold opacity-80">
                      <span>Imponibile</span>
                      <span>{subtotal.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold opacity-80">
                      <span>IVA (22%)</span>
                      <span>{taxTotal.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                    <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-widest">Totale</span>
                      <span className="text-2xl font-black">{total.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                 </div>
              </div>

              {/* Product Catalog */}
              <div className="p-6 rounded-[32px] bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                   <Package size={16} className="text-blue-600" />
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Catalogo Rapido</h4>
                </div>
                <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar">
                  {isLoadingProducts ? (
                    <Loader2 size={24} className="animate-spin mx-auto text-slate-300" />
                  ) : products.length === 0 ? (
                    <p className="text-[9px] font-bold text-slate-400 uppercase text-center py-4">Nessun prodotto a listino</p>
                  ) : products.map(product => (
                    <button 
                      key={product.id}
                      onClick={() => addItem(product)}
                      className="w-full p-3 rounded-2xl bg-white border border-transparent hover:border-blue-200 hover:shadow-md transition-all text-left group"
                    >
                      <h5 className="text-[10px] font-black uppercase text-slate-900 truncate mb-1">{product.name}</h5>
                      <div className="flex items-center justify-between text-[9px] font-bold text-slate-400">
                         <span>{product.category}</span>
                         <span className="text-blue-600 group-hover:scale-110 transition-transform">
                           {product.price.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                         </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-100 flex justify-end gap-4 bg-slate-50/50">
           <Button 
            variant="outline" 
            onClick={onClose}
            className="rounded-2xl h-12 px-8 text-[10px] font-black uppercase tracking-widest text-slate-500"
           >
             Annulla
           </Button>
           <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-2xl h-12 px-8 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 gap-2"
           >
             {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
             Salva Preventivo
           </Button>
        </div>
      </motion.div>
    </div>
  );
};
