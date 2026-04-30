import React, { useState, useEffect, useRef } from 'react';
import { useCRMStore } from '@/stores/crmStore';
import { Input } from '@/components/ui/input';
import { Search, X, Loader2, Target, Building, User, Layout, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export const GlobalSearch: React.FC = () => {
  const { 
    globalSearchQuery, 
    setGlobalSearchQuery, 
    searchGlobal, 
    globalSearchResults, 
    isGlobalSearching 
  } = useCRMStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (globalSearchQuery.length >= 2) {
        searchGlobal(globalSearchQuery);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [globalSearchQuery]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (deal: any) => {
    setGlobalSearchQuery('');
    setIsOpen(false);
    
    // Custom event to handle cross-pipeline navigation
    // Layout.tsx and others listen to this
    window.dispatchEvent(new CustomEvent('crm:openDealGlobal', { 
      detail: { 
        dealId: deal.id,
        structureId: deal.structure_id,
        structureSlug: deal.crm_structures?.slug 
      } 
    }));
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-[280px] lg:max-w-md mx-auto">
      <div className="relative group">
        <Search 
          className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 transition-colors",
            isOpen ? "text-blue-500" : "text-slate-400 group-hover:text-slate-500"
          )} 
          size={16} 
        />
        <Input
          value={globalSearchQuery}
          onChange={(e) => {
            setGlobalSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Cerca globalmente (Azienda, Note, Contatto...)"
          className={cn(
            "pl-10 pr-10 h-10 w-full bg-slate-50 border-transparent transition-all rounded-xl text-sm",
            "focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:bg-white focus-visible:border-blue-200",
            isOpen ? "bg-white border-blue-200 shadow-lg" : "hover:bg-slate-100"
          )}
        />
        <AnimatePresence>
          {globalSearchQuery && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => {
                setGlobalSearchQuery('');
                setIsOpen(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={14} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isOpen && (globalSearchQuery.length >= 2) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={cn(
              "absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 shadow-2xl rounded-2xl overflow-hidden z-[100]",
              "max-h-[80vh] md:max-h-[500px] overflow-y-auto nexus-scrollbar",
              "fixed inset-x-0 bottom-0 md:absolute md:inset-auto md:top-full md:mt-2" // Responsive: fullscreen mobile (handled via CSS classes or fixed positioning)
            )}
          >
            {/* Mobile "Close" header - only visible on small screens when "fixed" is active */}
            <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-50 bg-slate-50/50">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Risultati Ricerca</span>
              <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400">
                <X size={20} />
              </button>
            </div>

            <div className="p-2">
              {isGlobalSearching ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ricerca in corso...</span>
                </div>
              ) : globalSearchResults.length > 0 ? (
                <div className="space-y-1">
                  {globalSearchResults.map((deal) => (
                    <button
                      key={deal.id}
                      onClick={() => handleResultClick(deal)}
                      className="w-full flex items-center gap-4 p-3 hover:bg-blue-50/50 rounded-xl transition-colors group text-left"
                    >
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                        style={{ backgroundColor: `${deal.crm_structures?.color || '#3b82f6'}20` }}
                      >
                        <Building 
                          size={18} 
                          style={{ color: deal.crm_structures?.color || '#3b82f6' }} 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-slate-800 truncate block">
                            {deal.title}
                          </span>
                          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-full shrink-0">
                            €{deal.value?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                            <Layout size={10} className="text-slate-400" />
                            {deal.crm_structures?.name}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[10px] font-bold text-slate-400 italic truncate">
                            {deal.crm_stages?.name}
                          </span>
                        </div>
                      </div>
                      <ArrowRight 
                        size={14} 
                        className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" 
                      />
                    </button>
                  ))}
                  
                  <div className="p-3 mt-1 bg-slate-50/50 rounded-xl">
                    <p className="text-[9px] text-center text-slate-400 font-medium leading-relaxed">
                      La ricerca scansiona Azienda, Contatti, Email, Telefoni e Pipeline.<br/>
                      I risultati sono limitati ai 10 item più pertinenti.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-center px-6">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-2">
                    <Search size={24} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-700">Nessun risultato trovato</h4>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Prova a cercare con un termine diverso (nome azienda, P.IVA o contatto).
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
