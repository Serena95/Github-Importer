import React, { useMemo } from 'react';
import { useCRMStore } from '@/stores/crmStore';
import { DollarSign, Target, Trophy, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

export const CRMHeaderKPIs: React.FC = () => {
  const { getFilteredDeals, stages } = useCRMStore();
  const deals = getFilteredDeals();

  const kpis = useMemo(() => {
    // Determine won/lost stages
    const wonStageIds = stages.filter(s => s.is_won).map(s => s.id);
    const lostStageIds = stages.filter(s => s.is_lost).map(s => s.id);

    const totalValue = deals.reduce((acc, d) => acc + (d.value || 0), 0);
    const activeDeals = deals.filter(d => !wonStageIds.includes(d.stage_id) && !lostStageIds.includes(d.stage_id));
    
    // Won this month
    const now = new Date();
    const wonThisMonth = deals.filter(d => {
      if (!wonStageIds.includes(d.stage_id)) return false;
      const updatedDate = new Date(d.updated_at || d.created_at);
      return updatedDate.getMonth() === now.getMonth() && updatedDate.getFullYear() === now.getFullYear();
    });

    // Conversion rate
    const wonTotalCount = deals.filter(d => wonStageIds.includes(d.stage_id)).length;
    const totalProcessedCount = deals.filter(d => wonStageIds.includes(d.stage_id) || lostStageIds.includes(d.stage_id)).length;
    const conversionRate = totalProcessedCount > 0 ? (wonTotalCount / totalProcessedCount) * 100 : 0;

    return [
      {
        label: 'Valore Totale',
        value: `€ ${totalValue.toLocaleString()}`,
        icon: DollarSign,
        color: 'text-blue-600',
        bg: 'bg-blue-50'
      },
      {
        label: 'Affari Attivi',
        value: activeDeals.length,
        icon: Target,
        color: 'text-amber-600',
        bg: 'bg-amber-50'
      },
      {
        label: 'Vinti Mese',
        value: wonThisMonth.length,
        icon: Trophy,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50'
      },
      {
        label: 'Conversion Rate',
        value: `${conversionRate.toFixed(1)}%`,
        icon: TrendingUp,
        color: 'text-indigo-600',
        bg: 'bg-indigo-50'
      }
    ];
  }, [deals, stages]);

  return (
    <div className="px-4 md:px-6 py-4 bg-white border-b border-slate-100 flex items-center overflow-x-auto no-scrollbar gap-8 md:gap-12">
      {kpis.map((kpi, idx) => (
        <motion.div 
          key={kpi.label}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="flex items-center gap-3 shrink-0"
        >
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-white", kpi.bg, kpi.color)}>
             <kpi.icon size={18} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{kpi.label}</p>
            <p className="text-sm font-black text-slate-800 tracking-tight leading-none">{kpi.value}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
