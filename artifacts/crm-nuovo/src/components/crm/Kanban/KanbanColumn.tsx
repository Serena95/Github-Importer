import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { CRMStage, CRMDeal } from '@/types/crm';
import { DealCard } from './DealCard';
import { cn } from '@/lib/utils';
import { MoreHorizontal, Plus, Zap } from 'lucide-react';

interface KanbanColumnProps {
  stage: CRMStage;
  deals: CRMDeal[];
  onCardClick?: (deal: CRMDeal) => void;
  onAddDeal?: () => void;
  onOpenAutomation?: (stage: CRMStage) => void;
}

import { useCRMPermissions } from '@/hooks/useCRMPermissions';

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ stage, deals, onCardClick, onAddDeal, onOpenAutomation }) => {
  const { canModifyAutomations, canCreateDeals } = useCRMPermissions();
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  const totalValue = deals.reduce((acc, deal) => acc + (deal.value || 0), 0);

  return (
    <div className={cn(
      "flex flex-col flex-none select-none h-full",
      "w-[320px] min-w-[320px] bg-transparent"
    )}>
      {/* COLUMN HEADER */}
      <div className="flex flex-col p-3 bg-[#f6f7fb] rounded-lg font-semibold shrink-0 mb-2 border border-slate-200/50">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div 
              className="w-1.5 h-6 rounded-full shrink-0" 
              style={{ backgroundColor: stage.color || '#cbd5e1' }} 
            />
            <h3 className="text-[14px] font-black text-slate-800 tracking-tight leading-none truncate">
              {stage.name}
            </h3>
            <span className="bg-white text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-md border border-slate-100 shrink-0 shadow-sm">
              {deals.length}
            </span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => onOpenAutomation?.(stage)}
              disabled={!canModifyAutomations}
              className={cn(
                "w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center transition-all shadow-sm",
                stage.has_automations ? "text-amber-500 hover:bg-amber-50" : "text-slate-300 hover:text-amber-500 hover:bg-amber-50",
                canModifyAutomations ? "hover:scale-110" : "opacity-0 invisible md:opacity-50 md:visible md:cursor-not-allowed md:grayscale"
              )}
              title="Automazioni Stage"
            >
              <Zap size={12} fill={stage.has_automations ? "currentColor" : "none"} />
            </button>
            
            {!stage.name.toLowerCase().includes('preanalisi') && (
              <button 
                onClick={onAddDeal}
                disabled={!canCreateDeals}
                className={cn(
                  "w-6 h-6 rounded-md bg-white border border-slate-200 text-blue-500 flex items-center justify-center transition-all shadow-sm",
                  canCreateDeals ? "hover:bg-blue-50 hover:scale-110" : "opacity-0 invisible md:opacity-50 md:visible md:cursor-not-allowed md:grayscale"
                )}
              >
                <Plus size={14} />
              </button>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-200/40">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Valore: €{totalValue.toLocaleString()}
          </span>
        </div>
      </div>

      {/* COLUMN BODY - Internal vertical scroll */}
      <div 
        ref={setNodeRef}
        className={cn(
          "flex flex-col gap-2 transition-colors flex-1 overflow-y-auto no-scrollbar pb-10",
          isOver && "bg-blue-50/50 rounded-xl"
        )}
      >
        {deals.map(deal => (
          <button 
            key={deal.id} 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onCardClick?.(deal);
            }} 
            className="flex flex-col w-full relative shrink-0 text-left border-none bg-transparent p-0 outline-none cursor-pointer appearance-none"
          >
            <DealCard 
              deal={deal} 
              isPreanalysis={stage.name.toLowerCase().includes('preanalisi')} 
            />
          </button>
        ))}
        
        {/* Placeholder for empty column when dragging over */}
        {deals.length === 0 && (
          <div className="h-24 rounded-xl border-2 border-dashed border-slate-100 flex items-center justify-center text-slate-300 italic text-[10px] bg-white/50 shrink-0">
            Vuota
          </div>
        )}
      </div>
    </div>
  );
};
