import React, { useState, useEffect } from 'react';
import { Target, Megaphone, Smartphone, Mail, UserPlus, BarChart3, Plus, Search, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';

const Marketing: React.FC<{ activeTab?: string }> = ({ activeTab }) => {
  const { tenant } = useAuth();
  const [totalLeads, setTotalLeads] = useState(892); 

  useEffect(() => {
    if (!tenant) return;
    const unsub = onSnapshot(collection(db, 'tenants', tenant.id, 'leads'), (snap) => {
      setTotalLeads(snap.size);
    });
    return () => unsub();
  }, [tenant]);

  const renderContent = () => {
    if (activeTab === 'marketing-email') {
      return (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800">Email Marketing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-slate-100">
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Template Disponibili</h3>
                <div className="space-y-4">
                  {['Welcome Email', 'Promozionale Q2', 'Follow-up Evento'].map(t => (
                    <div key={t} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm font-medium">{t}</span>
                      <Button variant="ghost" size="sm" className="text-blue-500 font-bold">USA</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <button className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 text-slate-300 hover:border-blue-400 hover:text-blue-400 transition-all bg-white/50">
              <Plus size={32} className="mb-2" />
              <span className="font-bold uppercase tracking-widest text-xs">Nuova Campagna Email</span>
            </button>
          </div>
        </div>
      );
    }

    if (activeTab === 'marketing-sms') {
      return (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800">SMS Marketing</h2>
          <div className="bg-white p-8 rounded-2xl border border-slate-100 flex flex-col items-center text-center">
            <Smartphone size={48} className="text-purple-500 mb-4" />
            <h3 className="text-xl font-bold">Invia SMS ai tuoi contatti</h3>
            <p className="text-slate-500 max-w-sm mt-2">Collega un provider SMS (Twilio, MessageBird) per iniziare a inviare messaggi diretti.</p>
            <Button className="mt-6 bg-[#2FC6F6] text-white rounded-full">CONFIGURA SMS</Button>
          </div>
        </div>
      );
    }

    if (activeTab === 'marketing-campaigns') {
      return (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800">Tutte le Campagne</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-800">Lista Campagne</h2>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <Input placeholder="Cerca campagne..." className="pl-10 h-9 text-sm" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-3 font-semibold">Campagna</th>
                    <th className="px-6 py-3 font-semibold">Canale</th>
                    <th className="px-6 py-3 font-semibold">Stato</th>
                    <th className="px-6 py-3 font-semibold">Inviati</th>
                    <th className="px-6 py-3 font-semibold">Aperti</th>
                    <th className="px-6 py-3 font-semibold">Click</th>
                    <th className="px-6 py-3 font-semibold"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {[
                    { name: 'Sconto Estivo 2024', channel: 'Email', status: 'In corso', sent: '12,400', open: '24%', click: '5.2%' },
                    { name: 'Webinar AI CRM', channel: 'SMS', status: 'Completata', sent: '2,500', open: '98%', click: '12.4%' },
                    { name: 'Newsletter Maggio', channel: 'Email', status: 'Pianificata', sent: '45,000', open: '--', click: '--' },
                    { name: 'Promo New User', channel: 'Email', status: 'In corso', sent: '8,900', open: '32%', click: '8.1%' },
                  ].map((camp, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-800">{camp.name}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          {camp.channel === 'Email' ? <Mail size={14} /> : <Smartphone size={14} />}
                          {camp.channel}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={
                          camp.status === 'In corso' ? 'bg-blue-500' : 
                          camp.status === 'Completata' ? 'bg-emerald-500' : 'bg-slate-400'
                        }>
                          {camp.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{camp.sent}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{camp.open}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{camp.click}</td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="icon"><MoreHorizontal size={16} /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'marketing-leads') {
      return (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800">Cattura Lead</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-slate-100 flex flex-col items-center p-8 text-center bg-white">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                <Target size={32} />
              </div>
              <h3 className="font-bold">Landing Pages</h3>
              <p className="text-xs text-slate-500 mt-2 mb-6">Crea pagine di cattura per le tue campagne.</p>
              <Button variant="outline" className="w-full rounded-full border-blue-100 text-blue-600 font-bold hover:bg-blue-50">GESTISCI</Button>
            </Card>
            <Card className="border-slate-100 flex flex-col items-center p-8 text-center bg-white">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                <Mail size={32} />
              </div>
              <h3 className="font-bold">Moduli Web</h3>
              <p className="text-xs text-slate-500 mt-2 mb-6">Moduli da inserire nel tuo sito web.</p>
              <Button variant="outline" className="w-full rounded-full border-emerald-100 text-emerald-600 font-bold hover:bg-emerald-50">GESTISCI</Button>
            </Card>
            <Card className="border-slate-100 flex flex-col items-center p-8 text-center bg-white">
              <div className="w-16 h-16 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center mb-4">
                <Smartphone size={32} />
              </div>
              <h3 className="font-bold">Widget Chat</h3>
              <p className="text-xs text-slate-500 mt-2 mb-6">Cattura lead tramite chat dal vivo.</p>
              <Button variant="outline" className="w-full rounded-full border-purple-100 text-purple-600 font-bold hover:bg-purple-50">GESTISCI</Button>
            </Card>
          </div>
        </div>
      );
    }
    
    // Default overview
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Campagne Attive', value: '12', icon: Megaphone, color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'Email Inviate', value: '45.2k', icon: Mail, color: 'text-purple-500', bg: 'bg-purple-50' },
            { label: 'Nuovi Lead', value: totalLeads.toLocaleString(), icon: UserPlus, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            { label: 'Conversion Rate', value: '3.2%', icon: BarChart3, color: 'text-amber-500', bg: 'bg-amber-50' },
          ].map((stat, i) => (
            <Card key={i} className="border-slate-100">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-800">Campagne Recenti</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <Input placeholder="Cerca campagne..." className="pl-10 h-9 text-sm" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-3 font-semibold">Campagna</th>
                  <th className="px-6 py-3 font-semibold">Canale</th>
                  <th className="px-6 py-3 font-semibold">Stato</th>
                  <th className="px-6 py-3 font-semibold">Inviati</th>
                  <th className="px-6 py-3 font-semibold">Aperti</th>
                  <th className="px-6 py-3 font-semibold">Click</th>
                  <th className="px-6 py-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[
                  { name: 'Sconto Estivo 2024', channel: 'Email', status: 'In corso', sent: '12,400', open: '24%', click: '5.2%' },
                  { name: 'Webinar AI CRM', channel: 'SMS', status: 'Completata', sent: '2,500', open: '98%', click: '12.4%' },
                  { name: 'Newsletter Maggio', channel: 'Email', status: 'Pianificata', sent: '45,000', open: '--', click: '--' },
                  { name: 'Promo New User', channel: 'Email', status: 'In corso', sent: '8,900', open: '32%', click: '8.1%' },
                ].map((camp, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{camp.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        {camp.channel === 'Email' ? <Mail size={14} /> : <Smartphone size={14} />}
                        {camp.channel}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={
                        camp.status === 'In corso' ? 'bg-blue-500' : 
                        camp.status === 'Completata' ? 'bg-emerald-500' : 'bg-slate-400'
                      }>
                        {camp.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{camp.sent}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{camp.open}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{camp.click}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon"><MoreHorizontal size={16} /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Marketing</h1>
          <p className="text-slate-500">Crea e gestisci le tue campagne di marketing multicanale</p>
        </div>
        <Button className="bg-[#2FC6F6] hover:bg-[#1eb0e0] text-white rounded-full px-6 font-bold shadow-lg shadow-blue-100">
          <Plus size={18} className="mr-2" />
          CREA CAMPAGNA
        </Button>
      </div>

      {renderContent()}
    </div>
  );
};

export default Marketing;
