import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Layout, Mail, Lock, LogIn } from 'lucide-react';
import { toast } from 'sonner';

const Login: React.FC = () => {
  const { signIn, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as any)?.from?.pathname || "/crm/affari";

  // If already logged in, redirect to intended destination or CRM
  useEffect(() => {
    if (!loading && user) {
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, from]);

  const handleSignInGoogle = async () => {
    try {
      await signIn();
    } catch (error) {
      console.error("Sign in failed:", error);
      toast.error("Accesso con Google fallito");
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Inserisci email e password");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // For now we use the existing signIn (Google), 
      // but in a real scenario this would be signInWithEmailAndPassword
      toast.info("Accesso via email in fase di attivazione. Usa Google per il momento.");
    } catch (error) {
      toast.error("Credenziali non valide");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-40"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-100 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl opacity-40"></div>

      <div className="max-w-[420px] w-full z-10">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-xl shadow-blue-200">
            <Layout size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-blue-600">Nexus CRM</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Smarter Workspace</p>
        </div>

        <Card className="shadow-2xl border-none rounded-[2.5rem] bg-white overflow-hidden">
          <CardContent className="p-8 md:p-10">
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tua@email.it" 
                    className="h-12 pl-12 rounded-2xl border-slate-100 bg-slate-50 focus-visible:ring-blue-600/20 focus-visible:border-blue-600 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Password</label>
                  <button 
                    type="button" 
                    onClick={() => navigate('/forgot')}
                    className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline"
                  >
                    Dimenticata?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="h-12 pl-12 rounded-2xl border-slate-100 bg-slate-50 focus-visible:ring-blue-600/20 focus-visible:border-blue-600 transition-all"
                  />
                </div>
              </div>

              <Button 
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-100 transition-all active:scale-[0.98] mt-2"
              >
                {isSubmitting ? 'Accesso in corso...' : (
                  <>
                    <LogIn size={18} className="mr-2" /> Accedi
                  </>
                )}
              </Button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-4 text-slate-300 font-bold uppercase tracking-widest text-[10px]">oppure</span>
              </div>
            </div>

            <Button 
              onClick={handleSignInGoogle} 
              variant="outline"
              className="w-full h-14 bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 flex items-center justify-center gap-4 font-bold text-sm rounded-2xl shadow-sm transition-all active:scale-[0.98]"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              Accedi con Google
            </Button>

            <div className="mt-10 text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Hai ricevuto un invito?
              </p>
              <button 
                onClick={() => navigate('/invite')}
                className="mt-2 text-xs font-black text-blue-600 uppercase tracking-[0.15em] hover:underline"
              >
                Accedi con invito
              </button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center mt-8 text-[10px] text-slate-300 font-bold uppercase tracking-widest prose-sm">
          &copy; 2024 Nexus CRM. Tutti i diritti riservati.
        </p>
      </div>
    </div>
  );
};

export default Login;

