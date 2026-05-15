import React, { useEffect, useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

const PWAInstallPrompt: React.FC = () => {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(() =>
    localStorage.getItem('pwa-prompt-dismissed') === 'true'
  );

  useEffect(() => {
    // Already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // iOS detection
    const ua = navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua) && !(window as any).MSStream;
    setIsIOS(ios);

    if (ios && !dismissed) {
      // Show iOS instructions after a brief delay
      const t = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(t);
    }

    // Android / Chrome — listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
      if (!dismissed) {
        setTimeout(() => setShow(true), 3000);
      }
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Installed via browser
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShow(false);
      deferredPrompt = null;
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [dismissed]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setShow(false);
      }
      deferredPrompt = null;
    }
  };

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (!show || isInstalled || dismissed) return null;

  return (
    <div className={cn(
      "fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-2rem)] max-w-sm",
      "bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden",
      "animate-in slide-in-from-bottom-4 duration-300"
    )}>
      {/* Gradient header */}
      <div className="h-1.5 bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-400"/>

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-200">
            <span className="text-white font-black text-xl">N</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-black text-slate-800 text-sm">Installa Nexus CRM</p>
                <p className="text-xs text-slate-500 mt-0.5">Accesso rapido dalla schermata Home</p>
              </div>
              <button onClick={handleDismiss}
                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors shrink-0 mt-0.5">
                <X size={14}/>
              </button>
            </div>

            {isIOS ? (
              <div className="mt-3 p-3 bg-slate-50 rounded-xl space-y-1.5">
                <p className="text-[11px] font-bold text-slate-600">Come installare su iPhone/iPad:</p>
                <p className="text-[11px] text-slate-500">
                  1. Tocca <strong>Condividi</strong> <span className="text-blue-500">⬆</span> in basso nel browser
                </p>
                <p className="text-[11px] text-slate-500">
                  2. Scorri e tocca <strong>"Aggiungi a schermata Home"</strong>
                </p>
              </div>
            ) : (
              <button onClick={handleInstall}
                className="mt-3 w-full flex items-center justify-center gap-2 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-blue-200 transition-all">
                <Download size={14}/> Installa app
              </button>
            )}
          </div>
        </div>

        {/* Benefit pills */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {['Accesso offline', 'Notifiche push', 'Più veloce'].map(b => (
            <span key={b} className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {b}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
