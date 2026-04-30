import React, { useEffect, useState } from 'react';
import { supabaseCRMService } from '@/services/supabaseCRMService';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { 
  Phone, 
  CheckSquare, 
  StickyNote, 
  Zap, 
  Clock, 
  ChevronRight,
  MoreVertical,
  MoreHorizontal,
  MessageCircle,
  Mail,
  FileText,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface CRMActivity {
  id: string;
  type: 'task' | 'call' | 'note' | 'system' | 'comment' | 'email';
  title: string;
  description: string;
  status: string;
  created_at: string;
}

export const CRMActivities: React.FC<{ dealId: string }> = ({ dealId }) => {
  const [activities, setActivities] = useState<CRMActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    const q = query(
      collection(db, 'crm_activities'), 
      where('deal_id', '==', dealId), 
      orderBy('created_at', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setActivities(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [dealId]);

  const getIcon = (type: string, title?: string) => {
    const iconSize = 12;
    const lowerTitle = title?.toLowerCase() || '';

    if (type === 'system') {
      if (lowerTitle.includes('stage') || lowerTitle.includes('fase')) return <ChevronRight size={iconSize} className="text-emerald-600" />;
      if (lowerTitle.includes('alert') || lowerTitle.includes('attenzione')) return <AlertCircle size={iconSize} className="text-rose-500" />;
      return <Zap size={iconSize} className="text-emerald-500" />;
    }

    switch (type) {
      case 'call': return <Phone size={iconSize} className="text-blue-500" />;
      case 'task': return <CheckSquare size={iconSize} className="text-purple-500" />;
      case 'note': return <StickyNote size={iconSize} className="text-amber-500" />;
      case 'comment': return <MessageCircle size={iconSize} className="text-blue-600" />;
      case 'email': return <Mail size={iconSize} className="text-orange-500" />;
      default: return <Clock size={iconSize} className="text-slate-400" />;
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-12 gap-3 opacity-40">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Sincronizzazione Feed...</span>
    </div>
  );

  return (
    <div className="space-y-4 md:space-y-6 pb-24 md:pb-8">
      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center opacity-30">
            <Clock className="mb-4 text-slate-300 w-8 h-8 md:w-10 md:h-10" strokeWidth={1.5} />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nessuna attività registrata</p>
        </div>
      ) : (
        activities.map((activity, idx) => (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            key={activity.id} 
            className="flex gap-3 md:gap-4 relative group"
          >
            {/* Timeline Line */}
            {idx !== activities.length - 1 && (
              <div className="absolute left-[14px] md:left-[16px] top-8 bottom-[-24px] md:bottom-[-32px] w-[2px] bg-slate-100 z-0" />
            )}

            <div className={cn(
                "w-7 h-7 md:w-8 md:h-8 rounded-full md:rounded-xl flex items-center justify-center border-2 border-white shadow-sm shrink-0 z-10",
                activity.type === 'task' ? "bg-purple-100/50" :
                activity.type === 'email' ? "bg-orange-100/50" :
                activity.type === 'comment' ? "bg-blue-100/50" :
                activity.type === 'call' ? "bg-blue-100/30" :
                activity.type === 'system' ? "bg-emerald-100/50" : "bg-slate-100/50"
            )}>
              {getIcon(activity.type, activity.title)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-2xl border border-slate-100 p-3 md:p-4 shadow-sm hover:border-blue-200 transition-all hover:shadow-md">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                    <h4 className="text-[10px] md:text-[11px] font-black text-slate-800 uppercase tracking-tight truncate">
                      {activity.title}
                    </h4>
                    {activity.type === 'system' && (
                      <span className="bg-emerald-50 text-emerald-600 text-[7px] md:text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase border border-emerald-100">
                        Automazione
                      </span>
                    )}
                    <span className="hidden md:block w-1 h-1 bg-slate-300 rounded-full" />
                    <span className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase">
                      {activity.type === 'system' ? 'Nexus Bot' : 'Admin Nexus'}
                    </span>
                  </div>
                  <div className="text-[8px] md:text-[9px] font-black text-blue-500 uppercase shrink-0">
                    {new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <p className="text-[10px] md:text-[11px] text-slate-600 font-medium leading-relaxed">
                  {activity.description}
                </p>
                
                {activity.type === 'task' && (
                  <div className="mt-3 flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100 w-fit">
                    <CheckSquare className="text-slate-400 w-[10px] h-[10px]" />
                    <span className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest">
                       {activity.status === 'completed' ? 'Completato' : 'In attesa'}
                    </span>
                  </div>
                )}

                {/* Actions Bar - Simplified on Mobile */}
                <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3">
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1.5 text-[8px] md:text-[9px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors bg-blue-50/50 px-2 py-1 rounded-lg md:bg-transparent md:p-0">
                      <MessageCircle size={10} className="md:hidden" />
                      <span className="hidden md:inline">Rispondi</span>
                      <span className="md:hidden">Reply</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors px-2 py-1 rounded-lg md:p-0">
                      <MoreHorizontal size={10} className="md:hidden" />
                      <span className="hidden md:inline">Dettagli</span>
                      <span className="md:hidden">More</span>
                    </button>
                  </div>
                  
                  <div className="flex items-center -space-x-1">
                    <div className="w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[7px] md:text-[8px] font-black text-slate-400">
                      SC
                    </div>
                  </div>
                </div>
              </div>

              {/* Nested Comments Simulation - Stacked simply on mobile */}
              {activity.type === 'comment' && (
                <div className="mt-2 ml-4 md:ml-8 space-y-2 border-l-2 border-slate-50 pl-3 md:pl-4">
                  <div className="bg-slate-50/50 rounded-xl p-2.5 border border-slate-100/50 flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] font-black text-slate-400 uppercase">Mara Rossi</span>
                      <span className="text-[7px] font-bold text-slate-300">12:35</span>
                    </div>
                    <p className="text-[9px] text-slate-500 font-medium">Concordo, procediamo con l'invio della documentazione.</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
};
