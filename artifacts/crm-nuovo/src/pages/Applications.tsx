import React from 'react';
import { Grid, Store, Layers, Plus, Search, Star, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Applications: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Applicazioni</h1>
          <p className="text-slate-500">Estendi le funzionalità di Nexus con app e integrazioni</p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-[#2FC6F6] hover:bg-[#1eb0e0] text-white rounded-full px-6 font-bold">
            <Store size={18} className="mr-2" />
            MARKETPLACE
          </Button>
          <Button variant="outline" className="rounded-full px-6 font-bold border-blue-200 text-blue-600 hover:bg-blue-50">
            <Plus size={18} className="mr-2" />
            SVILUPPA APP
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input placeholder="Cerca applicazioni..." className="pl-10 bg-slate-50 border-none" />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="font-bold text-lg text-slate-800">App Installate</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: 'Google Calendar Sync', provider: 'Nexus', rating: 4.8, installs: '50k+', icon: 'https://cdn-icons-png.flaticon.com/512/2991/2991147.png' },
            { name: 'Zoom Integration', provider: 'Zoom Video', rating: 4.5, installs: '120k+', icon: 'https://cdn-icons-png.flaticon.com/512/3670/3670246.png' },
            { name: 'Stripe Payments', provider: 'Stripe', rating: 4.9, installs: '30k+', icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968382.png' },
          ].map((app, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow border-slate-100">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <img src={app.icon} alt={app.name} className="w-16 h-16 rounded-2xl object-contain bg-slate-50 p-2" referrerPolicy="no-referrer" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 truncate">{app.name}</h3>
                    <p className="text-sm text-slate-500">{app.provider}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                        <Star size={12} fill="currentColor" /> {app.rating}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Download size={12} /> {app.installs}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <Button variant="ghost" className="text-blue-600 hover:bg-blue-50 text-xs font-bold rounded-full">
                    GESTISCI
                  </Button>
                  <Button variant="ghost" size="icon"><ExternalLink size={16} className="text-slate-400" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Applications;
