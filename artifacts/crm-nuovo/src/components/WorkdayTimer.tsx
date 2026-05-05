import React, { useState } from 'react';
import { Clock, Play, Pause, Square, ChevronDown, Coffee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkday, formatElapsed } from '@/hooks/useWorkday';
import { cn } from '@/lib/utils';

const WorkdayTimer: React.FC = () => {
  const { entry, elapsed, loading, startDay, pauseDay, resumeDay, endDay } = useWorkday();
  const [open, setOpen] = useState(false);

  if (loading) return null;

  const status = entry?.status ?? 'idle';

  const statusConfig = {
    idle: { label: 'Inizia giornata', color: 'text-white/50', dot: 'bg-slate-400', pulse: false },
    working: { label: 'In lavoro', color: 'text-emerald-400', dot: 'bg-emerald-400', pulse: true },
    paused: { label: 'In pausa', color: 'text-amber-400', dot: 'bg-amber-400', pulse: false },
  }[status];

  return (
    <div className="relative hidden md:block">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 transition-colors border border-white/10',
          status !== 'idle' && 'border-white/20'
        )}
      >
        <div className="relative flex items-center">
          <div className={cn('w-2 h-2 rounded-full', statusConfig.dot)} />
          {statusConfig.pulse && (
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-75" />
          )}
        </div>
        {status !== 'idle' ? (
          <span className={cn('text-xs font-black tabular-nums', statusConfig.color)}>
            {formatElapsed(elapsed)}
          </span>
        ) : (
          <span className="text-xs font-bold text-white/50">Timbra</span>
        )}
        <Clock size={13} className="text-white/40" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute top-10 right-0 z-40 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-100 bg-gradient-to-br from-slate-800 to-slate-900">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Registro giornata</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-black text-white tabular-nums">
                      {status !== 'idle' ? formatElapsed(elapsed) : '00:00'}
                    </p>
                    <p className={cn('text-xs font-bold mt-0.5', statusConfig.color)}>{statusConfig.label}</p>
                  </div>
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', {
                    'bg-emerald-500/20': status === 'working',
                    'bg-amber-500/20': status === 'paused',
                    'bg-slate-700': status === 'idle',
                  })}>
                    {status === 'working' && <Play size={20} className="text-emerald-400 fill-emerald-400" />}
                    {status === 'paused' && <Coffee size={20} className="text-amber-400" />}
                    {status === 'idle' && <Clock size={20} className="text-slate-400" />}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-3 space-y-2">
                {status === 'idle' && (
                  <button
                    onClick={() => { startDay(); setOpen(false); }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors text-left"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white shrink-0">
                      <Play size={16} className="fill-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Inizia giornata</p>
                      <p className="text-xs text-slate-500">Avvia il timer di lavoro</p>
                    </div>
                  </button>
                )}

                {status === 'working' && (
                  <>
                    <button
                      onClick={() => { pauseDay(); setOpen(false); }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors text-left"
                    >
                      <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-white shrink-0">
                        <Pause size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">Pausa</p>
                        <p className="text-xs text-slate-500">Il timer si metterà in pausa</p>
                      </div>
                    </button>
                    <button
                      onClick={() => { endDay(); setOpen(false); }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-rose-50 hover:bg-rose-100 transition-colors text-left"
                    >
                      <div className="w-9 h-9 rounded-xl bg-rose-500 flex items-center justify-center text-white shrink-0">
                        <Square size={16} className="fill-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">Fine giornata</p>
                        <p className="text-xs text-slate-500">Salva e termina il turno</p>
                      </div>
                    </button>
                  </>
                )}

                {status === 'paused' && (
                  <>
                    <button
                      onClick={() => { resumeDay(); setOpen(false); }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors text-left"
                    >
                      <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white shrink-0">
                        <Play size={16} className="fill-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">Riprendi</p>
                        <p className="text-xs text-slate-500">Continua a lavorare</p>
                      </div>
                    </button>
                    <button
                      onClick={() => { endDay(); setOpen(false); }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-rose-50 hover:bg-rose-100 transition-colors text-left"
                    >
                      <div className="w-9 h-9 rounded-xl bg-rose-500 flex items-center justify-center text-white shrink-0">
                        <Square size={16} className="fill-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">Fine giornata</p>
                        <p className="text-xs text-slate-500">Salva e termina il turno</p>
                      </div>
                    </button>
                  </>
                )}
              </div>

              <div className="px-4 pb-3 pt-0">
                <p className="text-[10px] text-slate-400 text-center">
                  Le timbrature vengono salvate automaticamente nel tuo workspace
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkdayTimer;
