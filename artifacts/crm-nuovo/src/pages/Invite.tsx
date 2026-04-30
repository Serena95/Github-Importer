import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Layout, UserPlus } from 'lucide-react';

const Invite: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-100 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl opacity-50"></div>

      <Card className="max-w-md w-full shadow-2xl border-none rounded-[2rem] relative z-10 overflow-hidden bg-white">
        <CardContent className="p-10 md:p-12 text-center">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-emerald-200">
            <UserPlus size={32} />
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-slate-800 mb-2">Unisciti a Nexus</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-10">Accetta l'invito al workspace</p>
          
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Inviato da</p>
                <p className="text-sm font-black text-slate-800">Team Nexus Admin</p>
            </div>
            
            <Button className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-emerald-100 transition-all active:scale-[0.98]">
              Accetta e Registrati
            </Button>
            
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
              Hai già un account? <a href="/login" className="text-blue-500 hover:underline">Accedi qui</a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Invite;
