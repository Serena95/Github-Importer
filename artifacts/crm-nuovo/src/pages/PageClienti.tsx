import React from 'react';
import { ClientePreload } from '@/types/nexus';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, ArrowRight, Mail, MapPin, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

interface PageClientiProps {
  onSelectCliente: (cliente: ClientePreload) => void;
}

const MOCK_CLIENTI: ClientePreload[] = [
  { nome: 'Mario Rossi S.r.l.', indirizzo: 'Via Roma 1, Milano', piva: '01234567890', email: 'mario@rossi.it' },
  { nome: 'Nexus Service', indirizzo: 'Via del Mare 10, Salerno', piva: '09876543211', email: 'info@nexus.it' },
  { nome: 'Nexus Consulting', indirizzo: 'Corso Vittorio 5, Napoli', piva: '11223344556', email: 'admin@nexus.com' },
];

const PageClienti: React.FC<PageClientiProps> = ({ onSelectCliente }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col gap-2 mb-4 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-black text-[#004a99] uppercase tracking-tight">Selezione Anagrafica</h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">Seleziona un cliente per iniziare la compilazione del preventivo.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_CLIENTI.map((cliente, index) => (
          <motion.div
            key={cliente.piva}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="group hover:border-[#004a99] transition-all cursor-pointer border-slate-200 shadow-sm hover:shadow-md overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-[#004a99] transition-colors">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 group-hover:text-[#004a99] transition-colors">{cliente.nome}</h3>
                      <div className="flex flex-col gap-1 mt-2">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Mail className="w-3 h-3" /> {cliente.email}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <MapPin className="w-3 h-3" /> {cliente.indirizzo}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <FileText className="w-3 h-3" /> P.IVA: {cliente.piva}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => onSelectCliente(cliente)}
                  className="w-full mt-6 bg-slate-50 hover:bg-[#004a99] text-slate-600 hover:text-white font-bold rounded-xl py-6 text-[10px] uppercase tracking-widest transition-all"
                >
                  Seleziona Cliente <ArrowRight className="w-3 h-3 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PageClienti;
