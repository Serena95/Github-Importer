import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Users, 
  Target, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Download,
  Calendar as CalendarIcon,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';

const Analytics: React.FC = () => {
  const { tenant } = useAuth();
  const [counts, setCounts] = useState({
    leads: 0,
    deals: 0,
    contacts: 0,
    companies: 0,
    tasks: 0,
    revenue: 0
  });

  useEffect(() => {
    if (!tenant) return;

    const collections = ['leads', 'deals', 'contacts', 'companies', 'tasks'];
    const unsubs = collections.map(col => {
      return onSnapshot(collection(db, 'tenants', tenant.id, col), (snap) => {
        setCounts(prev => ({ ...prev, [col]: snap.size }));
        
        if (col === 'deals') {
          const totalRevenue = snap.docs.reduce((acc, doc) => acc + (doc.data().value || 0), 0);
          setCounts(prev => ({ ...prev, revenue: totalRevenue }));
        }
      }, (error) => handleFirestoreError(error, OperationType.LIST, `tenants/${tenant.id}/${col}`));
    });

    return () => unsubs.forEach(unsub => unsub());
  }, [tenant]);

  const salesData = [
    { name: 'Gen', value: 45000 },
    { name: 'Feb', value: 52000 },
    { name: 'Mar', value: 48000 },
    { name: 'Apr', value: 61000 },
    { name: 'Mag', value: 55000 },
    { name: 'Giu', value: 67000 },
  ];

  const funnelData = [
    { name: 'Lead', value: 400, color: '#2FC6F6' },
    { name: 'Contattati', value: 300, color: '#8b5cf6' },
    { name: 'Qualificati', value: 200, color: '#f59e0b' },
    { name: 'Proposta', value: 100, color: '#10b981' },
    { name: 'Chiusi', value: 50, color: '#10b981' },
  ];

  const agentPerformance = [
    { name: 'Marco', deals: 12, value: 125000 },
    { name: 'Giulia', deals: 15, value: 142000 },
    { name: 'Luca', deals: 8, value: 98000 },
    { name: 'Sara', deals: 10, value: 110000 },
  ];

  const COLORS = ['#2FC6F6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];

  return (
    <div className="h-full flex flex-col bg-[#f5f7fb] overflow-hidden">
      {/* Analytics Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 sm:py-6 shrink-0 shadow-sm z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 uppercase tracking-tight">Analisi CRM</h1>
            <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">Monitora le performance del tuo team e la salute della pipeline.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Button variant="outline" size="sm" className="rounded-full px-3 sm:px-4 font-bold text-[9px] sm:text-[10px] uppercase tracking-widest border-slate-200 h-8 sm:h-9">
              <CalendarIcon size={12} className="mr-2" /> <span className="hidden xs:inline">ULTIMI</span> 30 GIORNI
            </Button>
            <Button variant="outline" size="sm" className="rounded-full px-3 sm:px-4 font-bold text-[9px] sm:text-[10px] uppercase tracking-widest border-slate-200 h-8 sm:h-9">
              <Filter size={12} className="mr-2" /> FILTRI
            </Button>
            <Button className="bg-[#2FC6F6] hover:bg-[#1eb0e0] text-white font-bold rounded-full px-4 sm:px-6 text-[9px] sm:text-[10px] uppercase tracking-widest shadow-lg shadow-blue-200 h-8 sm:h-9">
              <Download size={12} className="mr-2" /> <span className="hidden xs:inline">ESPORTA REPORT</span><span className="xs:hidden">REPORT</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          {/* Top Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { label: 'Valore Pipeline', value: `€${counts.revenue.toLocaleString()}`, trend: '+0%', icon: Target, color: 'text-blue-500', bg: 'bg-blue-50' },
              { label: 'Affari Totali', value: counts.deals.toString(), trend: '+0%', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
              { label: 'Lead Generati', value: counts.leads.toString(), trend: '+0%', icon: Users, color: 'text-amber-500', bg: 'bg-amber-50' },
              { label: 'Task Attivi', value: counts.tasks.toString(), trend: '+0%', icon: CheckCircle2, color: 'text-purple-500', bg: 'bg-purple-50' },
            ].map((stat, i) => (
              <Card key={i} className="border-none shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className={cn("w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-sm", stat.bg, stat.color)}>
                      <stat.icon size={18} />
                    </div>
                    <div className={cn(
                      "flex items-center gap-1 text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full",
                      stat.trend.startsWith('+') ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                    )}>
                      {stat.trend.startsWith('+') ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                      {stat.trend}
                    </div>
                  </div>
                  <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-800">{stat.value}</h3>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-slate-50 p-5 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-widest">Andamento Vendite</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 h-[250px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2FC6F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#2FC6F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#94a3b8'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#94a3b8'}} dx={-10} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                      itemStyle={{ fontSize: '11px', fontWeight: 700 }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#2FC6F6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-slate-50 p-5 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-widest">Funnel di Vendita</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 h-[250px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#94a3b8'}} />
                    <Tooltip 
                      cursor={{fill: 'transparent'}}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                      {funnelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-50 p-5 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-widest">Performance Agenti</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto max-w-full">
                <table className="w-full text-left min-w-[600px]">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Agente</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Deal Chiusi</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Valore Totale</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Target</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Performance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {agentPerformance.map((agent, i) => (
                      <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {agent.name.charAt(0)}
                            </div>
                            <span className="text-sm font-bold text-slate-700">{agent.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-600">{agent.deals}</td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-800">€{agent.value.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(agent.value / 150000) * 100}%` }}></div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className="bg-emerald-50 text-emerald-600 border-none text-[10px] font-bold">
                            +{Math.floor(Math.random() * 20)}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
