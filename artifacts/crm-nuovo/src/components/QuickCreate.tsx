import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, UserPlus, DollarSign, Users, Building, CheckSquare, Calendar as CalendarIcon, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  color: string;
  action: () => void;
}

const QuickCreate: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const goAndDispatch = (path: string, eventName: string, detail?: any) => {
    navigate(path);
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent(eventName, detail ? { detail } : undefined));
    }, 200);
  };

  const actions: QuickAction[] = [
    {
      id: 'lead',
      label: 'Nuovo Lead',
      icon: UserPlus,
      color: 'bg-blue-500',
      action: () => goAndDispatch('/crm/leads', 'crm:openCreate', { type: 'lead' }),
    },
    {
      id: 'deal',
      label: 'Nuovo Affare',
      icon: DollarSign,
      color: 'bg-emerald-500',
      action: () => goAndDispatch('/crm/affari', 'crm:openCreate', { type: 'deal' }),
    },
    {
      id: 'contact',
      label: 'Nuovo Contatto',
      icon: Users,
      color: 'bg-amber-500',
      action: () => goAndDispatch('/crm/contacts', 'crm:openCreate', { type: 'contact' }),
    },
    {
      id: 'company',
      label: 'Nuova Azienda',
      icon: Building,
      color: 'bg-purple-500',
      action: () => goAndDispatch('/crm/companies', 'crm:openCreate', { type: 'company' }),
    },
    {
      id: 'task',
      label: 'Nuovo Task',
      icon: CheckSquare,
      color: 'bg-rose-500',
      action: () => goAndDispatch('/tasks', 'tasks:openCreate'),
    },
    {
      id: 'event',
      label: 'Nuovo Evento',
      icon: CalendarIcon,
      color: 'bg-cyan-500',
      action: () => navigate('/calendar'),
    },
    {
      id: 'doc',
      label: 'Nuovo Documento',
      icon: FileText,
      color: 'bg-slate-500',
      action: () => navigate('/docs'),
    },
  ];

  const handleAction = (action: QuickAction) => {
    setIsOpen(false);
    action.action();
  };

  return (
    <div className="fixed right-4 bottom-40 lg:bottom-28 z-[65]">
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-16 right-0 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-br from-blue-50 to-white">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Crea rapidamente</p>
                <p className="text-sm font-bold text-slate-800">Cosa vuoi aggiungere?</p>
              </div>
              <div className="p-2 max-h-[400px] overflow-y-auto">
                {actions.map((a, i) => (
                  <motion.button
                    key={a.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.025 }}
                    onClick={() => handleAction(a)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm group-hover:scale-105 transition-transform', a.color)}>
                      <a.icon size={16} />
                    </div>
                    <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">{a.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'h-14 w-14 rounded-full shadow-xl flex items-center justify-center text-white transition-colors',
          isOpen ? 'bg-slate-700 hover:bg-slate-800' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
        )}
        title={isOpen ? 'Chiudi' : 'Crea nuovo'}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? <X size={24} /> : <Plus size={24} />}
        </motion.div>
      </motion.button>
    </div>
  );
};

export default QuickCreate;
