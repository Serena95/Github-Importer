import React from 'react';
import { useFeedStore } from '@/stores/feedStore';
import { motion } from 'framer-motion';
import { 
  Layers, 
  Megaphone, 
  CheckSquare, 
  Briefcase,
  GitBranch,
  Bell,
  Search,
  Filter,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

const FeedHeader: React.FC = () => {
  const { activeFilter, setActiveFilter, isPinnedOnly, setIsPinnedOnly } = useFeedStore();

  const tabs = [
    { id: 'all', label: 'Tutti', icon: Layers },
    { id: 'announcement', label: 'Annunci', icon: Megaphone },
    { id: 'task', label: 'Task', icon: CheckSquare },
    { id: 'crm_activity', label: 'CRM', icon: GitBranch },
    { id: 'work', label: 'Lavoro', icon: Briefcase },
  ];

  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
      <div className="px-4 sm:px-8 pt-6 pb-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue">
              <Layers size={20} />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none">
                Flusso attività
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
                Real-time stream
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative group hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-blue transition-colors" size={14} />
              <input 
                placeholder="Cerca nel feed..." 
                className="pl-10 pr-4 h-9 bg-slate-100 border-none rounded-full text-xs font-medium focus:ring-2 focus:ring-brand-blue/20 focus:bg-white transition-all w-48 lg:w-64"
              />
            </div>
            <button 
              onClick={() => setIsPinnedOnly(!isPinnedOnly)}
              className={cn(
                "h-9 px-4 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-2",
                isPinnedOnly 
                  ? "bg-brand-blue text-white border-brand-blue shadow-lg shadow-blue-100" 
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
              )}
            >
              <Filter size={14} />
              {isPinnedOnly ? "Solo in alto" : "Filtra"}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6 lg:gap-10 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={cn(
                "pb-4 text-[12px] lg:text-[13px] font-black transition-all relative whitespace-nowrap uppercase tracking-widest flex items-center gap-2",
                activeFilter === tab.id 
                  ? "text-brand-blue" 
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              <tab.icon size={16} />
              {tab.label}
              {activeFilter === tab.id && (
                <motion.div 
                  layoutId="activeFeedFilter"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-blue rounded-full" 
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeedHeader;
