import React, { useMemo, useEffect, useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Users, 
  ArrowUpRight, 
  Briefcase,
  PieChart as PieChartIcon,
  BarChart3,
  Filter,
  Calendar,
  LayoutDashboard
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area
} from 'recharts';
import { motion } from 'motion/react';
import { supabaseCRMService } from '@/services/supabaseCRMService';
import { useCRMStore } from '@/stores/crmStore';
import { CRMDeal, CRMStage } from '@/types/crm';
import { cn } from '@/lib/utils';

// Componente Card per i Widget
const StatWidget = ({ 
  title, 
  value, 
  trend, 
  icon: Icon, 
  color, 
  onClick 
}: { 
  title: string; 
  value: string | number; 
  trend?: { label: string; isUp: boolean };
  icon: any;
  color: string;
  onClick: () => void;
}) => (
  <motion.div 
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
    onClick={onClick}
    className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
  >
    <div className="flex items-center justify-between mb-4">
      <div 
        className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", color)}
      >
        <Icon size={24} className="text-white" />
      </div>
      {trend && (
        <div className={cn(
          "flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full",
          trend.isUp ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
        )}>
          {trend.isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {trend.label}
        </div>
      )}
    </div>
    
    <div>
      <h3 className="text-slate-500 text-[11px] font-black uppercase tracking-[0.15em] mb-1">{title}</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-black text-slate-800 tracking-tight">{value}</span>
      </div>
    </div>
  </motion.div>
);

const CommercialDashboard: React.FC<{ setActiveTab: (tab: string) => void }> = ({ setActiveTab }) => {
  const { setFilters, resetFilters, deals, stages, isLoading: isStoreLoading, activeWorkspace } = useCRMStore();

  const handleNavigateCRM = (filter?: string) => {
    resetFilters();
    if (filter === 'active') {
      setFilters({ status: ['attivo'] });
    } else if (filter === 'won') {
      setFilters({ status: ['vinto'] });
    } else if (filter === 'lost') {
      setFilters({ status: ['perso'] });
    } else if (filter === 'new') {
      const from = new Date();
      from.setDate(1);
      from.setHours(0, 0, 0, 0);
      setFilters({ dateFrom: from });
    }
    setActiveTab('affari');
  };

  // Calcoli per i Widget
  const stats = useMemo(() => {
    // We need to map stages to know is_won/is_lost
    const wonStageIds = stages.filter(s => s.is_won).map(s => s.id);
    const lostStageIds = stages.filter(s => s.is_lost).map(s => s.id);

    const activeDeals = deals.filter(d => !wonStageIds.includes(d.stage_id) && !lostStageIds.includes(d.stage_id));
    const wonDeals = deals.filter(d => wonStageIds.includes(d.stage_id));
    const lostDeals = deals.filter(d => lostStageIds.includes(d.stage_id));
    const totalValue = deals.reduce((acc, d) => acc + (d.value || 0), 0);
    
    const conversionRate = deals.length > 0 ? (wonDeals.length / deals.length) * 100 : 0;
    const newLeads = deals.filter(d => {
      const createdDate = new Date(d.created_at);
      const now = new Date();
      return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear();
    }).length;

    return {
      active: activeDeals.length,
      won: wonDeals.length,
      lost: lostDeals.length,
      value: totalValue,
      conversion: conversionRate.toFixed(1) + '%',
      leads: newLeads
    };
  }, [deals, stages]);

  // Dati per Grafico Pipeline Valore
  const pipelineValueData = useMemo(() => {
    return stages.map(s => {
      const stageDeals = deals.filter(d => d.stage_id === s.id);
      const value = stageDeals.reduce((acc, d) => acc + (d.value || 0), 0);
      return {
        name: s.name,
        valore: value,
        color: s.color || '#3b82f6'
      };
    });
  }, [stages, deals]);

  // Dati per Affari per Responsabile
  const ownerData = useMemo(() => {
    const counts: Record<string, number> = {};
    deals.forEach(d => {
      const owner = d.assigned_to || 'Non assegnato';
      counts[owner] = (counts[owner] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [deals]);

  const COLORS = ['#2FC6F6', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (isStoreLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Caricamento dati...</p>
        </div>
      </div>
    );
  }

  if (!stages || stages.length === 0) {
     return (
       <div className="flex-1 flex flex-col items-center justify-center bg-[#f8fafc] p-8 text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300 mb-6 font-black italic">
            CRM
          </div>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">Pipeline non configurata</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-8 font-medium">
            Non è stata trovata nessuna struttura CRM nel workspace <span className="text-blue-600 font-bold">{activeWorkspace?.name}</span>. 
          </p>
          <button 
            onClick={() => setActiveTab('affari')}
            className="px-8 h-12 rounded-2xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
          >
            Configura CRM
          </button>
       </div>
     );
  }

  const hasDeals = deals && deals.length > 0;

  return (
    <div className="flex-1 bg-[#f8fafc] overflow-y-auto no-scrollbar pb-20">
      {/* Header Dashboard */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between sticky top-0 z-10">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <LayoutDashboard size={20} />
            </div>
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Dashboard Commerciale</h1>
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-11">Monitoraggio performance e pipeline vendite</p>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 h-10 rounded-full border border-slate-200 bg-white text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all">
            <Calendar size={14} /> Ultimi 30 giorni
          </button>
          <button className="flex items-center gap-2 px-4 h-10 rounded-full bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
            <Filter size={14} /> Filtri avanzati
          </button>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-8">
        {!hasDeals && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-blue-600 rounded-[32px] text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative"
          >
            <div className="relative z-10">
              <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Benvenuto nel tuo CRM</h2>
              <p className="text-blue-100 text-sm font-medium max-w-xl">
                La tua dashboard è pronta, ma non hai ancora inserito degli affari. 
                Inizia a popolare la tua pipeline per vedere grafici e statistiche in tempo reale.
              </p>
            </div>
            <button 
              onClick={() => setActiveTab('affari')}
              className="relative z-10 px-8 h-12 bg-white text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all shrink-0 shadow-xl"
            >
              Crea Primo Affare
            </button>
            {/* Decoration */}
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
            <div className="absolute left-1/4 bottom-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
          </motion.div>
        )}

        {/* Widget Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatWidget 
            title="Affari Attivi" 
            value={stats.active} 
            trend={{ label: "+5% vs ieri", isUp: true }}
            icon={Briefcase}
            color="bg-blue-500"
            onClick={() => handleNavigateCRM('active')}
          />
          <StatWidget 
            title="Affari Vinti" 
            value={stats.won} 
            trend={{ label: "+12% mese", isUp: true }}
            icon={Target}
            color="bg-emerald-500"
            onClick={() => handleNavigateCRM('won')}
          />
          <StatWidget 
            title="Affari Persi" 
            value={stats.lost} 
            trend={{ label: "-2% mese", isUp: false }}
            icon={TrendingDown}
            color="bg-rose-500"
            onClick={() => handleNavigateCRM('lost')}
          />
          <StatWidget 
            title="Valore Pipeline" 
            value={`€ ${stats.value.toLocaleString()}`} 
            trend={{ label: "+€45k", isUp: true }}
            icon={DollarSign}
            color="bg-amber-500"
            onClick={() => handleNavigateCRM('all')}
          />
          <StatWidget 
            title="Conversion Rate" 
            value={stats.conversion} 
            trend={{ label: "+1.2%", isUp: true }}
            icon={ArrowUpRight}
            color="bg-indigo-500"
            onClick={() => handleNavigateCRM('won')}
          />
          <StatWidget 
            title="Lead Nuovi" 
            value={stats.leads} 
            trend={{ label: "8 oggi", isUp: true }}
            icon={Users}
            color="bg-cyan-500"
            onClick={() => handleNavigateCRM('new')}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Grafico 1: Pipeline Valore */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Pipeline Valore</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Distribuzione monetaria dell'imbuto commerciale</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                <DollarSign size={20} />
              </div>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={pipelineValueData} margin={{ left: 10, right: 10, top: 0, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorValore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontWeight: 700, fontSize: 10 }}
                    dy={15}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontWeight: 700, fontSize: 10 }}
                    tickFormatter={(v) => `€${v >= 1000 ? (v / 1000) + 'k' : v}`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="valore" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Grafico 2: Affari per Stage */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Affari per Stage</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Volume di deal gestiti per ogni fase</p>
              </div>
              <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
                <BarChart3 size={20} />
              </div>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={stages.map(s => ({ name: s.name, count: deals.filter(d => d.stage_id === s.id).length, color: s.color }))} 
                  margin={{ left: 0, right: 10, top: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontWeight: 700, fontSize: 10 }}
                    dy={15}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontWeight: 700, fontSize: 10 }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(241, 245, 249, 0.4)' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 6, 6]} barSize={32}>
                    {stages.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Grafico 3: Affari per Responsabile */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Affari per Responsabile</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Produttività individuale del team</p>
              </div>
              <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center">
                <Users size={20} />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-8 h-[300px]">
              <div className="flex-1 w-full h-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ownerData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="count"
                      stroke="none"
                    >
                      {ownerData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="w-full sm:w-48 space-y-3 overflow-y-auto max-h-full no-scrollbar">
                {ownerData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-[10px] font-black uppercase text-slate-500 truncate max-w-[100px]">{entry.name}</span>
                    </div>
                    <span className="text-xs font-black text-slate-800">{entry.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Grafico 4: Conversione */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Conversione</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Andamento percentuale di successo</p>
              </div>
              <div className="w-10 h-10 bg-cyan-50 text-cyan-500 rounded-xl flex items-center justify-center">
                <TrendingUp size={20} />
              </div>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={[
                    { name: 'Gen', value: 12 },
                    { name: 'Feb', value: 15 },
                    { name: 'Mar', value: 18 },
                    { name: 'Apr', value: 22 },
                    { name: 'Mag', value: 19 },
                    { name: 'Giu', value: 24 },
                  ]}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 700, fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 700, fontSize: 10 }} unit="%" />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Area type="stepAfter" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CommercialDashboard;
