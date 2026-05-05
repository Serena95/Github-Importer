import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useCRMStore } from '@/stores/crmStore';
import { useDraggableScroll } from '@/hooks/useDraggableScroll';
import { supabaseCRMService } from '@/services/supabaseCRMService';
import { CRMStructuresSelector } from '@/components/crm/CRMStructuresSelector';
import { KanbanBoard } from '@/components/crm/Kanban/KanbanBoard';
import { DealList } from '@/components/crm/DealList';
import { CRMCalendar } from '@/components/crm/CRMCalendar';
import { TaskKanban } from '@/components/crm/TaskKanban';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Settings, 
  Plus, 
  Search, 
  Filter,
  Users2,
  Building,
  Target,
  CheckSquare,
  Zap,
  Download,
  MoreHorizontal,
  Activity,
  ChevronLeft,
  ChevronRight,
  X,
  LayoutGrid,
  List,
  Calendar as CalendarIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { CreateItemModal } from '@/components/crm/CreateItemModal';
import { AdvancedFilters } from '@/components/crm/AdvancedFilters';
import { DetailDrawer } from '@/components/crm/DetailDrawer';
import { CRMHeaderKPIs } from '@/components/crm/CRMHeaderKPIs';
import { CRMReports } from '@/components/crm/CRMReports';
import { WorkspaceSelector } from '@/components/crm/WorkspaceSelector';
import { ContactList } from '@/components/crm/ContactList';
import { CompanyList } from '@/components/crm/CompanyList';
import { AutomationBuilder } from '@/components/crm/AutomationBuilder';
import { AutomationList } from '@/components/crm/AutomationList';
import { CRMConfig } from '@/components/crm/CRMConfig';
import { useLeadScoreStore } from '@/stores/leadScoreStore';
import { Sparkles, Loader2 as Loader } from 'lucide-react';

const CRM: React.FC<{ activeTab?: string, setActiveTab: (tab: string) => void }> = ({ activeTab: propActiveTab, setActiveTab }) => {
  const navigate = useNavigate();
  const { 
    fetchInitialData, 
    isLoading, 
    structures, 
    activeStructure, 
    stages,
    switchStructure, 
    error, 
    unsubscribeFromChanges,
    filters,
    setFilters,
    crmView,
    setCRMView,
    getFilteredDeals,
    initialLoadDone: storeInitialLoadDone
  } = useCRMStore();

  const [activeViewTab, setActiveViewTab] = useState('affari');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalConfig, setCreateModalConfig] = useState<{ type: any; pipelineId?: string; initialData?: any }>({ type: 'deal' });
  const [selectedDeal, setSelectedDeal] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<any>(null);
  const [isAutomationBuilderOpen, setIsAutomationBuilderOpen] = useState(false);
  const [automationRefreshKey, setAutomationRefreshKey] = useState(0);

  const { scoreLeads, isBatchRunning, batchProgress, batchTotal } = useLeadScoreStore();

  // Sync active view tab with URL (propActiveTab)
  useEffect(() => {
    if (propActiveTab) {
      const tabMap: Record<string, string> = {
        'dashboard': 'dashboard',
        'leads': 'leads',
        'affari': 'affari',
        'deals': 'affari',
        'contacts': 'contatti',
        'contatti': 'contatti',
        'companies': 'aziende',
        'aziende': 'aziende',
        'tasks': 'tasks',
        'calendario': 'calendario',
        'calendar': 'calendario',
        'automazioni': 'automazioni',
        'automations': 'automazioni',
        'analytics': 'analytics',
        'configurazione': 'configurazione',
        'settings': 'configurazione'
      };
      const targetTab = tabMap[propActiveTab] || 'affari';
      if (activeViewTab !== targetTab) {
        setActiveViewTab(targetTab);
      }
    }
  }, [propActiveTab]);

  // Sync active view tab and active structure
  useEffect(() => {
    if (!storeInitialLoadDone || !structures.length || !activeStructure) return;

    const isPipelineTab = ['leads', 'affari'].includes(activeViewTab);
    const currentIsLead = activeStructure.slug === 'leads';

    // Sincronizzazione Tab -> Struttura (Solo se siamo in un tab di pipeline)
    if (isPipelineTab) {
      if (activeViewTab === 'leads' && !currentIsLead) {
        const leadsStruct = structures.find(s => s.slug === 'leads');
        if (leadsStruct && activeStructure.id !== leadsStruct.id) {
          switchStructure(leadsStruct);
        }
      } else if (activeViewTab === 'affari' && currentIsLead) {
        const firstNonLeadStruct = structures.find(s => s.slug !== 'leads');
        if (firstNonLeadStruct && activeStructure.id !== firstNonLeadStruct.id) {
          switchStructure(firstNonLeadStruct);
        }
      }
    }
  }, [activeViewTab, activeStructure?.id, storeInitialLoadDone, structures, switchStructure]);

  useEffect(() => {
    const handleOpenDeal = (event: any) => {
      const { dealId } = event.detail;
      const deals = useCRMStore.getState().getFilteredDeals();
      const deal = deals.find((d: any) => d.id === dealId);
      if (deal) {
        setSelectedDeal(deal);
        setIsDrawerOpen(true);
      }
    };

    const handleOpenCreateDeal = (event: any) => {
      const { contactId, contactName, companyId, companyName } = event.detail;
      setCreateModalConfig({
        type: 'deal',
        pipelineId: activeStructure?.id,
        initialData: {
          contact_id: contactId,
          contact: contactName,
          company_id: companyId,
          company: companyName
        }
      });
      setIsCreateModalOpen(true);
    };

    window.addEventListener('crm:openDeal', handleOpenDeal);
    window.addEventListener('crm:openCreateDeal', handleOpenCreateDeal);
    return () => {
      window.removeEventListener('crm:openDeal', handleOpenDeal);
      window.removeEventListener('crm:openCreateDeal', handleOpenCreateDeal);
    };
  }, [activeStructure?.id]);

  useEffect(() => {
    fetchInitialData(propActiveTab);
    return () => unsubscribeFromChanges();
  }, [propActiveTab]);

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white m-8 rounded-3xl shadow-sm border border-rose-100">
        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-6">
          <Settings size={40} className="animate-spin-slow" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Errore di Sincronizzazione</h2>
        <p className="text-slate-500 max-w-md mt-2 font-medium">
          Non siamo riusciti a connetterci al database o inizializzare le strutture CRM. 
          Assicurati di aver configurato correttamente Supabase e di aver eseguito lo schema SQL.
        </p>
        <div className="bg-rose-50 p-4 rounded-xl mt-6 font-mono text-[10px] text-rose-600 max-w-lg overflow-auto border border-rose-100">
          Error Log: {error}
        </div>
        <Button 
          onClick={() => fetchInitialData(undefined, true)}
          className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full px-8 py-6 h-auto"
        >
          RIPROVA INIZIALIZZAZIONE
        </Button>
      </div>
    );
  }

  useLayoutEffect(() => {
    if (propActiveTab) {
      const tabMap: Record<string, string> = {
        'dashboard': 'dashboard',
        'leads': 'leads',
        'affari': 'affari',
        'deals': 'affari',
        'contacts': 'contatti',
        'contatti': 'contatti',
        'companies': 'aziende',
        'aziende': 'aziende',
        'tasks': 'tasks',
        'calendario': 'calendario',
        'calendar': 'calendario',
        'automazioni': 'automazioni',
        'automations': 'automazioni',
        'analytics': 'analytics',
        'configurazione': 'configurazione',
        'settings': 'configurazione'
      };
      const targetTab = tabMap[propActiveTab] || 'affari';
      if (activeViewTab !== targetTab) {
        setActiveViewTab(targetTab);
      }
    }
  }, [propActiveTab]);

  const interactionScrollRef = useDraggableScroll();
  
  const scrollInteraction = (direction: 'left' | 'right') => {
    if (interactionScrollRef.current) {
      const scrollAmount = 200;
      interactionScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const renderContent = () => {
    switch (activeViewTab) {
      case 'leads':
        return (
          <AnimatePresence mode="wait">
            {crmView === 'kanban' && <motion.div key="kanban" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full"><KanbanBoard /></motion.div>}
            {crmView === 'list' && <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col"><DealList /></motion.div>}
          </AnimatePresence>
        );
      case 'affari':
        return (
          <AnimatePresence mode="wait">
            {crmView === 'kanban' && <motion.div key="kanban" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full"><KanbanBoard /></motion.div>}
            {crmView === 'list' && <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col"><DealList /></motion.div>}
            {crmView === 'calendar' && <motion.div key="calendar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col p-4 md:p-6"><CRMCalendar deals={useCRMStore.getState().getFilteredDeals()} /></motion.div>}
          </AnimatePresence>
        );
      case 'contatti':
        return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col"><ContactList /></motion.div>;
      case 'aziende':
        return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col"><CompanyList /></motion.div>;
      case 'tasks':
        return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col p-4 md:p-6"><TaskKanban deals={useCRMStore.getState().getFilteredDeals()} /></motion.div>;
      case 'calendario':
        return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col p-4 md:p-6"><CRMCalendar deals={useCRMStore.getState().getFilteredDeals()} /></motion.div>;
      case 'automazioni':
        return (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="h-full flex flex-col overflow-auto bg-[#f8fafc]"
          >
            <AutomationList 
              key={automationRefreshKey + (activeStructure?.id || '')}
              pipeline={activeStructure!} 
              stages={stages} 
              onEdit={(auto) => {
                setEditingAutomation(auto);
                setIsAutomationBuilderOpen(true);
              }}
              onCreate={() => {
                setEditingAutomation(null);
                setIsAutomationBuilderOpen(true);
              }}
            />
            {isAutomationBuilderOpen && (
              <AutomationBuilder 
                pipeline={activeStructure!} 
                stages={stages}
                automation={editingAutomation}
                onClose={() => setIsAutomationBuilderOpen(false)} 
                onSave={() => {
                  setIsAutomationBuilderOpen(false);
                  setAutomationRefreshKey(prev => prev + 1);
                }} 
              />
            )}
          </motion.div>
        );
      case 'analytics':
        return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col"><CRMReports pipeline={activeStructure} /></motion.div>;
      case 'configurazione':
        return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col"><CRMConfig /></motion.div>;
      default:
        return (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-20">
            <Plus size={40} className="rotate-45 text-slate-300 mb-6" />
            <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Sezione in fase di sviluppo</h2>
            <Button onClick={() => setActiveViewTab('affari')} className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full px-8">VAI AGLI AFFARI</Button>
          </div>
        );
    }
  };

  return (
    <>
      <div className="h-full flex flex-col bg-[#f5f7fb] overflow-hidden relative">
        {/* Interaction Bar (Bitrix Style) */}
        <div className="px-4 md:px-6 py-2.5 md:py-3 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 relative z-[5] group/interaction">
          <div className="flex-1 mr-2 relative flex items-center overflow-hidden">
            <button 
              onClick={() => scrollInteraction('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 border border-slate-200 rounded-full shadow-sm flex items-center justify-center text-slate-600 opacity-0 group-hover/interaction:opacity-100 transition-opacity hover:bg-slate-50 md:hidden lg:flex"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => scrollInteraction('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 border border-slate-200 rounded-full shadow-sm flex items-center justify-center text-slate-600 opacity-0 group-hover/interaction:opacity-100 transition-opacity hover:bg-slate-50 md:hidden lg:flex"
            >
              <ChevronRight size={16} />
            </button>

            <div 
              ref={interactionScrollRef}
              className="flex items-center gap-3 md:gap-4 overflow-x-auto no-scrollbar flex-1 px-0.5 select-none scroll-smooth"
            >
              <div className="flex items-center gap-2 mr-2 shrink-0">
                <WorkspaceSelector />
                {['affari', 'leads', 'analytics', 'automazioni'].includes(activeViewTab) && (
                  <>
                    <div className="h-4 w-[1px] bg-slate-200 mx-1" />
                    <CRMStructuresSelector currentView={activeViewTab} />
                  </>
                )}
              </div>

              <div className="h-4 w-[1px] bg-slate-200 shrink-0" />

              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => fetchInitialData(activeStructure?.slug, true)}
                className="h-8 md:h-9 text-[9px] md:text-[10px] font-black text-blue-600 uppercase tracking-widest bg-slate-50 shadow-sm border border-slate-100 px-3 md:px-4 rounded-md hover:bg-blue-50 transition-colors shrink-0"
              >
                <Activity size={14} className="mr-1.5 md:mr-2" /> AGGIORNA
              </Button>

              <AdvancedFilters />

              <div className="relative group w-40 md:w-64 shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <Input 
                  placeholder="Cerca..." 
                  value={filters.search}
                  onChange={(e) => setFilters({ search: e.target.value })}
                  className="pl-9 bg-white border-slate-200 h-8 md:h-9 rounded-md text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {['leads', 'affari'].includes(activeViewTab) && (
              <div className="hidden lg:flex bg-slate-200/50 p-1 rounded-lg">
                <button onClick={() => setCRMView('kanban')} className={cn("px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all", crmView === 'kanban' ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700")}>Kanban</button>
                <button onClick={() => setCRMView('list')} className={cn("px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all", crmView === 'list' ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700")}>Elenco</button>
                {activeViewTab === 'affari' && (
                  <button onClick={() => setCRMView('calendar')} className={cn("px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all", crmView === 'calendar' ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700")}>Calendario</button>
                )}
              </div>
            )}
            {activeViewTab === 'leads' && (
              <button
                onClick={() => {
                  const leads = getFilteredDeals();
                  if (leads.length) scoreLeads(leads);
                }}
                disabled={isBatchRunning}
                className="hidden sm:flex items-center gap-1.5 px-3 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white text-[10px] font-black uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-60 shadow-md shadow-purple-200 shrink-0"
                title="Fai valutare tutti i lead dal CoPilot AI"
              >
                {isBatchRunning ? (
                  <>
                    <Loader size={12} className="animate-spin" />
                    {batchProgress}/{batchTotal}
                  </>
                ) : (
                  <>
                    <Sparkles size={12} />
                    Score AI
                  </>
                )}
              </button>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 bg-white border border-slate-200 shadow-sm"><Download size={15} /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 bg-white border border-slate-200 shadow-sm"><MoreHorizontal size={15} /></Button>
          </div>
        </div>

        {/* KPI Header */}
        {(activeViewTab === 'affari' || activeViewTab === 'leads') && <CRMHeaderKPIs />}

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col relative">
          <AnimatePresence mode="wait">
            {isLoading && structures.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[60] bg-white/40 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                <div className="bg-white/80 p-6 rounded-2xl shadow-2xl border border-slate-100 flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sincronizzazione...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="h-full w-full">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Modals & Overlays */}
      <CreateItemModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        type={createModalConfig.type}
        pipelineId={createModalConfig.pipelineId}
        initialData={createModalConfig.initialData}
      />
      <DetailDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        item={selectedDeal}
        type={activeViewTab === 'leads' ? 'lead' : 'deal'}
      />
    </>
  );
};

export default CRM;
