import React, { useState } from 'react';
import { useCRMStore } from '@/stores/crmStore';
import { cn } from '@/lib/utils';
import { 
  X, 
  ChevronDown, 
  LayoutGrid, 
  Check, 
  TrendingUp, 
  Globe, 
  Building, 
  Settings, 
  Calendar, 
  Package, 
  UserCog, 
  Users2, 
  Smartphone,
  Target
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

const iconMap: Record<string, any> = {
  'leads': Target,
  'finanza-agevolata': TrendingUp,
  'servizi-digitali': Globe,
  'consulenze': Building,
  'economie': Settings,
  'organizzazione-eventi': Calendar,
  'prodotti-e-servizi': Package,
  'formazione': UserCog,
  'coworking': Users2,
  'prenotazione-online': Smartphone,
};

export const CRMStructuresSelector: React.FC<{ currentView?: string; onSelect?: () => void }> = ({ currentView, onSelect }) => {
  const { structures, activeStructure, switchStructure } = useCRMStore();
  const [isOpen, setIsOpen] = useState(false);

  const filteredStructures = structures.filter(s => {
    if (currentView === 'leads') {
      return s.slug === 'leads';
    }
    // For 'affari' or others, exclude leads
    return s.slug !== 'leads';
  });

  const handleSelect = (s: any) => {
    switchStructure(s);
    if (onSelect) onSelect();
    setIsOpen(false);
  };

  if (filteredStructures.length <= 1 && currentView === 'leads') {
     // If there is only one lead structure and we are in leads tab, we might not even need a selector
     // but let's keep it for consistency or hide it if it's redundant
     return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button 
            className="flex items-center gap-3 text-[14px] font-bold text-blue-600 hover:text-blue-700 transition-all uppercase tracking-tight outline-none h-10 px-5 rounded-full bg-blue-50 border border-blue-100 hover:border-blue-200 group whitespace-nowrap"
          >
            <LayoutGrid size={16} className="text-blue-500" />
            <span className="truncate max-w-[120px] md:max-w-none">{activeStructure?.name || 'Scegli Pipeline'}</span>
            <ChevronDown size={14} className="text-blue-400 group-hover:translate-y-0.5 transition-transform shrink-0" />
          </button>
        </PopoverTrigger>
        
        <PopoverContent align="start" className="w-[320px] sm:w-[480px] p-0 rounded-2xl overflow-hidden border border-slate-200 shadow-2xl bg-white z-[9999]">
          <div className="bg-white px-5 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 z-20">
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                {currentView === 'leads' ? 'Strutture Lead' : 'Pipeline Nexus'}
              </h4>
              <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest opacity-80">
                Seleziona la struttura di lavoro
              </p>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all border border-slate-100"
            >
              <X size={14} />
            </button>
          </div>

          <div className="overflow-y-auto p-3 bg-slate-50/10 max-h-[400px]">
            <div className="grid grid-cols-1 gap-2">
              {filteredStructures.map((s) => {
                const Sicon = iconMap[s.slug] || LayoutGrid;
                const isActive = activeStructure?.id === s.id;
                
                return (
                  <button
                    key={s.id}
                    onClick={() => handleSelect(s)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left border relative group cursor-pointer",
                      isActive 
                        ? "bg-blue-600 border-blue-700 text-white shadow-lg" 
                        : "bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:shadow-sm"
                    )}
                  >
                    <div 
                      className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center text-white shadow-sm shrink-0",
                        isActive ? "bg-white/20" : ""
                      )}
                      style={!isActive ? { backgroundColor: s.color } : {}}
                    >
                      <Sicon size={18} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-tight block truncate">
                          {s.name}
                        </span>
                        {s.slug === 'leads' && (
                          <span className={cn(
                            "text-[7px] font-black uppercase px-2 py-0.5 rounded-full",
                            isActive ? "bg-white/20 text-white" : "bg-purple-100 text-purple-600"
                          )}>
                            Bitrix Lead Mode
                          </span>
                        )}
                      </div>
                    </div>
                    {isActive && (
                      <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-sm">
                        <Check size={10} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
