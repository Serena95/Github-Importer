import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Layout, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-100 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl opacity-50"></div>

      <Card className="max-w-md w-full shadow-2xl border-none rounded-[2rem] relative z-10 overflow-hidden bg-white">
        <CardContent className="p-10 md:p-12 text-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/login')}
            className="absolute top-6 left-6 rounded-full h-10 w-10 p-0 text-slate-400 hover:text-slate-800 hover:bg-slate-100"
          >
            <ArrowLeft size={20} />
          </Button>

          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-blue-200">
            <Layout size={32} />
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-slate-800 mb-2">Recupero Password</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-10">Inserisci la tua email</p>
          
          <div className="space-y-6">
            <Input placeholder="Email Aziendale" className="h-12 rounded-xl border-slate-200 bg-slate-50/50" />
            <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-100 transition-all active:scale-[0.98]">
              Invia Link di Recupero
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
