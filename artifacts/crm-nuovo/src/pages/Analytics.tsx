import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, LineChart, Line, Legend
} from 'recharts';
import {
  TrendingUp, Users, Target, DollarSign, ArrowUpRight, ArrowDownRight,
  Download, BarChart2, GitBranch, LayoutDashboard, Filter, RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';

type Section = 'dashboard' | 'sales' | 'pipeline';
const PATH_MAP: Record<string, Section> = {
  '/analytics': 'dashboard', '/analytics/dashboard': 'dashboard',
  '/analytics/sales': 'sales', '/analytics/pipeline': 'pipeline',
};

const COLORS = ['#2FC6F6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#64748b'];

const monthly = [
  { mese: 'Gen', ricavi: 42000, lead: 38, affari: 12 },
  { mese: 'Feb', ricavi: 58000, lead: 52, affari: 18 },
  { mese: 'Mar', ricavi: 47000, lead: 41, affari: 14 },
  { mese: 'Apr', ricavi: 71000, lead: 67, affari: 24 },
  { mese: 'Mag', ricavi: 64000, lead: 59, affari: 21 },
  { mese: 'Giu', ricavi: 83000, lead: 78, affari: 29 },
  { mese: 'Lug', ricavi: 91000, lead: 84, affari: 32 },
  { mese: 'Ago', ricavi: 76000, lead: 70, affari: 27 },
  { mese: 'Set', ricavi: 102000, lead: 95, affari: 38 },
  { mese: 'Ott', ricavi: 118000, lead: 108, affari: 43 },
  { mese: 'Nov', ricavi: 134000, lead: 122, affari: 51 },
  { mese: 'Dic', ricavi: 149000, lead: 139, affari: 58 },
];

const sources = [
  { name: 'Sito web', value: 38 }, { name: 'Referral', value: 24 },
  { name: 'Social media', value: 18 }, { name: 'Email', value: 12 },
  { name: 'Altro', value: 8 },
];

const pipelineStages = [
  { fase: 'Nuovo lead', count: 124, valore: 620000 },
  { fase: 'Qualificato', count: 87, valore: 435000 },
  { fase: 'Demo', count: 52, valore: 260000 },
  { fase: 'Proposta', count: 34, valore: 170000 },
  { fase: 'Trattativa', count: 21, valore: 105000 },
  { fase: 'Chiuso', count: 12, valore: 60000 },
];

const topSales = [
  { name: 'Marco Rossi', deals: 18, revenue: 142000, rate: 72 },
  { name: 'Laura Bianchi', deals: 15, revenue: 128000, rate: 68 },
  { name: 'Giovanni Verdi', deals: 12, revenue: 98000, rate: 61 },
  { name: 'Sara Conti', deals: 10, revenue: 87000, rate: 58 },
  { name: 'Luca Ferrari', deals: 8, revenue: 71000, rate: 53 },
];

const KPICard = ({ icon: Icon, label, value, delta, color }: any) => (
  <div className="bg-white border border-slate-100 rounded-2xl p-5">
    <div className="flex items-center justify-between mb-3">
      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", color)}>
        <Icon size={17} />
      </div>
      <div className={cn("flex items-center gap-0.5 text-[11px] font-black", delta >= 0 ? "text-emerald-600" : "text-red-500")}>
        {delta >= 0 ? <ArrowUpRight size={13}/> : <ArrowDownRight size={13}/>}
        {Math.abs(delta)}%
      </div>
    </div>
    <p className="text-2xl font-black text-slate-800">{value}</p>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{label}</p>
  </div>
);

const DashboardView = ({ counts }: { counts: any }) => (
  <div className="flex-1 overflow-auto p-6 space-y-6">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard icon={DollarSign} label="Ricavi totali" value={`€${(counts.revenue/1000).toFixed(0)}k`} delta={18} color="bg-emerald-50 text-emerald-600"/>
      <KPICard icon={Target} label="Lead totali" value={counts.leads} delta={12} color="bg-blue-50 text-blue-600"/>
      <KPICard icon={TrendingUp} label="Affari chiusi" value={counts.deals} delta={8} color="bg-violet-50 text-violet-600"/>
      <KPICard icon={Users} label="Tasso conversione" value="23%" delta={-2} color="bg-amber-50 text-amber-600"/>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-slate-800 text-sm">Ricavi mensili</h3>
          <span className="text-[10px] text-slate-400 font-bold uppercase">2025</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={monthly}>
            <defs>
              <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2FC6F6" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#2FC6F6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
            <XAxis dataKey="mese" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `€${v/1000}k`}/>
            <RechartTooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,.1)', fontSize: 12 }} formatter={(v: any) => [`€${v.toLocaleString('it-IT')}`, 'Ricavi']}/>
            <Area type="monotone" dataKey="ricavi" stroke="#2FC6F6" strokeWidth={2.5} fill="url(#gradRevenue)"/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white border border-slate-100 rounded-2xl p-5">
        <h3 className="font-black text-slate-800 text-sm mb-4">Sorgenti lead</h3>
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie data={sources} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
              {sources.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
            </Pie>
            <RechartTooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,.1)', fontSize: 12 }}/>
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-1.5 mt-2">
          {sources.map((s, i) => (
            <div key={s.name} className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }}/>
                <span className="text-slate-600 font-medium">{s.name}</span>
              </div>
              <span className="font-black text-slate-700">{s.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const SalesView = () => (
  <div className="flex-1 overflow-auto p-6 space-y-6">
    <div className="bg-white border border-slate-100 rounded-2xl p-5">
      <h3 className="font-black text-slate-800 text-sm mb-4">Lead vs Affari chiusi (mensile)</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={monthly}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
          <XAxis dataKey="mese" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false}/>
          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false}/>
          <RechartTooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,.1)', fontSize: 12 }}/>
          <Legend wrapperStyle={{ fontSize: 11 }}/>
          <Bar dataKey="lead" name="Lead" fill="#2FC6F6" radius={[4,4,0,0]}/>
          <Bar dataKey="affari" name="Affari" fill="#8b5cf6" radius={[4,4,0,0]}/>
        </BarChart>
      </ResponsiveContainer>
    </div>
    <div className="bg-white border border-slate-100 rounded-2xl p-5">
      <h3 className="font-black text-slate-800 text-sm mb-4">Top venditori</h3>
      <div className="space-y-3">
        {topSales.map((s, i) => (
          <div key={s.name} className="flex items-center gap-4">
            <div className="w-6 text-center text-[11px] font-black text-slate-300">#{i+1}</div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-violet-100 flex items-center justify-center text-xs font-black text-slate-600 shrink-0">
              {s.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-bold text-slate-700 truncate">{s.name}</p>
                <p className="text-sm font-black text-slate-800">€{s.revenue.toLocaleString('it-IT')}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-400 to-violet-500 rounded-full" style={{ width: `${s.rate}%` }}/>
                </div>
                <span className="text-[10px] font-bold text-slate-400 shrink-0">{s.rate}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const PipelineView = () => (
  <div className="flex-1 overflow-auto p-6 space-y-6">
    <div className="bg-white border border-slate-100 rounded-2xl p-5">
      <h3 className="font-black text-slate-800 text-sm mb-4">Funnel di vendita</h3>
      <div className="space-y-2">
        {pipelineStages.map((stage, i) => {
          const pct = Math.round((stage.count / pipelineStages[0].count) * 100);
          return (
            <div key={stage.fase} className="flex items-center gap-4">
              <div className="w-24 text-[11px] font-bold text-slate-500 shrink-0 text-right">{stage.fase}</div>
              <div className="flex-1 relative">
                <div className="h-8 bg-slate-50 rounded-lg overflow-hidden">
                  <div className="h-full rounded-lg flex items-center px-3 transition-all duration-500"
                    style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${COLORS[i]}, ${COLORS[i]}99)` }}>
                    <span className="text-white text-[11px] font-black whitespace-nowrap">{stage.count}</span>
                  </div>
                </div>
              </div>
              <div className="w-24 text-[11px] font-bold text-slate-500 shrink-0">€{(stage.valore/1000).toFixed(0)}k</div>
              <div className="w-10 text-[11px] font-black text-slate-400 shrink-0">{pct}%</div>
            </div>
          );
        })}
      </div>
    </div>
    <div className="bg-white border border-slate-100 rounded-2xl p-5">
      <h3 className="font-black text-slate-800 text-sm mb-4">Valore pipeline per fase</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={pipelineStages} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false}/>
          <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v=>`€${v/1000}k`}/>
          <YAxis type="category" dataKey="fase" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={80}/>
          <RechartTooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,.1)', fontSize: 12 }} formatter={(v: any)=>[`€${v.toLocaleString('it-IT')}`, 'Valore']}/>
          <Bar dataKey="valore" fill="#2FC6F6" radius={[0,6,6,0]}/>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/analytics/dashboard' },
  { id: 'sales',     label: 'Vendite',   icon: TrendingUp,     path: '/analytics/sales' },
  { id: 'pipeline',  label: 'Pipeline',  icon: GitBranch,      path: '/analytics/pipeline' },
];

const Analytics: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tenant } = useAuth();
  const section: Section = PATH_MAP[location.pathname] ?? 'dashboard';
  const [counts, setCounts] = useState({ leads: 0, deals: 0, contacts: 0, companies: 0, tasks: 0, revenue: 0 });

  useEffect(() => {
    if (!tenant) return;
    const cols = ['leads', 'deals', 'contacts', 'companies', 'tasks'];
    const unsubs = cols.map(col => onSnapshot(collection(db, 'tenants', tenant.id, col), snap => {
      setCounts(prev => ({ ...prev, [col]: snap.size }));
      if (col === 'deals') setCounts(prev => ({ ...prev, revenue: snap.docs.reduce((a, d) => a + (d.data().value || 0), 0) }));
    }, err => handleFirestoreError(err, OperationType.LIST, col)));
    return () => unsubs.forEach(u => u());
  }, [tenant]);

  return (
    <div className="h-full flex bg-white overflow-hidden">
      <div className="w-52 border-r border-slate-100 flex flex-col bg-slate-50/60 shrink-0">
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-sm font-black text-slate-800">Analisi</h2>
          <p className="text-[10px] text-slate-400 mt-0.5">Report e statistiche</p>
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
        <div className="p-3 border-t border-slate-100 space-y-2">
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold text-slate-400 hover:bg-white hover:text-blue-500 transition-all">
            <Download size={13}/> Esporta PDF
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-14 px-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <BarChart2 size={16} className="text-slate-400"/>
            <h2 className="font-black text-slate-800 text-sm">{NAV.find(n => n.id === section)?.label}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-blue-500 transition-colors">
              <Filter size={12}/> Periodo
            </button>
            <button className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-blue-500 transition-colors">
              <RefreshCw size={12}/> Aggiorna
            </button>
          </div>
        </div>
        {section === 'dashboard' && <DashboardView counts={counts}/>}
        {section === 'sales'     && <SalesView/>}
        {section === 'pipeline'  && <PipelineView/>}
      </div>
    </div>
  );
};

export default Analytics;
