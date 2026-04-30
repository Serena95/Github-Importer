import React, { useState, useEffect } from 'react';
import { ClientePreload, PreventivoItem } from '@/types/nexus';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Save, Calculator } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface PageCompilaProps {
  preloadCliente: ClientePreload | null;
  onClienteConsumed: () => void;
}

const PageCompila: React.FC<PageCompilaProps> = ({ preloadCliente, onClienteConsumed }) => {
  const { tenant } = useAuth();
  const [nome, setNome] = useState('');
  const [indirizzo, setIndirizzo] = useState('');
  const [piva, setPiva] = useState('');
  const [email, setEmail] = useState('');
  
  const [items, setItems] = useState<PreventivoItem[]>([
    { id: crypto.randomUUID(), descrizione: '', quantita: 1, prezzo: 0, totale: 0 }
  ]);

  useEffect(() => {
    if (preloadCliente) {
      setNome(preloadCliente.nome);
      setIndirizzo(preloadCliente.indirizzo);
      setPiva(preloadCliente.piva);
      setEmail(preloadCliente.email);
      onClienteConsumed();
      toast.success('Dati cliente caricati');
    }
  }, [preloadCliente, onClienteConsumed]);

  const addItem = () => {
    setItems([...items, { id: crypto.randomUUID(), descrizione: '', quantita: 1, prezzo: 0, totale: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof PreventivoItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantita' || field === 'prezzo') {
          updatedItem.totale = Number(updatedItem.quantita) * Number(updatedItem.prezzo);
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const totalComplessivo = items.reduce((acc, item) => acc + item.totale, 0);

  const handleSave = async () => {
    if (!tenant) return;
    if (!nome || items.some(i => !i.descrizione)) {
      toast.error('Compila tutti i campi obbligatori');
      return;
    }

    try {
      await addDoc(collection(db, 'tenants', tenant.id, 'nexus_preventivi'), {
        tenantId: tenant.id,
        cliente_nome: nome,
        cliente_indirizzo: indirizzo,
        cliente_piva: piva,
        cliente_email: email,
        items: items,
        totale_complessivo: totalComplessivo,
        data_creazione: serverTimestamp()
      });

      toast.success('Preventivo salvato con successo');
      // Reset form
      setNome('');
      setIndirizzo('');
      setPiva('');
      setEmail('');
      setItems([{ id: crypto.randomUUID(), descrizione: '', quantita: 1, prezzo: 0, totale: 0 }]);
    } catch (error: any) {
      console.error('Error saving quote:', error);
      toast.error('Errore durante il salvataggio');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-none shadow-xl bg-white overflow-hidden">
          <CardHeader className="bg-[#004a99] text-white p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold uppercase tracking-tight">
              <Calculator className="w-5 h-5 sm:w-6 sm:h-6" />
              Compilazione Preventivo
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-8 space-y-6 sm:space-y-8">
            {/* Sezione Anagrafica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nome Cliente / Ragione Sociale</Label>
                <Input 
                  value={nome} 
                  onChange={(e) => setNome(e.target.value)} 
                  placeholder="es. Mario Rossi S.r.l."
                  className="bg-slate-50 border-slate-200 focus:ring-[#004a99]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email</Label>
                <Input 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="cliente@esempio.it"
                  className="bg-slate-50 border-slate-200 focus:ring-[#004a99]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Indirizzo</Label>
                <Input 
                  value={indirizzo} 
                  onChange={(e) => setIndirizzo(e.target.value)} 
                  placeholder="Via Roma 1, Milano"
                  className="bg-slate-50 border-slate-200 focus:ring-[#004a99]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Partita IVA / CF</Label>
                <Input 
                  value={piva} 
                  onChange={(e) => setPiva(e.target.value)} 
                  placeholder="01234567890"
                  className="bg-slate-50 border-slate-200 focus:ring-[#004a99]"
                />
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Sezione Righe Preventivo */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Dettagli Preventivo</h3>
                <Button 
                  onClick={addItem} 
                  variant="outline" 
                  size="sm" 
                  className="rounded-full text-[10px] font-bold uppercase tracking-widest border-[#004a99] text-[#004a99] hover:bg-[#004a99] hover:text-white transition-all"
                >
                  <Plus className="w-3 h-3 mr-2" /> Aggiungi Riga
                </Button>
              </div>

              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {items.map((item, index) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex flex-col md:flex-row items-end gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 group relative"
                    >
                      <div className="flex-1 w-full space-y-1">
                        <Label className="text-[9px] font-bold uppercase text-slate-400">Descrizione</Label>
                        <Input 
                          value={item.descrizione} 
                          onChange={(e) => updateItem(item.id, 'descrizione', e.target.value)}
                          placeholder="Descrizione del servizio o prodotto"
                          className="bg-white border-slate-200 focus:ring-[#004a99]"
                        />
                      </div>
                      <div className="w-full md:w-24 space-y-1">
                        <Label className="text-[9px] font-bold uppercase text-slate-400">Qtà</Label>
                        <Input 
                          type="number" 
                          value={item.quantita} 
                          onChange={(e) => updateItem(item.id, 'quantita', parseFloat(e.target.value) || 0)}
                          className="bg-white border-slate-200 focus:ring-[#004a99]"
                        />
                      </div>
                      <div className="w-full md:w-32 space-y-1">
                        <Label className="text-[9px] font-bold uppercase text-slate-400">Prezzo (€)</Label>
                        <Input 
                          type="number" 
                          value={item.prezzo} 
                          onChange={(e) => updateItem(item.id, 'prezzo', parseFloat(e.target.value) || 0)}
                          className="bg-white border-slate-200 focus:ring-[#004a99]"
                        />
                      </div>
                      <div className="w-full md:w-32 space-y-1">
                        <Label className="text-[9px] font-bold uppercase text-slate-400">Totale</Label>
                        <div className="h-10 flex items-center px-3 bg-slate-200/50 rounded-md font-bold text-slate-700 text-sm">
                          € {item.totale.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeItem(item.id)}
                        className="text-slate-400 hover:text-red-500 mb-0.5 transition-colors"
                        disabled={items.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Totale Complessivo */}
            <div className="bg-[#f0f2f5] p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between border border-slate-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#004a99] rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-200">
                  <Calculator className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Totale Preventivo</p>
                  <p className="text-3xl font-black text-[#004a99]">€ {totalComplessivo.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
              <Button 
                onClick={handleSave}
                className="mt-4 md:mt-0 bg-[#004a99] hover:bg-[#003d7a] text-white font-bold rounded-full px-10 py-6 text-xs uppercase tracking-widest shadow-xl shadow-blue-100 transition-all active:scale-95"
              >
                <Save className="w-4 h-4 mr-2" /> Salva Preventivo
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PageCompila;
