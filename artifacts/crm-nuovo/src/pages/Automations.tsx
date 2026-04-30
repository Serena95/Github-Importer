import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Automation } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Zap, 
  Play, 
  Settings, 
  Trash2, 
  Mail, 
  MessageSquare, 
  UserPlus, 
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';

const Automations: React.FC = () => {
  const { tenant } = useAuth();
  const [automations, setAutomations] = useState<Automation[]>([]);

  useEffect(() => {
    if (!tenant) return;

    const unsub = onSnapshot(collection(db, 'tenants', tenant.id, 'automations'), (snap) => {
      setAutomations(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Automation)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `tenants/${tenant.id}/automations`));

    return () => unsub();
  }, [tenant]);

  const defaultAutomations = [
    {
      id: '1',
      name: 'Benvenuto Nuovi Lead',
      trigger: { type: 'lead_created', label: 'Quando un nuovo lead viene creato' },
      actions: [
        { type: 'send_email', label: 'Invia email di benvenuto' },
        { type: 'create_task', label: 'Crea task: Primo contatto' }
      ],
      active: true
    },
    {
      id: '2',
      name: 'Follow-up Deal Inattivo',
      trigger: { type: 'inactivity', label: 'Se il deal è inattivo per 3 giorni' },
      actions: [
        { type: 'notify', label: 'Notifica responsabile' },
        { type: 'assign_user', label: 'Riassegna a Manager' }
      ],
      active: false
    }
  ];

  const displayAutomations = automations.length > 0 ? automations : defaultAutomations;

  return (
    <div className="h-full flex flex-col bg-[#f5f7fb]">
      {/* Automations Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 shrink-0 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
              <Zap className="text-amber-500 fill-amber-500" size={20} />
              Automazioni CRM
            </h1>
            <p className="text-sm text-slate-400 font-medium mt-1">Automatizza i tuoi processi di vendita e risparmia tempo.</p>
          </div>
          <Button className="bg-[#2FC6F6] hover:bg-[#1eb0e0] text-white font-bold rounded-full px-8 text-xs shadow-lg shadow-blue-200">
            <Plus size={16} className="mr-2" />
            CREA AUTOMAZIONE
          </Button>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayAutomations.map((auto: any) => (
              <Card key={auto.id} className="border-none shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all group">
                <CardHeader className="bg-white border-b border-slate-50 p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg",
                        auto.active ? "bg-blue-500 shadow-blue-100" : "bg-slate-300 shadow-slate-100"
                      )}>
                        <Zap size={20} />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold text-slate-800">{auto.name}</CardTitle>
                        <Badge variant="secondary" className="mt-1 bg-slate-100 text-slate-500 border-none text-[9px] font-bold uppercase tracking-wider">
                          {auto.active ? 'Attiva' : 'Disattivata'}
                        </Badge>
                      </div>
                    </div>
                    <Switch checked={auto.active} />
                  </div>
                </CardHeader>
                <CardContent className="p-6 bg-slate-50/50">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-blue-500 shadow-sm border border-slate-100">
                        <Play size={14} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trigger</p>
                        <p className="text-xs font-bold text-slate-700">{auto.trigger.label}</p>
                      </div>
                    </div>

                    <div className="ml-4 border-l-2 border-dashed border-slate-200 pl-7 py-2 space-y-4">
                      {auto.actions.map((action: any, i: number) => (
                        <div key={i} className="flex items-center gap-3 relative">
                          <div className="absolute -left-[33px] w-3 h-3 bg-slate-200 rounded-full border-2 border-white"></div>
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-emerald-500 shadow-sm border border-slate-100">
                            {action.type === 'send_email' ? <Mail size={14} /> : <CheckCircle2 size={14} />}
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Azione {i + 1}</p>
                            <p className="text-xs font-bold text-slate-700">{action.label}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <Clock size={12} />
                      <span>Ultima esecuzione: 2 ore fa</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-slate-600">
                        <Settings size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-rose-500">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <button className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 text-slate-300 hover:border-blue-400 hover:text-blue-400 transition-all group bg-white/30">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-50 transition-colors">
                <Plus size={24} className="group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest">Nuova Automazione</span>
              <p className="text-[10px] font-medium mt-1 text-slate-400">Trascina trigger e azioni per iniziare</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Automations;
