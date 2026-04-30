import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { Preventivo } from '@/types/nexus';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, User, Euro, Download, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

const PageArchivio: React.FC = () => {
  const { tenant } = useAuth();
  const [preventivi, setPreventivi] = useState<Preventivo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!tenant) return;

    const q = query(
      collection(db, 'tenants', tenant.id, 'nexus_preventivi'),
      orderBy('data_creazione', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      setPreventivi(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Preventivo)));
      setIsLoading(false);
    });

    return () => unsub();
  }, [tenant]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#004a99] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#004a99] uppercase tracking-tight">Archivio Documenti</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">Storico dei preventivi generati e salvati.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <Input placeholder="Cerca preventivo..." className="pl-10 bg-white border-slate-200 rounded-full h-9 sm:h-10 text-xs sm:text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {preventivi && preventivi.length > 0 ? (
          preventivi.map((p, index) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden group">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row items-stretch">
                    <div className="bg-slate-50 p-6 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-slate-100 min-w-[140px]">
                      <FileText className="w-8 h-8 text-[#004a99] mb-2" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Doc #{(p.id || '').substring(0, 6)}</span>
                    </div>
                    <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <User size={12} /> Cliente
                        </div>
                        <p className="font-bold text-slate-800">{p.cliente_nome}</p>
                        <p className="text-xs text-slate-500">{p.cliente_email}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <Calendar size={12} /> Data Creazione
                        </div>
                        <p className="font-bold text-slate-800">
                          {p.data_creazione ? new Date(p.data_creazione).toLocaleDateString('it-IT') : '--'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {p.data_creazione ? new Date(p.data_creazione).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : '--'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <Euro size={12} /> Importo Totale
                        </div>
                        <p className="text-xl font-black text-[#004a99]">
                          € {p.totale_complessivo.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                        </p>
                        <Badge className="bg-green-50 text-green-600 border-none text-[9px] font-bold uppercase mt-1">
                          Completato
                        </Badge>
                      </div>
                    </div>
                    <div className="p-6 flex items-center justify-end bg-slate-50/50">
                      <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-[#004a99] hover:border-[#004a99] transition-all shadow-sm">
                        <Download size={20} />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-medium italic">Nessun preventivo trovato in archivio.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageArchivio;
