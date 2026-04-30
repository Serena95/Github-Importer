import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area,
  Funnel,
  FunnelChart,
  LabelList
} from 'recharts';
import { 
  Download, 
  Filter, 
  Calendar as CalendarIcon, 
  ArrowUpRight, 
  ArrowDownRight, 
  Users, 
  Target, 
  TrendingUp, 
  Clock,
  ChevronDown,
  FileText,
  Table as TableIcon,
  Maximize2,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabaseCRMService } from '@/services/supabaseCRMService';
import { CRMDeal, CRMStructure, CRMUser } from '@/types/crm';
import { format, subMonths, startOfMonth, endOfMonth, parseISO, differenceInDays } from 'date-fns';
import { it } from 'date-fns/locale';
import { toast } from 'sonner';

import { useCRMStore } from '@/stores/crmStore';

interface CRMReportsProps {
  pipeline?: CRMStructure;
}

export const CRMReports: React.FC<CRMReportsProps> = ({ pipeline }) => {
  const { activeWorkspace } = useCRMStore();
  const [deals, setDeals] = useState<CRMDeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ 
    start: format(subMonths(new Date(), 6), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });

  const fetchDeals = async () => {
    setIsLoading(true);
    try {
      const data = await supabaseCRMService.getReportingDeals({
        startDate: dateRange.start,
        endDate: dateRange.end,
        pipelineId: pipeline?.id,
        workspaceId: activeWorkspace?.id
      });
      setDeals(data);
    } catch (e) {
      toast.error("Errore nel caricamento dei dati per i report");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, [pipeline?.id, dateRange, activeWorkspace?.id]);

  // CALCOLO METRICHE
  const stats = useMemo(() => {
    if (!deals.length) {
      return { total: 0, won: 0, lost: 0, closed: 0, conversionRate: 0, pipelineValue: 0, avgClosingTime: 0 };
    }
    const total = deals.length;
    const won = deals.filter(d => d.stage_id?.toLowerCase().includes('vinto')).length;
    const lost = deals.filter(d => d.stage_id?.toLowerCase().includes('perso')).length;
    const closed = won + lost;
    
    const conversionRate = closed > 0 ? (won / closed) * 100 : 0;
    const pipelineValue = deals.reduce((acc, d) => acc + (d.value || 0), 0);
    
    const closedDeals = deals.filter(d => d.stage_id?.toLowerCase().includes('vinto') || d.stage_id?.toLowerCase().includes('perso'));
    const validClosedDeals = closedDeals.filter(d => d.created_at && d.updated_at);
    
    const totalClosingDays = validClosedDeals.reduce((acc, d) => {
      try {
        const start = parseISO(d.created_at);
        const end = parseISO(d.updated_at);
        const days = differenceInDays(end, start);
        return acc + (isNaN(days) ? 0 : days);
      } catch (e) {
        return acc;
      }
    }, 0);

    const avgClosingTime = validClosedDeals.length > 0 ? totalClosingDays / validClosedDeals.length : 0;

    return { total, won, lost, closed, conversionRate, pipelineValue, avgClosingTime };
  }, [deals]);

  // DATI GRAFICI
  const monthlyData = useMemo(() => {
    if (!deals.length) return [];
    const months: Record<string, any> = {};
    deals.forEach(d => {
      try {
        const month = format(parseISO(d.created_at), 'MMM yy', { locale: it });
        if (!months[month]) months[month] = { name: month, total: 0, won: 0, value: 0 };
        months[month].total += 1;
        months[month].value += (d.value || 0);
        if (d.stage_id?.toLowerCase().includes('vinto')) months[month].won += 1;
      } catch (e) {
        console.warn("Invalid date in deal:", d);
      }
    });
    return Object.values(months);
  }, [deals]);

   const salesPersonData = useMemo(() => {
    if (!deals.length) return [];
    const sales: Record<string, any> = {};
    deals.forEach(d => {
      const user = d.assigned_to || 'Non Assegnato';
      if (!sales[user]) sales[user] = { name: user, total: 0, won: 0, value: 0 };
      sales[user].total += 1;
      sales[user].value += (d.value || 0);
      if (d.stage_id?.toLowerCase().includes('vinto')) sales[user].won += 1;
    });
    return Object.values(sales).sort((a: any, b: any) => b.value - a.value);
  }, [deals]);

  const stageDistribution = useMemo(() => {
    if (!deals.length) return [];
    const stagesDict: Record<string, any> = {};
    deals.forEach(d => {
      const stage = d.stage_id || 'Senza Stage'; 
      if (!stagesDict[stage]) stagesDict[stage] = { name: stage, value: 0 };
      stagesDict[stage].value += 1;
    });
    return Object.values(stagesDict).sort((a: any, b: any) => b.value - a.value);
  }, [deals]);

  const exportToCSV = () => {
    const headers = ["ID", "Titolo", "Contatto", "Valore", "Stato", "Creato il", "Aggiornato il"];
    const rows = deals.map(d => [
      d.id, 
      d.title, 
      d.contact, 
      d.value, 
      d.stage_id, 
      d.created_at, 
      d.updated_at
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `report_crm_${format(new Date(), 'yyyyMMdd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading && deals.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#f8fafc] p-8">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Caricamento Analisi...</p>
      </div>
    );
  }

  const COLORS = ['#2FC6F6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] overflow-y-auto p-4 md:p-8">
      {/* Filters & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Report & Analisi CRM</h1>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">
            Visualizzazione dati per: <span className="text-blue-600">{pipeline?.name || 'Tutte le Pipeline'}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 flex items-center gap-3 shadow-sm">
            <CalendarIcon size={16} className="text-slate-400" />
            <input 
              type="date" 
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="text-xs font-bold bg-transparent border-none focus:ring-0 p-0"
            />
            <span className="text-slate-300">→</span>
            <input 
              type="date" 
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="text-xs font-bold bg-transparent border-none focus:ring-0 p-0"
            />
          </div>

          <DropdownMenuUI onExportCSV={exportToCSV} />
        </div>
      </div>

      {/* KPI Overviews */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
         <MetricCard 
          title="Conversion Rate" 
          value={`${stats.conversionRate.toFixed(1)}%`} 
          description="Rapporto Vinti / Tot. Chiusi"
          icon={<TrendingUp size={20} />}
          trend="+2.4%"
          color="text-emerald-600"
          bg="bg-emerald-50"
         />
         <MetricCard 
          title="Valore Pipeline" 
          value={`€${(stats.pipelineValue / 1000).toFixed(1)}k`} 
          description="Incluso affari aperti"
          icon={<Target size={20} />}
          trend="+12%"
          color="text-blue-600"
          bg="bg-blue-50"
         />
         <MetricCard 
          title="Affari Vinti" 
          value={stats.won} 
          description="Totale vinte in periodo"
          icon={<Users size={20} />}
          trend={`Su ${stats.total} totali`}
          color="text-indigo-600"
          bg="bg-indigo-50"
         />
         <MetricCard 
          title="Tempo Chiusura" 
          value={`${stats.avgClosingTime.toFixed(0)} gg`} 
          description="Media gg per chiusura"
          icon={<Clock size={20} />}
          trend="-3 gg"
          color="text-amber-600"
          bg="bg-amber-50"
         />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        
        {/* Monthly Trend */}
        <Card className="rounded-[32px] border-none shadow-xl shadow-slate-200/50 overflow-hidden">
          <CardHeader className="border-b border-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-black text-slate-800 uppercase">Trend Mensile</CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Affari creati e vinti per mese</CardDescription>
              </div>
              <BarChart3 className="text-slate-300" size={20} />
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2FC6F6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#2FC6F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontWeight: 900, marginBottom: '4px' }}
                    />
                    <Area type="monotone" dataKey="total" stroke="#2FC6F6" fillOpacity={1} fill="url(#colorTotal)" strokeWidth={3} />
                    <Area type="monotone" dataKey="won" stroke="#10b981" fillOpacity={0} strokeWidth={3} />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sales Performance */}
        <Card className="rounded-[32px] border-none shadow-xl shadow-slate-200/50 overflow-hidden">
          <CardHeader className="border-b border-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-black text-slate-800 uppercase">Top Sales</CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Valore pipeline per commerciale</CardDescription>
              </div>
              <Users className="text-slate-300" size={20} />
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesPersonData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" axisLine={false} tickLine={false} hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      width={100}
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#1e293b' }} 
                    />
                    <Tooltip cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="value" fill="#2FC6F6" radius={[0, 10, 10, 0]} barSize={20} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pipeline Funnel */}
        <Card className="rounded-[32px] border-none shadow-xl shadow-slate-200/50 overflow-hidden lg:col-span-2">
          <CardHeader className="border-b border-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-black text-slate-800 uppercase">Pipeline Funnel</CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Distribuzione affari per stage</CardDescription>
              </div>
              <Target className="text-slate-300" size={20} />
            </div>
          </CardHeader>
          <CardContent className="pt-12 pb-8">
            <div className="h-[300px] w-full max-w-4xl mx-auto">
               <ResponsiveContainer width="100%" height="100%">
                  <FunnelChart>
                    <Tooltip />
                    <Funnel
                      dataKey="value"
                      data={stageDistribution}
                      isAnimationActive
                    >
                      <LabelList position="right" fill="#64748b" stroke="none" dataKey="name" />
                      {stageDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Funnel>
                  </FunnelChart>
               </ResponsiveContainer>
            </div>

            {/* Stage Grid on mobile or detailed list */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-12">
               {stageDistribution.map((stage, idx) => (
                 <div key={idx} className="bg-slate-50 rounded-2xl p-4 flex flex-col items-center text-center">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white mb-2 shadow-md" style={{ backgroundColor: COLORS[idx % COLORS.length] }}>
                      <span className="text-[10px] font-bold">{idx + 1}</span>
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate w-full">{stage.name}</span>
                    <span className="text-sm font-black text-slate-900 mt-1">{stage.value}</span>
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

const MetricCard = ({ title, value, description, icon, trend, color, bg }: any) => (
  <Card className="rounded-[24px] border-none shadow-lg shadow-slate-200/40 relative overflow-hidden group">
    <div className={`absolute top-0 right-0 w-32 h-32 ${bg} rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform duration-500`} />
    <CardContent className="pt-6 pb-6 relative">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${bg} ${color} flex items-center justify-center shadow-sm`}>
          {icon}
        </div>
        <div className="flex flex-col items-end">
           <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[10px] font-black">{trend}</Badge>
        </div>
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
        <h3 className="text-2xl font-black text-slate-900 mt-1">{value}</h3>
        <p className="text-[10px] text-slate-400 font-medium mt-1">{description}</p>
      </div>
    </CardContent>
  </Card>
);

const DropdownMenuUI = ({ onExportCSV }: { onExportCSV: () => void }) => (
  <div className="flex gap-2">
    <Button 
      variant="outline" 
      onClick={onExportCSV}
      className="bg-white border-slate-200 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest h-10 hover:bg-slate-50 gap-2"
    >
      <Download size={14} /> EXPORT CSV
    </Button>
    <Button 
      variant="outline" 
      onClick={() => window.print()}
      className="bg-white border-slate-200 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest h-10 hover:bg-slate-50 gap-2"
    >
      <FileText size={14} /> PDF
    </Button>
  </div>
);
