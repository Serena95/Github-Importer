import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Mail, Smartphone, Megaphone, UserPlus, Plus, Search, BarChart2,
  Eye, Send, Clock, CheckCircle2, XCircle, Copy, Edit2, Trash2,
  ArrowUpRight, Users, Target, TrendingUp, Play, Pause, Filter,
  ChevronRight,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Section = 'email' | 'sms' | 'campaigns' | 'leads';
const PATH_MAP: Record<string, Section> = {
  '/marketing': 'campaigns', '/marketing/campaigns': 'campaigns',
  '/marketing/email': 'email', '/marketing/sms': 'sms',
  '/marketing/leads': 'leads',
};

const NAV = [
  { id: 'campaigns', label: 'Campagne',       icon: Megaphone,  path: '/marketing/campaigns' },
  { id: 'email',     label: 'Email marketing', icon: Mail,       path: '/marketing/email' },
  { id: 'sms',       label: 'SMS marketing',   icon: Smartphone, path: '/marketing/sms' },
  { id: 'leads',     label: 'Lead generation', icon: UserPlus,   path: '/marketing/leads' },
];

const CAMPAIGNS = [
  { id: 'c1', name: 'Black Friday 2025', type: 'Email', status: 'active', sent: 4820, opened: 1834, clicked: 412, converted: 87, date: '15 Nov 2025' },
  { id: 'c2', name: 'Newsletter Q4', type: 'Email', status: 'active', sent: 2300, opened: 943, clicked: 201, converted: 34, date: '1 Nov 2025' },
  { id: 'c3', name: 'Promo SMS Ottobre', type: 'SMS', status: 'completed', sent: 1500, opened: 1350, clicked: 312, converted: 65, date: '10 Ott 2025' },
  { id: 'c4', name: 'Welcome Series', type: 'Email', status: 'active', sent: 890, opened: 534, clicked: 143, converted: 28, date: 'Continua' },
  { id: 'c5', name: 'Webinar Invito', type: 'Email', status: 'draft', sent: 0, opened: 0, clicked: 0, converted: 0, date: 'Bozza' },
];

const EMAIL_TEMPLATES = [
  { id: 't1', name: 'Welcome Email', category: 'Onboarding', preview: 'Benvenuto! Inizia subito a...', lastUsed: '2 giorni fa' },
  { id: 't2', name: 'Promozionale', category: 'Marketing', preview: 'Offerta speciale per te!', lastUsed: '1 settimana fa' },
  { id: 't3', name: 'Follow-up Evento', category: 'Relazione', preview: 'È stato un piacere incontrarci...', lastUsed: '2 settimane fa' },
  { id: 't4', name: 'Rinnovo Contratto', category: 'Commerciale', preview: 'Il tuo contratto scade tra...', lastUsed: '1 mese fa' },
  { id: 't5', name: 'Feedback Cliente', category: 'Supporto', preview: 'Cosa pensi del nostro servizio?', lastUsed: 'Mai' },
];

const LEAD_FORMS = [
  { id: 'f1', name: 'Form contatto principale', leads: 234, conversions: 18, active: true },
  { id: 'f2', name: 'Demo request', leads: 87, conversions: 52, active: true },
  { id: 'f3', name: 'Whitepaper download', leads: 156, conversions: 8, active: false },
];

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700',
    completed: 'bg-slate-100 text-slate-600',
    draft: 'bg-amber-100 text-amber-700',
    paused: 'bg-red-100 text-red-600',
  };
  const labels: Record<string, string> = { active: 'Attiva', completed: 'Completata', draft: 'Bozza', paused: 'In pausa' };
  return <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider", map[status])}>{labels[status]}</span>;
};

const CampaignsView = () => {
  const [search, setSearch] = useState('');
  const filtered = CAMPAIGNS.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  const kpis = [
    { label: 'Email inviate', value: '9.5k', delta: 12, icon: Send, color: 'text-blue-500 bg-blue-50' },
    { label: 'Tasso apertura', value: '38%', delta: 3, icon: Eye, color: 'text-violet-500 bg-violet-50' },
    { label: 'Click rate', value: '8.4%', delta: -1, icon: TrendingUp, color: 'text-amber-500 bg-amber-50' },
    { label: 'Conversioni', value: '214', delta: 21, icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50' },
  ];
  return (
    <div className="flex-1 overflow-auto p-6 space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="bg-white border border-slate-100 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", k.color)}><k.icon size={15}/></div>
              <span className={cn("text-[10px] font-black", k.delta >= 0 ? "text-emerald-600" : "text-red-500")}>
                {k.delta >= 0 ? '+' : ''}{k.delta}%
              </span>
            </div>
            <p className="text-xl font-black text-slate-800">{k.value}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{k.label}</p>
          </div>
        ))}
      </div>
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-50 flex items-center justify-between">
          <div className="relative flex-1 max-w-xs">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca campagne…" className="pl-8 h-8 text-xs rounded-xl"/>
          </div>
          <button onClick={() => toast.info('Editor campagna in arrivo')} className="flex items-center gap-1.5 px-3 h-8 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider shadow-md shadow-blue-100 transition-all">
            <Plus size={12}/> Nuova campagna
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-50">
              {['Campagna', 'Tipo', 'Inviati', 'Aperti', 'Click', 'Conversioni', 'Stato', ''].map(h => (
                <th key={h} className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-bold text-sm text-slate-800">{c.name}</p>
                  <p className="text-[10px] text-slate-400">{c.date}</p>
                </td>
                <td className="px-4 py-3"><span className="text-[11px] font-bold text-slate-500">{c.type}</span></td>
                <td className="px-4 py-3 text-sm font-bold text-slate-700">{c.sent > 0 ? c.sent.toLocaleString('it-IT') : '—'}</td>
                <td className="px-4 py-3">
                  {c.opened > 0 ? (
                    <div>
                      <p className="text-sm font-bold text-slate-700">{Math.round(c.opened/c.sent*100)}%</p>
                      <p className="text-[10px] text-slate-400">{c.opened.toLocaleString('it-IT')}</p>
                    </div>
                  ) : <span className="text-slate-300">—</span>}
                </td>
                <td className="px-4 py-3">
                  {c.clicked > 0 ? (
                    <div>
                      <p className="text-sm font-bold text-slate-700">{Math.round(c.clicked/c.sent*100)}%</p>
                      <p className="text-[10px] text-slate-400">{c.clicked.toLocaleString('it-IT')}</p>
                    </div>
                  ) : <span className="text-slate-300">—</span>}
                </td>
                <td className="px-4 py-3">
                  {c.converted > 0 ? <span className="font-black text-emerald-600">{c.converted}</span> : <span className="text-slate-300">—</span>}
                </td>
                <td className="px-4 py-3">{statusBadge(c.status)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-all"><Edit2 size={12}/></button>
                    <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-all"><Copy size={12}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const EmailView = () => {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className="flex-1 overflow-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{EMAIL_TEMPLATES.length} template disponibili</p>
        <button onClick={() => toast.info('Editor template in arrivo')} className="flex items-center gap-1.5 px-3 h-8 rounded-xl bg-blue-500 text-white text-[11px] font-black uppercase tracking-wider shadow-md shadow-blue-100 transition-all hover:bg-blue-600">
          <Plus size={12}/> Nuovo template
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {EMAIL_TEMPLATES.map(t => (
          <div key={t.id} className={cn("bg-white border rounded-2xl p-5 cursor-pointer hover:shadow-lg transition-all", selected === t.id ? "border-blue-300 shadow-md shadow-blue-50" : "border-slate-100")} onClick={() => setSelected(t.id)}>
            <div className="h-24 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl mb-4 flex items-center justify-center border border-slate-100">
              <Mail size={28} className="text-blue-200"/>
            </div>
            <div className="flex items-start justify-between mb-1">
              <p className="font-black text-slate-800 text-sm">{t.name}</p>
              <span className="text-[9px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-md ml-2 shrink-0">{t.category}</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">{t.preview}</p>
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-slate-300">Usato: {t.lastUsed}</p>
              <div className="flex items-center gap-1">
                <button onClick={e => { e.stopPropagation(); toast.success('Template duplicato'); }} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-all"><Copy size={12}/></button>
                <button onClick={e => { e.stopPropagation(); toast.info('Usa template'); }} className="px-2 h-7 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-black transition-all">Usa</button>
              </div>
            </div>
          </div>
        ))}
        <button onClick={() => toast.info('Editor template in arrivo')} className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 text-slate-300 hover:border-blue-300 hover:text-blue-400 transition-all min-h-[200px]">
          <Plus size={28} className="mb-2"/>
          <p className="text-[11px] font-black uppercase tracking-wider">Crea template</p>
        </button>
      </div>
    </div>
  );
};

const SMSView = () => (
  <div className="flex-1 overflow-auto p-6 space-y-6">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: 'SMS inviati', value: '1.5k', color: 'text-blue-500 bg-blue-50', icon: Send },
        { label: 'Consegnati', value: '98%', color: 'text-emerald-500 bg-emerald-50', icon: CheckCircle2 },
        { label: 'CTR', value: '12%', color: 'text-violet-500 bg-violet-50', icon: TrendingUp },
        { label: 'Opt-out', value: '0.4%', color: 'text-red-500 bg-red-50', icon: XCircle },
      ].map(k => (
        <div key={k.label} className="bg-white border border-slate-100 rounded-2xl p-4">
          <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center mb-2", k.color)}><k.icon size={15}/></div>
          <p className="text-xl font-black text-slate-800">{k.value}</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{k.label}</p>
        </div>
      ))}
    </div>
    <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4">
      <h3 className="font-black text-slate-800 text-sm">Invia SMS rapido</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Lista destinatari</label>
          <select className="w-full h-9 rounded-xl border border-slate-200 px-3 text-sm bg-white text-slate-700 outline-none focus:border-blue-400">
            <option>Tutti i contatti (2.431)</option>
            <option>Lead qualificati (342)</option>
            <option>Clienti attivi (891)</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Mittente</label>
          <Input placeholder="+39 02 1234567 o nome brand" className="h-9 rounded-xl text-sm"/>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Messaggio (160 caratteri)</label>
        <div className="relative">
          <textarea maxLength={160} placeholder="Scrivi il tuo SMS…" rows={3} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm resize-none outline-none focus:border-blue-400 text-slate-700 placeholder:text-slate-400"/>
          <span className="absolute bottom-2 right-3 text-[10px] text-slate-400">0/160</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-slate-400">Richiede connessione Twilio</p>
        <button onClick={() => toast.info('Configura Twilio in Applicazioni → Integrazioni')} className="flex items-center gap-1.5 px-4 h-8 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider shadow-md shadow-blue-100 transition-all">
          <Send size={12}/> Invia SMS
        </button>
      </div>
    </div>
  </div>
);

const LeadsView = () => (
  <div className="flex-1 overflow-auto p-6 space-y-5">
    <div className="flex items-center justify-between">
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Form di acquisizione lead</p>
      <button onClick={() => toast.info('Editor form in arrivo')} className="flex items-center gap-1.5 px-3 h-8 rounded-xl bg-blue-500 text-white text-[11px] font-black uppercase tracking-wider shadow-md shadow-blue-100 transition-all hover:bg-blue-600">
        <Plus size={12}/> Nuovo form
      </button>
    </div>
    <div className="space-y-3">
      {LEAD_FORMS.map(form => (
        <div key={form.id} className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-4">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", form.active ? "bg-emerald-50" : "bg-slate-100")}>
            <Target size={18} className={form.active ? "text-emerald-500" : "text-slate-400"}/>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-bold text-slate-800 text-sm">{form.name}</p>
              <span className={cn("text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md", form.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500")}>{form.active ? 'Attivo' : 'Inattivo'}</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-400">
              <span><strong className="text-slate-700">{form.leads}</strong> lead raccolti</span>
              <span><strong className="text-slate-700">{form.conversions}%</strong> tasso conversione</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-blue-500 transition-colors"><Copy size={12}/> Copia URL</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition-all"><Edit2 size={14}/></button>
            <button className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"><Trash2 size={14}/></button>
          </div>
        </div>
      ))}
    </div>
    <div className="bg-gradient-to-br from-blue-50 to-violet-50 border border-blue-100 rounded-2xl p-6 text-center">
      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm"><Users size={22} className="text-blue-500"/></div>
      <h3 className="font-black text-slate-800 mb-1">Integra Typeform o HubSpot</h3>
      <p className="text-sm text-slate-400 mb-4">Importa lead da form esterni e tienili sincronizzati automaticamente nel CRM.</p>
      <button onClick={() => toast.info('Vai in Applicazioni → Integrazioni')} className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider shadow-md shadow-blue-100 transition-all">
        Configura integrazioni
      </button>
    </div>
  </div>
);

const Marketing: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const section: Section = PATH_MAP[location.pathname] ?? 'campaigns';
  const cur = NAV.find(n => n.id === section);

  return (
    <div className="h-full flex bg-white overflow-hidden">
      <div className="w-52 border-r border-slate-100 flex flex-col bg-slate-50/60 shrink-0">
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-sm font-black text-slate-800">Marketing</h2>
          <p className="text-[10px] text-slate-400 mt-0.5">Campagne & lead gen</p>
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
        {section === 'campaigns' && <CampaignsView/>}
        {section === 'email'     && <EmailView/>}
        {section === 'sms'       && <SMSView/>}
        {section === 'leads'     && <LeadsView/>}
      </div>
    </div>
  );
};

export default Marketing;
