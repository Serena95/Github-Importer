import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Zap, Bot, Workflow, Plus, Play, Pause, Trash2, Settings, Edit2,
  ChevronRight, ArrowRight, Clock, Mail, MessageSquare, UserPlus,
  CheckCircle2, AlertCircle, Bell, Tag, DollarSign, RefreshCw,
  ToggleLeft, ToggleRight, Copy,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';

type Section = 'workflow' | 'triggers' | 'robots';
const PATH_MAP: Record<string, Section> = {
  '/automation': 'workflow', '/automation/workflow': 'workflow',
  '/automation/triggers': 'triggers', '/automation/robots': 'robots',
};
const NAV = [
  { id: 'workflow', label: 'Workflow',  icon: Workflow, path: '/automation/workflow' },
  { id: 'triggers', label: 'Trigger',   icon: Zap,      path: '/automation/triggers' },
  { id: 'robots',   label: 'Robot',     icon: Bot,      path: '/automation/robots' },
];

const TRIGGER_ICONS: Record<string, React.ElementType> = {
  lead_created: UserPlus, deal_updated: DollarSign, inactivity: Clock,
  email_opened: Mail, task_completed: CheckCircle2, contact_created: UserPlus,
};

const WORKFLOWS = [
  {
    id: '1', name: 'Benvenuto Nuovi Lead', active: true, runs: 234, lastRun: '5 min fa',
    trigger: { type: 'lead_created', label: 'Nuovo lead creato' },
    actions: [
      { icon: Mail, label: 'Invia email di benvenuto', color: 'bg-blue-100 text-blue-600' },
      { icon: CheckCircle2, label: 'Crea task: Primo contatto', color: 'bg-emerald-100 text-emerald-600' },
    ],
  },
  {
    id: '2', name: 'Follow-up Deal Inattivo', active: true, runs: 89, lastRun: '2 ore fa',
    trigger: { type: 'inactivity', label: 'Deal inattivo da 3 giorni' },
    actions: [
      { icon: Bell, label: 'Notifica al commerciale', color: 'bg-amber-100 text-amber-600' },
      { icon: Mail, label: 'Invia email di follow-up', color: 'bg-blue-100 text-blue-600' },
    ],
  },
  {
    id: '3', name: 'Nurturing Automatico', active: false, runs: 1240, lastRun: '1 giorno fa',
    trigger: { type: 'email_opened', label: 'Email aperta' },
    actions: [
      { icon: Clock, label: 'Attendi 2 giorni', color: 'bg-slate-100 text-slate-600' },
      { icon: Mail, label: 'Invia email di approfondimento', color: 'bg-blue-100 text-blue-600' },
      { icon: Tag, label: 'Aggiungi tag: nurturing', color: 'bg-violet-100 text-violet-600' },
    ],
  },
  {
    id: '4', name: 'Deal Chiuso — Onboarding', active: true, runs: 67, lastRun: '3 ore fa',
    trigger: { type: 'deal_updated', label: 'Deal spostato in "Chiuso"' },
    actions: [
      { icon: Mail, label: 'Invia contratto via email', color: 'bg-blue-100 text-blue-600' },
      { icon: CheckCircle2, label: 'Crea task: Onboarding cliente', color: 'bg-emerald-100 text-emerald-600' },
      { icon: MessageSquare, label: 'Notifica team via chat', color: 'bg-purple-100 text-purple-600' },
    ],
  },
];

const TRIGGER_TYPES = [
  { id: 'lead_created', label: 'Nuovo lead', category: 'CRM', icon: UserPlus, color: 'bg-blue-50 text-blue-600', count: 3 },
  { id: 'deal_updated', label: 'Deal aggiornato', category: 'CRM', icon: DollarSign, color: 'bg-emerald-50 text-emerald-600', count: 2 },
  { id: 'inactivity', label: 'Inattività', category: 'Timing', icon: Clock, color: 'bg-amber-50 text-amber-600', count: 1 },
  { id: 'email_opened', label: 'Email aperta', category: 'Email', icon: Mail, color: 'bg-violet-50 text-violet-600', count: 1 },
  { id: 'task_completed', label: 'Task completato', category: 'Task', icon: CheckCircle2, color: 'bg-pink-50 text-pink-600', count: 0 },
  { id: 'contact_created', label: 'Nuovo contatto', category: 'CRM', icon: UserPlus, color: 'bg-sky-50 text-sky-600', count: 0 },
  { id: 'webhook', label: 'Webhook esterno', category: 'Integrazioni', icon: Zap, color: 'bg-slate-100 text-slate-600', count: 0 },
  { id: 'schedule', label: 'Schedulato', category: 'Timing', icon: Clock, color: 'bg-orange-50 text-orange-600', count: 0 },
];

const ROBOTS = [
  { id: 'r1', name: 'Lead Scorer AI', desc: 'Valuta automaticamente ogni lead con un punteggio 0-100 usando Gemini AI.', active: true, runs: 1892, icon: '🤖', color: 'bg-violet-50' },
  { id: 'r2', name: 'Email Redattore', desc: 'Genera bozze di email personalizzate per ogni contatto in base alla cronologia.', active: true, runs: 432, icon: '✍️', color: 'bg-blue-50' },
  { id: 'r3', name: 'Data Enricher', desc: 'Arricchisce i profili dei contatti con dati aziendali da fonti pubbliche.', active: false, runs: 0, icon: '🔍', color: 'bg-emerald-50' },
  { id: 'r4', name: 'Meeting Scheduler', desc: 'Propone automaticamente slot liberi nel calendario per nuovi lead.', active: false, runs: 0, icon: '📅', color: 'bg-amber-50' },
];

const WorkflowView = () => {
  const [wfs, setWfs] = useState(WORKFLOWS.map(w => ({ ...w })));
  const toggle = (id: string) => {
    setWfs(prev => prev.map(w => w.id === id ? { ...w, active: !w.active } : w));
    const wf = wfs.find(w => w.id === id);
    toast.success(`Workflow ${wf?.active ? 'disattivato' : 'attivato'}`);
  };
  const kpis = [
    { label: 'Workflow attivi', value: wfs.filter(w => w.active).length, icon: Zap, color: 'text-emerald-500 bg-emerald-50' },
    { label: 'Esecuzioni oggi', value: 124, icon: Play, color: 'text-blue-500 bg-blue-50' },
    { label: 'Errori', value: 0, icon: AlertCircle, color: 'text-slate-400 bg-slate-50' },
    { label: 'Tempo risparmiato', value: '8.2h', icon: Clock, color: 'text-violet-500 bg-violet-50' },
  ];
  return (
    <div className="flex-1 overflow-auto p-6 space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="bg-white border border-slate-100 rounded-2xl p-4">
            <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center mb-2", k.color)}><k.icon size={15}/></div>
            <p className="text-xl font-black text-slate-800">{k.value}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{k.label}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{wfs.length} workflow configurati</p>
        <button onClick={() => toast.info('Workflow builder in arrivo')} className="flex items-center gap-1.5 px-3 h-8 rounded-xl bg-blue-500 text-white text-[11px] font-black uppercase tracking-wider shadow-md shadow-blue-100 transition-all hover:bg-blue-600">
          <Plus size={12}/> Nuovo workflow
        </button>
      </div>
      <div className="space-y-3">
        {wfs.map(wf => {
          const TriggerIcon = TRIGGER_ICONS[wf.trigger.type] || Zap;
          return (
            <div key={wf.id} className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <p className="font-black text-slate-800 text-sm">{wf.name}</p>
                    <span className={cn("text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md", wf.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500")}>
                      {wf.active ? 'Attivo' : 'Inattivo'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5">
                      <TriggerIcon size={13} className="text-slate-500"/>
                      <span className="text-[11px] font-bold text-slate-600">{wf.trigger.label}</span>
                    </div>
                    {wf.actions.map((action, i) => (
                      <React.Fragment key={i}>
                        <ArrowRight size={12} className="text-slate-300 shrink-0"/>
                        <div className={cn("flex items-center gap-1.5 rounded-xl px-3 py-1.5", action.color)}>
                          <action.icon size={13}/>
                          <span className="text-[11px] font-bold">{action.label}</span>
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-400">
                    <span>{wf.runs.toLocaleString('it-IT')} esecuzioni totali</span>
                    <span>Ultima: {wf.lastRun}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggle(wf.id)} className="text-slate-400 hover:text-blue-500 transition-colors">
                    {wf.active ? <ToggleRight size={24} className="text-blue-500"/> : <ToggleLeft size={24}/>}
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition-all"><Edit2 size={14}/></button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"><Trash2 size={14}/></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TriggersView = () => (
  <div className="flex-1 overflow-auto p-6 space-y-4">
    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Tipi di trigger disponibili</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {TRIGGER_TYPES.map(t => (
        <div key={t.id} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-all">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", t.color)}>
            <t.icon size={18}/>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-bold text-slate-800 text-sm">{t.label}</p>
              <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">{t.category}</span>
            </div>
            <p className="text-[11px] text-slate-400">{t.count > 0 ? `Usato in ${t.count} workflow` : 'Non ancora usato'}</p>
          </div>
          <button onClick={() => toast.info('Aggiungi a workflow')} className="px-3 h-7 rounded-xl bg-slate-100 hover:bg-blue-500 hover:text-white text-slate-600 text-[10px] font-black uppercase tracking-wider transition-all shrink-0">
            Usa
          </button>
        </div>
      ))}
    </div>
  </div>
);

const RobotsView = () => {
  const [robots, setRobots] = useState(ROBOTS.map(r => ({ ...r })));
  const toggle = (id: string) => {
    setRobots(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
    const r = robots.find(r => r.id === id);
    toast.success(`Robot ${r?.active ? 'disattivato' : 'attivato'}`);
  };
  return (
    <div className="flex-1 overflow-auto p-6 space-y-4">
      <div className="bg-gradient-to-br from-violet-50 to-blue-50 border border-violet-100 rounded-2xl p-5 mb-2">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 bg-violet-500 rounded-xl flex items-center justify-center text-white"><Bot size={18}/></div>
          <div>
            <p className="font-black text-slate-800 text-sm">Robot AI</p>
            <p className="text-[11px] text-slate-400">Agenti autonomi alimentati da Gemini AI</p>
          </div>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">I Robot eseguono compiti complessi in autonomia: analizzano dati, scrivono contenuti e aggiornano il CRM senza intervento manuale.</p>
      </div>
      <div className="space-y-3">
        {robots.map(r => (
          <div key={r.id} className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-all">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0", r.color)}>{r.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-bold text-slate-800 text-sm">{r.name}</p>
                <span className={cn("text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md", r.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500")}>{r.active ? 'Attivo' : 'Inattivo'}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{r.desc}</p>
              {r.runs > 0 && <p className="text-[10px] text-slate-300 mt-1">{r.runs.toLocaleString('it-IT')} esecuzioni</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => toggle(r.id)} className="text-slate-400 hover:text-blue-500 transition-colors">
                {r.active ? <ToggleRight size={24} className="text-blue-500"/> : <ToggleLeft size={24}/>}
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition-all"><Settings size={14}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Automations: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const section: Section = PATH_MAP[location.pathname] ?? 'workflow';
  const cur = NAV.find(n => n.id === section);

  return (
    <div className="h-full flex bg-white overflow-hidden">
      <div className="w-52 border-r border-slate-100 flex flex-col bg-slate-50/60 shrink-0">
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-sm font-black text-slate-800">Automazione</h2>
          <p className="text-[10px] text-slate-400 mt-0.5">Workflow & robot</p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map(item => (
            <button key={item.id} onClick={() => navigate(item.path)}
              className={cn("w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-sm font-bold",
                section === item.id ? "bg-blue-500 text-white shadow-md shadow-blue-100" : "text-slate-500 hover:bg-white hover:shadow-sm")}>
              <item.icon size={15} className={section === item.id ? "text-blue-200" : "text-slate-400"}/>
              {item.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-14 px-5 border-b border-slate-100 flex items-center gap-2 bg-white shrink-0">
          {cur && <><cur.icon size={16} className="text-slate-400"/><h2 className="font-black text-slate-800 text-sm">{cur.label}</h2></>}
        </div>
        {section === 'workflow' && <WorkflowView/>}
        {section === 'triggers' && <TriggersView/>}
        {section === 'robots'   && <RobotsView/>}
      </div>
    </div>
  );
};

export default Automations;
