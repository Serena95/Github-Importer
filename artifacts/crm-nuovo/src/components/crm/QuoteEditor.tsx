import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Calculator } from 'lucide-react';
import { Quote, QuoteItem, NexusClient, Contact, Company, Deal } from '@/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface QuoteEditorProps {
  isOpen: boolean;
  onClose: () => void;
  quote?: Quote | null;
  initialClientId?: string;
}

export const QuoteEditor: React.FC<QuoteEditorProps> = ({ isOpen, onClose, quote, initialClientId }) => {
  const { tenant } = useAuth();
  const [titolo, setTitolo] = useState('');
  const [descrizione, setDescrizione] = useState('');
  const [stato, setStato] = useState<'bozza' | 'inviato' | 'accettato' | 'rifiutato'>('bozza');
  const [cliente_id, setCliente_id] = useState('');
  const [azienda_id, setAzienda_id] = useState('');
  const [deal_id, setDeal_id] = useState('');
  const [prodotti, setProdotti] = useState<QuoteItem[]>([]);
  const [servizi, setServizi] = useState<QuoteItem[]>([]);
  const [note, setNote] = useState('');
  const [termini_pagamento, setTermini_pagamento] = useState('');
  const [iban, setIban] = useState('');
  const [validita, setValidita] = useState('');
  const [valuta, setValuta] = useState('EUR');

  // Data for selection
  const [clients, setClients] = useState<NexusClient[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);

  useEffect(() => {
    if (quote) {
      setTitolo(quote.titolo);
      setDescrizione(quote.descrizione || '');
      setStato(quote.stato);
      setCliente_id(quote.cliente_id);
      setAzienda_id(quote.azienda_id || '');
      setDeal_id(quote.deal_id || '');
      setProdotti(quote.prodotti || []);
      setServizi(quote.servizi || []);
      setNote(quote.note || '');
      setTermini_pagamento(quote.termini_pagamento || '');
      setIban(quote.iban || '');
      setValidita(quote.validita || '');
      setValuta(quote.valuta);
    } else {
      setTitolo('');
      setDescrizione('');
      setStato('bozza');
      setCliente_id(initialClientId || '');
      setAzienda_id('');
      setDeal_id('');
      setProdotti([]);
      setServizi([]);
      setNote('');
      setTermini_pagamento('');
      setIban('');
      setValidita('');
      setValuta('EUR');
    }
  }, [quote, initialClientId, isOpen]);

  useEffect(() => {
    if (!tenant || !isOpen) return;
    
    const unsubClients = onSnapshot(collection(db, 'tenants', tenant.id, 'client_records'), (snap) => {
      setClients(snap.docs.map(d => ({ id: d.id, ...d.data() } as NexusClient)));
    });
    const unsubCompanies = onSnapshot(collection(db, 'tenants', tenant.id, 'companies'), (snap) => {
      setCompanies(snap.docs.map(d => ({ id: d.id, ...d.data() } as Company)));
    });
    const unsubDeals = onSnapshot(collection(db, 'tenants', tenant.id, 'deals'), (snap) => {
      setDeals(snap.docs.map(d => ({ id: d.id, ...d.data() } as Deal)));
    });

    return () => { unsubClients(); unsubCompanies(); unsubDeals(); };
  }, [tenant, isOpen]);

  const addItem = (type: 'prodotti' | 'servizi') => {
    const newItem: QuoteItem = {
      id: Math.random().toString(36).substring(7),
      description: '',
      quantity: 1,
      unit: 'cad.',
      price: 0,
      discount: 0,
      tax: 22,
      total: 0
    };
    if (type === 'prodotti') setProdotti([...prodotti, newItem]);
    else setServizi([...servizi, newItem]);
  };

  const removeItem = (id: string, type: 'prodotti' | 'servizi') => {
    if (type === 'prodotti') setProdotti(prodotti.filter(i => i.id !== id));
    else setServizi(servizi.filter(i => i.id !== id));
  };

  const updateItem = (id: string, field: keyof QuoteItem, value: any, type: 'prodotti' | 'servizi') => {
    const list = type === 'prodotti' ? prodotti : servizi;
    const newList = list.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'price' || field === 'quantity' || field === 'tax' || field === 'discount') {
          const price = field === 'price' ? value : item.price;
          const qty = field === 'quantity' ? value : item.quantity;
          const tax = field === 'tax' ? value : item.tax;
          const discount = field === 'discount' ? value : item.discount;
          
          const subtotal = price * qty;
          const discounted = subtotal * (1 - discount / 100);
          updated.total = discounted * (1 + tax / 100);
        }
        return updated;
      }
      return item;
    });
    if (type === 'prodotti') setProdotti(newList);
    else setServizi(newList);
  };

  const calculateTotal = () => {
    const pTotal = prodotti.reduce((acc, item) => acc + item.total, 0);
    const sTotal = servizi.reduce((acc, item) => acc + item.total, 0);
    return pTotal + sTotal;
  };

  const handleSave = async () => {
    if (!tenant) return;
    if (!titolo || !cliente_id) {
      toast.error('Titolo e Cliente sono obbligatori');
      return;
    }

    const data = {
      tenantId: tenant.id,
      cliente_id,
      azienda_id: azienda_id || null,
      deal_id: deal_id || null,
      titolo,
      descrizione,
      stato,
      totale: calculateTotal(),
      valuta,
      prodotti,
      servizi,
      note,
      termini_pagamento,
      iban,
      validita,
      updatedAt: serverTimestamp(),
      allegati: quote?.allegati || []
    };

    try {
      if (quote) {
        await updateDoc(doc(db, 'tenants', tenant.id, 'quotes', quote.id), data);
        toast.success('Preventivo aggiornato');
      } else {
        await addDoc(collection(db, 'tenants', tenant.id, 'quotes'), {
          ...data,
          data_creazione: serverTimestamp()
        });
        toast.success('Preventivo creato');
      }
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Errore durante il salvataggio');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold uppercase tracking-tight">
            {quote ? 'Modifica Preventivo' : 'Nuovo Preventivo'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Titolo Preventivo</Label>
              <Input value={titolo} onChange={(e) => setTitolo(e.target.value)} placeholder="es. Fornitura Software 2024" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Descrizione</Label>
              <Textarea value={descrizione} onChange={(e) => setDescrizione(e.target.value)} placeholder="Dettagli aggiuntivi..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Stato</Label>
                <Select value={stato} onValueChange={(v: any) => setStato(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bozza">Bozza</SelectItem>
                    <SelectItem value="inviato">Inviato</SelectItem>
                    <SelectItem value="accettato">Accettato</SelectItem>
                    <SelectItem value="rifiutato">Rifiutato</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Valuta</Label>
                <Select value={valuta} onValueChange={setValuta}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cliente Nexus (Obbligatorio)</Label>
              <Select value={cliente_id} onValueChange={setCliente_id}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Azienda Collegata</Label>
              <Select value={azienda_id} onValueChange={setAzienda_id}>
                <SelectTrigger>
                  <SelectValue placeholder="Nessuna azienda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nessuna</SelectItem>
                  {companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Affare / Opportunità</Label>
              <Select value={deal_id} onValueChange={setDeal_id}>
                <SelectTrigger>
                  <SelectValue placeholder="Nessun affare" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nessuno</SelectItem>
                  {deals.map(d => <SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-8">
          {/* Prodotti */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Prodotti</h3>
              <Button onClick={() => addItem('prodotti')} size="sm" variant="outline" className="text-[10px] font-bold uppercase tracking-widest">
                <Plus size={14} className="mr-2" /> AGGIUNGI PRODOTTO
              </Button>
            </div>
            <div className="space-y-3">
              {prodotti.map((item) => (
                <div key={item.id} className="flex items-end gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 group">
                  <div className="flex-1 space-y-1">
                    <Label className="text-[9px] font-bold uppercase text-slate-400">Descrizione</Label>
                    <Input 
                      value={item.description} 
                      onChange={(e) => updateItem(item.id, 'description', e.target.value, 'prodotti')}
                      className="bg-white border-slate-200"
                    />
                  </div>
                  <div className="w-20 space-y-1">
                    <Label className="text-[9px] font-bold uppercase text-slate-400">Qtà</Label>
                    <Input 
                      type="number" 
                      value={item.quantity} 
                      onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value), 'prodotti')}
                      className="bg-white border-slate-200"
                    />
                  </div>
                  <div className="w-20 space-y-1">
                    <Label className="text-[9px] font-bold uppercase text-slate-400">Unità</Label>
                    <Input 
                      value={item.unit} 
                      onChange={(e) => updateItem(item.id, 'unit', e.target.value, 'prodotti')}
                      className="bg-white border-slate-200"
                      placeholder="cad."
                    />
                  </div>
                  <div className="w-24 space-y-1">
                    <Label className="text-[9px] font-bold uppercase text-slate-400">Prezzo</Label>
                    <Input 
                      type="number" 
                      value={item.price} 
                      onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value), 'prodotti')}
                      className="bg-white border-slate-200"
                    />
                  </div>
                  <div className="w-20 space-y-1">
                    <Label className="text-[9px] font-bold uppercase text-slate-400">Sconto %</Label>
                    <Input 
                      type="number" 
                      value={item.discount} 
                      onChange={(e) => updateItem(item.id, 'discount', parseFloat(e.target.value), 'prodotti')}
                      className="bg-white border-slate-200"
                    />
                  </div>
                  <div className="w-20 space-y-1">
                    <Label className="text-[9px] font-bold uppercase text-slate-400">IVA %</Label>
                    <Input 
                      type="number" 
                      value={item.tax} 
                      onChange={(e) => updateItem(item.id, 'tax', parseFloat(e.target.value), 'prodotti')}
                      className="bg-white border-slate-200"
                    />
                  </div>
                  <div className="w-32 space-y-1">
                    <Label className="text-[9px] font-bold uppercase text-slate-400">Totale</Label>
                    <div className="h-10 flex items-center px-3 bg-slate-100 rounded-md font-bold text-slate-700 text-sm">
                      {item.total.toFixed(2)}
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeItem(item.id, 'prodotti')}
                    className="text-slate-400 hover:text-red-500 mb-0.5"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Servizi */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Servizi</h3>
              <Button onClick={() => addItem('servizi')} size="sm" variant="outline" className="text-[10px] font-bold uppercase tracking-widest">
                <Plus size={14} className="mr-2" /> AGGIUNGI SERVIZIO
              </Button>
            </div>
            <div className="space-y-3">
              {servizi.map((item) => (
                <div key={item.id} className="flex items-end gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 group">
                  <div className="flex-1 space-y-1">
                    <Label className="text-[9px] font-bold uppercase text-slate-400">Descrizione</Label>
                    <Input 
                      value={item.description} 
                      onChange={(e) => updateItem(item.id, 'description', e.target.value, 'servizi')}
                      className="bg-white border-slate-200"
                    />
                  </div>
                  <div className="w-20 space-y-1">
                    <Label className="text-[9px] font-bold uppercase text-slate-400">Qtà</Label>
                    <Input 
                      type="number" 
                      value={item.quantity} 
                      onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value), 'servizi')}
                      className="bg-white border-slate-200"
                    />
                  </div>
                  <div className="w-20 space-y-1">
                    <Label className="text-[9px] font-bold uppercase text-slate-400">Unità</Label>
                    <Input 
                      value={item.unit} 
                      onChange={(e) => updateItem(item.id, 'unit', e.target.value, 'servizi')}
                      className="bg-white border-slate-200"
                      placeholder="ore"
                    />
                  </div>
                  <div className="w-24 space-y-1">
                    <Label className="text-[9px] font-bold uppercase text-slate-400">Prezzo</Label>
                    <Input 
                      type="number" 
                      value={item.price} 
                      onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value), 'servizi')}
                      className="bg-white border-slate-200"
                    />
                  </div>
                  <div className="w-20 space-y-1">
                    <Label className="text-[9px] font-bold uppercase text-slate-400">Sconto %</Label>
                    <Input 
                      type="number" 
                      value={item.discount} 
                      onChange={(e) => updateItem(item.id, 'discount', parseFloat(e.target.value), 'servizi')}
                      className="bg-white border-slate-200"
                    />
                  </div>
                  <div className="w-20 space-y-1">
                    <Label className="text-[9px] font-bold uppercase text-slate-400">IVA %</Label>
                    <Input 
                      type="number" 
                      value={item.tax} 
                      onChange={(e) => updateItem(item.id, 'tax', parseFloat(e.target.value), 'servizi')}
                      className="bg-white border-slate-200"
                    />
                  </div>
                  <div className="w-32 space-y-1">
                    <Label className="text-[9px] font-bold uppercase text-slate-400">Totale</Label>
                    <div className="h-10 flex items-center px-3 bg-slate-100 rounded-md font-bold text-slate-700 text-sm">
                      {item.total.toFixed(2)}
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeItem(item.id, 'servizi')}
                    className="text-slate-400 hover:text-red-500 mb-0.5"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-between">
          <div className="flex items-center gap-3 text-blue-600">
            <Calculator size={24} />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Riepilogo Totale</p>
              <p className="text-2xl font-black">{calculateTotal().toFixed(2)} {valuta}</p>
            </div>
          </div>
          <div className="flex-1 max-w-md ml-8 grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-[9px] font-bold uppercase text-slate-400">Termini Pagamento</Label>
              <Input value={termini_pagamento} onChange={(e) => setTermini_pagamento(e.target.value)} className="bg-white h-8 text-xs" placeholder="es. Bonifico 30gg" />
            </div>
            <div className="space-y-1">
              <Label className="text-[9px] font-bold uppercase text-slate-400">Validità Offerta</Label>
              <Input value={validita} onChange={(e) => setValidita(e.target.value)} className="bg-white h-8 text-xs" placeholder="es. 30 giorni" />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-[9px] font-bold uppercase text-slate-400">IBAN per Pagamento</Label>
              <Input value={iban} onChange={(e) => setIban(e.target.value)} className="bg-white h-8 text-xs" placeholder="IT00..." />
            </div>
          </div>
          <div className="text-right ml-8">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Note Interne</Label>
            <Textarea 
              value={note} 
              onChange={(e) => setNote(e.target.value)} 
              className="mt-2 bg-white border-blue-100 min-h-[60px] w-64 text-xs"
              placeholder="Note non visibili nel PDF..."
            />
          </div>
        </div>

        <DialogFooter className="mt-8">
          <Button variant="ghost" onClick={onClose} className="font-bold uppercase tracking-widest text-[10px]">Annulla</Button>
          <Button onClick={handleSave} className="bg-[#2FC6F6] hover:bg-[#1eb0e0] text-white font-bold rounded-full px-8 uppercase tracking-widest text-[10px]">
            {quote ? 'SALVA MODIFICHE' : 'CREA PREVENTIVO'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
