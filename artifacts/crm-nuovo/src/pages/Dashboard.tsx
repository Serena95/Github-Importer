import React, { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { collection, onSnapshot, query, limit, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

interface Activity {
  id: string;
  user: string;
  action: string;
  target: string;
  detail: string;
  rawTime: Date;
  time: string;
}

const COLORS = ['#2D3E8B', '#F2B233', '#555555'];

import { useCRMStore } from '@/stores/crmStore';
import { supabaseCRMService } from '@/services/supabaseCRMService';

const Dashboard: React.FC<{ activeTab?: string }> = ({ activeTab: propActiveTab }) => {
  const { activeWorkspace, deals, contacts, companies, fetchInitialData } = useCRMStore();
  const [counts, setCounts] = useState({
    leads: 0,
    deals: 0,
    tasks: 0,
    companies: 0,
    revenue: 0
  });
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);

  useEffect(() => {
    if (!activeWorkspace) return;

    const unsubDeals = onSnapshot(query(collection(db, 'crm_deals'), where('workspace_id', '==', activeWorkspace.id)), (snap) => {
      setCounts(prev => ({ 
        ...prev, 
        deals: snap.size,
        revenue: snap.docs.reduce((acc, doc) => acc + (doc.data().value || 0), 250000) // Base revenue for demo if needed
      }));
    });

    const unsubContacts = onSnapshot(query(collection(db, 'crm_contacts'), where('workspace_id', '==', activeWorkspace.id)), (snap) => {
      setCounts(prev => ({ ...prev, leads: snap.size }));
    });

    const unsubCompanies = onSnapshot(query(collection(db, 'crm_companies'), where('workspace_id', '==', activeWorkspace.id)), (snap) => {
      setCounts(prev => ({ ...prev, companies: snap.size }));
    });

    const unsubTasks = onSnapshot(query(collection(db, 'crm_tasks'), where('workspace_id', '==', activeWorkspace.id)), (snap) => {
      setCounts(prev => ({ ...prev, tasks: snap.size }));
    });

    // Recent activities (from crm_activities)
    const unsubActivities = onSnapshot(
      query(collection(db, 'crm_activities'), limit(10), orderBy('created_at', 'desc')), 
      (snap) => {
        setRecentActivities(snap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            user: data.author_name || 'Sistema',
            action: data.title || 'Attività',
            target: data.description || '-',
            detail: data.type === 'task' ? 'Task' : data.type === 'note' ? 'Nota' : 'Sistema',
            rawTime: data.created_at ? new Date(data.created_at) : new Date(),
            time: data.created_at ? formatDistanceToNow(new Date(data.created_at), { addSuffix: true, locale: it }) : 'Ora'
          };
        }));
      }
    );

    return () => {
      unsubDeals();
      unsubContacts();
      unsubCompanies();
      unsubTasks();
      unsubActivities();
    };
  }, [activeWorkspace?.id]);

  // Activities are already managed in the previous effect via unsubActivities

  const chartData = [
    { name: 'Gen', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 600 },
    { name: 'Apr', value: 800 },
    { name: 'Mag', value: 500 },
    { name: 'Giu', value: 900 },
  ];

  const pieData = [
    { name: 'Vinti', value: 45 },
    { name: 'Persi', value: 25 },
    { name: 'In Corso', value: 30 },
  ];

  const renderStats = (stat: any, i: number) => (
    <Card key={i} className="border-none shadow-sm rounded-[8px] overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className={cn("w-12 h-12 rounded-[8px] flex items-center justify-center", stat.bg, stat.color)}>
            <stat.icon size={24} />
          </div>
          <div className={cn("flex items-center text-sm font-bold", stat.trendColor)}>
            {stat.trend.startsWith('+') ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            {stat.trend}
          </div>
        </div>
        <div className="mt-4">
          <p className="text-xs text-brand-gray/60 font-bold uppercase tracking-wider">{stat.label}</p>
          <h3 className="text-2xl font-black text-brand-blue mt-1">{stat.value}</h3>
        </div>
      </CardContent>
    </Card>
  );

  const renderContent = () => {
    const tab = propActiveTab || 'dashboard-home';
    switch (tab) {
      case 'dashboard-kpi':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-none shadow-sm rounded-[8px] overflow-hidden">
              <CardHeader><CardTitle className="text-brand-blue font-black uppercase tracking-tight">KPI Vendite Mensili</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEEEEE" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#555555', fontSize: 11}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#555555', fontSize: 11}} />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#2D3E8B" strokeWidth={3} dot={{ r: 6, fill: '#F2B233', strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm rounded-[8px] overflow-hidden">
              <CardHeader><CardTitle className="text-brand-blue font-black uppercase tracking-tight">Distribuzione Lead</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'dashboard-recent':
        return (
          <Card className="border-none shadow-sm rounded-[8px] overflow-hidden">
            <CardHeader className="border-b border-[#EEEEEE] pb-4">
              <CardTitle className="text-base font-black text-brand-blue uppercase tracking-tight">Tutte le Attività Recenti</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {recentActivities.length > 0 ? recentActivities.map((activity, i) => (
                  <div key={activity.id} className="flex gap-4 group">
                    <div className="relative">
                      <div className="w-10 h-10 bg-brand-bg rounded-full flex items-center justify-center text-brand-gray group-hover:bg-brand-blue/10 group-hover:text-brand-blue transition-colors">
                        <Clock size={20} />
                      </div>
                      {i < recentActivities.length - 1 && <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[1px] h-6 bg-[#EEEEEE]"></div>}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-brand-gray">
                          <span className="font-bold text-brand-blue">{activity.user}</span> {activity.action} 
                          <span className="text-brand-blue font-bold"> "{activity.target}"</span>
                        </p>
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider",
                          activity.detail === 'Lead' ? "bg-blue-50 text-blue-600" :
                          activity.detail === 'Deal' ? "bg-emerald-50 text-emerald-600" :
                          "bg-amber-50 text-amber-600"
                        )}>
                          {activity.detail}
                        </span>
                      </div>
                      <p className="text-[10px] text-brand-gray/60 font-bold uppercase mt-1 tracking-widest">{activity.time}</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-brand-gray/50 font-bold uppercase text-[10px] tracking-widest bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                    Nessuna attività recente
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      case 'dashboard-pipeline':
        return (
          <Card className="border-none shadow-sm rounded-[8px] overflow-hidden">
            <CardHeader><CardTitle className="text-brand-blue font-black uppercase tracking-tight">Panoramica Pipeline</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#EEEEEE" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#555555', fontSize: 11}} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#555555', fontSize: 11}} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#2D3E8B" radius={[0, 6, 6, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Lead Totali', value: counts.leads.toLocaleString(), icon: Users, color: 'text-brand-blue', bg: 'bg-brand-blue/10', trend: '+12%', trendColor: 'text-emerald-600' },
                { label: 'Affari Attivi', value: counts.deals.toLocaleString(), icon: Briefcase, color: 'text-brand-blue', bg: 'bg-brand-blue/10', trend: '+8%', trendColor: 'text-emerald-600' },
                { label: 'Fatturato', value: `€${counts.revenue.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '-3%', trendColor: 'text-rose-600' },
                { label: 'Task Totali', value: counts.tasks.toLocaleString(), icon: CheckCircle2, color: 'text-brand-yellow', bg: 'bg-brand-yellow/10', trend: '+15%', trendColor: 'text-emerald-600' },
              ].map((stat, i) => renderStats(stat, i))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 border-none shadow-sm rounded-[8px] overflow-hidden">
                <CardHeader className="border-b border-[#EEEEEE] pb-4">
                  <CardTitle className="text-base font-black text-brand-blue uppercase tracking-tight">Previsione Pipeline Vendite</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEEEEE" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#555555', fontSize: 11, fontWeight: 600}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#555555', fontSize: 11, fontWeight: 600}} />
                        <Tooltip 
                          contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', fontSize: '12px', fontWeight: 'bold'}}
                          cursor={{fill: '#f8fafc'}}
                        />
                        <Bar dataKey="value" fill="#2D3E8B" radius={[6, 6, 0, 0]} barSize={45} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-[8px] overflow-hidden">
                <CardHeader className="border-b border-[#EEEEEE] pb-4">
                  <CardTitle className="text-base font-black text-brand-blue uppercase tracking-tight">Conversione Affari</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={85}
                          paddingAngle={8}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-6 space-y-3">
                    {pieData.map((item, i) => (
                      <div key={item.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: COLORS[i]}}></div>
                          <span className="text-brand-gray font-bold">{item.name}</span>
                        </div>
                        <span className="font-black text-brand-blue">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="border-none shadow-sm rounded-[8px] overflow-hidden">
              <CardHeader className="border-b border-[#EEEEEE] pb-4">
                <CardTitle className="text-base font-black text-brand-blue uppercase tracking-tight">Attività Recente</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {recentActivities.length > 0 ? recentActivities.map((activity, i) => (
                    <div key={activity.id} className="flex gap-4 group">
                      <div className="relative">
                        <div className="w-10 h-10 bg-brand-bg rounded-full flex items-center justify-center text-brand-gray group-hover:bg-brand-blue/10 group-hover:text-brand-blue transition-colors">
                          <Clock size={20} />
                        </div>
                        {i < recentActivities.length - 1 && <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[1px] h-6 bg-[#EEEEEE]"></div>}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-brand-gray">
                            <span className="font-bold text-brand-blue">{activity.user}</span> {activity.action} 
                            <span className="text-brand-blue font-bold"> "{activity.target}"</span>
                          </p>
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider",
                            activity.detail === 'Lead' ? "bg-blue-50 text-blue-600" :
                            activity.detail === 'Deal' ? "bg-emerald-50 text-emerald-600" :
                            "bg-amber-50 text-amber-600"
                          )}>
                            {activity.detail}
                          </span>
                        </div>
                        <p className="text-[10px] text-brand-gray/60 font-bold uppercase mt-1 tracking-widest">{activity.time}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-brand-gray/50 font-bold uppercase text-[10px] tracking-widest bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                      Nessuna attività recente
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        );
    }
  };

  const activeTitle = propActiveTab === 'dashboard-kpi' ? 'KPI Performance' : 
                   propActiveTab === 'dashboard-recent' ? 'Attività Recenti' : 
                   propActiveTab === 'dashboard-pipeline' ? 'Pipeline Overview' : 'Dashboard';

  return (
    <div className="space-y-6 lg:space-y-8 p-4 sm:p-6 lg:p-8 bg-brand-bg min-h-full overflow-x-hidden w-full max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-black tracking-tight text-brand-blue uppercase">
            {activeTitle}
          </h1>
          <p className="text-xs lg:text-base text-brand-gray font-medium">Benvenuto! Ecco cosa sta succedendo oggi.</p>
        </div>
        <div className="flex items-center gap-2 lg:gap-3">
          <Button variant="outline" size="sm" className="rounded-full px-3 lg:px-4 font-bold text-[10px] sm:text-xs border-[#DDDDDD] text-brand-blue shrink-0">ESPORTA</Button>
          <Button size="sm" className="bg-brand-yellow hover:bg-brand-yellow/90 text-brand-blue rounded-full px-4 lg:px-6 font-bold text-[10px] sm:text-xs shadow-lg shadow-brand-yellow/20 shrink-0">
            AGGIORNA
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:gap-8 max-w-full overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;
