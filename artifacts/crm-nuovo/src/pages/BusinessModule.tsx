import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { NexusRecord, NexusClient } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter, Download, MoreHorizontal, List as ListIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';

interface BusinessModuleProps {
  sectionId: string;
  title: string;
}

const BusinessModule: React.FC<BusinessModuleProps> = ({ sectionId, title }) => {
  const { tenant } = useAuth();
  const [records, setRecords] = useState<NexusRecord[]>([]);
  const [clients, setClients] = useState<NexusClient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!tenant) return;

    const collectionName = sectionId === 'general' ? 'client_records' : `nexus_${sectionId}`;
    const unsub = onSnapshot(collection(db, 'tenants', tenant.id, collectionName), (snap) => {
      setRecords(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as NexusRecord)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `tenants/${tenant.id}/${collectionName}`));

    // Also fetch clients for linking if not in general
    if (sectionId !== 'general') {
      const unsubClients = onSnapshot(collection(db, 'tenants', tenant.id, 'client_records'), (snap) => {
        setClients(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as NexusClient)));
      }, (error) => handleFirestoreError(error, OperationType.LIST, `tenants/${tenant.id}/client_records`));
      return () => { unsub(); unsubClients(); };
    }

    return () => unsub();
  }, [tenant, sectionId]);

  const handleAddRecord = async () => {
    if (!tenant) return;
    const collectionName = sectionId === 'general' ? 'client_records' : `nexus_${sectionId}`;
    await addDoc(collection(db, 'tenants', tenant.id, collectionName), {
      tenantId: tenant.id,
      title: `Nuovo record ${title}`,
      name: sectionId === 'general' ? `Nuovo Cliente Nexus` : undefined,
      clientId: sectionId === 'general' ? undefined : (clients[0]?.id || 'default'),
      status: 'Nuovo',
      createdAt: serverTimestamp()
    });
  };

  return (
    <div className="h-full flex flex-col bg-[#f5f7fb]">
      <div className="bg-white border-b border-slate-200 px-8 py-6 shrink-0 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800 uppercase tracking-tight">{title}</h1>
            <p className="text-sm text-slate-400 font-medium mt-1">Gestione {title} per Cliente Nexus.</p>
          </div>
          <div className="flex gap-3">
            <div className="relative group w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={14} />
              <Input 
                placeholder="Cerca..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-slate-50 border-none shadow-sm h-9 rounded-full text-xs focus-visible:ring-2 focus-visible:ring-blue-400/30"
              />
            </div>
            <Button variant="outline" size="sm" className="rounded-full px-4 font-bold text-[10px] uppercase tracking-widest border-slate-200">
              <Filter size={12} className="mr-2" /> FILTRI
            </Button>
            <Button 
              onClick={handleAddRecord}
              className="bg-[#2FC6F6] hover:bg-[#1eb0e0] text-white font-bold rounded-full px-6 text-[10px] uppercase tracking-widest shadow-lg shadow-blue-200"
            >
              <Plus size={12} className="mr-2" /> AGGIUNGI
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {records.length} Elementi trovati
            </span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-white">
                <Download size={12} className="mr-2" /> ESPORTA
              </Button>
            </div>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Titolo / Nome</th>
                {sectionId !== 'general' && <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>}
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stato</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Creato il</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-6 py-4 font-bold text-slate-700">
                    {sectionId === 'general' ? (record as any).name : record.title}
                  </td>
                  {sectionId !== 'general' && (
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {clients.find(c => c.id === record.clientId)?.name || 'Cliente Nexus'}
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <Badge className="bg-blue-50 text-blue-600 border-none text-[9px] font-bold uppercase">
                      {record.status || 'Nuovo'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    {record.createdAt ? new Date(record.createdAt.seconds * 1000).toLocaleDateString() : '--'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-800">
                      <MoreHorizontal size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic text-sm">
                    Nessun record trovato in questa sezione.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BusinessModule;
