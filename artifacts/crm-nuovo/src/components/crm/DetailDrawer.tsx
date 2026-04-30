import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Phone, 
  MessageSquare, 
  CheckSquare,
  PenTool,
  Calculator,
  User, 
  Building, 
  TrendingUp, 
  Info,
  StickyNote,
  Zap,
  Calendar,
  FileText,
  Upload,
  Link as LinkIcon,
  CheckCircle2,
  Clock,
  MoreVertical,
  Paperclip,
  Save,
  ChevronLeft,
  MoreHorizontal,
  UserPlus,
  Users2,
  Trash2,
  ShieldCheck,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Sheet, 
  SheetContent 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CRMDeal, CRMUser } from '@/types/crm';
import { CRMActivities } from './CRMActivities';
import { WhatsAppChat } from './WhatsAppChat';
import { DealCalendarEvents } from './DealCalendarEvents';
import { CreateEventModal } from './CreateEventModal';
import { DealTasks } from './DealTasks';
import { DealFiles } from './DealFiles';
import { DealSignatures } from './DealSignatures';
import { DealQuotes } from './DealQuotes';
import { useCRMStore } from '@/stores/crmStore';
import { CRM_USERS, CRM_TEAMS } from '@/constants/crm';
import { supabaseCRMService } from '@/services/supabaseCRMService';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import CoPilotPanel from './CoPilotPanel';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

interface DetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  type: 'lead' | 'deal' | 'contact' | 'company';
}

import { useCRMPermissions } from '@/hooks/useCRMPermissions';

export const DetailDrawer: React.FC<DetailDrawerProps> = ({ isOpen, onClose, item: initialItem, type }) => {
  const [item, setItem] = useState(initialItem);
  const [activeTab, setActiveTabValue] = useState('details');
  const [preanalysisStep, setPreanalysisStep] = useState(0);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const { structures, stages, activeStructure, fetchInitialData, customFields } = useCRMStore();
  const { 
    canModifyDeal, 
    canMoveStage, 
    canDeleteDeals, 
    canAssignUsers, 
    canAddNote, 
    canUploadFile,
    canCreateTask
  } = useCRMPermissions();

  useEffect(() => {
    setItem(initialItem);
    // Reset step and tab when item changes to prevent UI inconsistencies
    setPreanalysisStep(0);
    setActiveTabValue('details');
  }, [initialItem]);

  if (!item) return null;

  const currentStage = stages.find(s => s.id === item.stage_id);
  const currentPipeline = structures.find(s => s.id === item.structure_id);
  const isPreanalysis = !!(item.stage_id && (item.preanalysis_result || currentStage?.name?.toLowerCase()?.includes('preanalisi')));

  // Define available tabs for navigation
  const availableTabs = [
    'details',
    'tasks',
    'whatsapp',
    'calendar',
    ...(isPreanalysis ? ['preanalysis'] : []),
    'activities',
    'notes',
    'files'
  ];

  const currentTabIndex = availableTabs.indexOf(activeTab);

  const nextTab = () => {
    if (currentTabIndex < availableTabs.length - 1) {
      setActiveTabValue(availableTabs[currentTabIndex + 1]);
    }
  };

  const prevTab = () => {
    if (currentTabIndex > 0) {
      setActiveTabValue(availableTabs[currentTabIndex - 1]);
    }
  };

  const nextStep = () => {
    // If in preanalysis and not at last step, go to next step
    if (activeTab === 'preanalysis' && preanalysisStep < 3) {
      setPreanalysisStep(prev => prev + 1);
    } else {
      nextTab();
    }
  };

  const prevStep = () => {
    // If in preanalysis and not at first step, go to prev step
    if (activeTab === 'preanalysis' && preanalysisStep > 0) {
      setPreanalysisStep(prev => prev - 1);
    } else {
      prevTab();
    }
  };

  const handleUpdate = async (updates: Partial<CRMDeal>) => {
    try {
      await supabaseCRMService.updateDeal(item.id, updates);
      toast.success("Affare aggiornato");
      fetchInitialData(activeStructure?.slug);
    } catch (e) {
      toast.error("Errore aggiornamento");
    }
  };

  const currentResponsible = CRM_USERS.find(u => u.id === item.assigned_to || u.name === item.assigned_to) || CRM_USERS[0];
  const currentAssistants = (item.assistants || []).map(id => CRM_USERS.find(u => u.id === id)).filter(Boolean) as CRMUser[];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        className={cn(
          "p-0 border-none shadow-2xl flex flex-col h-full bg-white transition-all duration-300",
          "w-full sm:w-[85%] xl:w-[550px]", // Solid background and slightly wider
          "xl:shadow-2xl xl:border-l xl:border-slate-200" 
        )}
        // Force hide overlay and blur on desktop if possible via tailwind in the parent or overlay component
      >
        {/* RESPONSIVE HEADER */}
        <div className="bg-white border-b border-slate-100 p-4 md:p-6 shadow-sm z-10 shrink-0">
          <div className="flex justify-between items-center mb-5">
            {/* Mobile Back Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose} 
              className="md:hidden rounded-full h-8 w-8 text-slate-500"
            >
              <ChevronLeft size={20} />
            </Button>

            <div className="flex items-center gap-3 flex-1 px-2 md:px-0">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100 shrink-0">
                {type === 'deal' ? <TrendingUp className="w-[22px] h-[22px] md:w-6 md:h-6" /> : <User className="w-[22px] h-[22px] md:w-6 md:h-6" />}
              </div>
              <div className="min-w-0">
                <h2 className="text-sm md:text-lg font-black text-slate-800 truncate leading-tight uppercase tracking-tight">
                  {item.company || item.title || 'Senza Nome'}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className={cn(
                    "border-none text-[7px] md:text-[8px] font-black px-1.5 py-0",
                    type === 'lead' ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"
                  )}>
                    {type.toUpperCase()}
                  </Badge>
                  {type === 'lead' && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-4 p-0 text-[8px] font-black uppercase text-emerald-600 flex items-center gap-1 hover:bg-transparent">
                          <TrendingUp size={10} /> Converti in Affare
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-3 rounded-2xl shadow-2xl border-slate-100 z-[100]">
                         <div className="space-y-3">
                           <div className="space-y-1">
                             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Conversione Lead</h4>
                             <p className="text-[11px] font-medium text-slate-600 leading-tight">Seleziona in quale pipeline spostare l'affare qualificato.</p>
                           </div>
                           <div className="space-y-1 max-h-48 overflow-y-auto no-scrollbar">
                             {structures.filter(s => s.slug !== 'leads').map(s => (
                               <button 
                                 key={s.id} 
                                 onClick={async () => {
                                   try {
                                     await supabaseCRMService.convertLeadToDeal(item.id, s.id);
                                     toast.success(`Lead convertito in ${s.name}`);
                                     onClose();
                                     fetchInitialData(s.slug, true);
                                   } catch (e) {
                                     toast.error("Errore durante la conversione");
                                   }
                                 }}
                                 className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-3 group"
                               >
                                 <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform" style={{ backgroundColor: s.color }}>
                                    <TrendingUp size={14} />
                                 </div>
                                 <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">{s.name}</span>
                               </button>
                             ))}
                           </div>
                         </div>
                      </PopoverContent>
                    </Popover>
                  )}
                  <span className="text-[9px] md:text-[10px] text-slate-400 font-bold">ID: {item.id.slice(0, 8)}</span>
                  <div className="h-2 w-px bg-slate-200 mx-1" />
                  <button 
                    onClick={async () => {
                      const token = await supabaseCRMService.createPortalLink(item.id);
                      const link = `${window.location.origin}${window.location.pathname}?portal=${token}`;
                      navigator.clipboard.writeText(link);
                      toast.success('Link Portale Cliente copiato!');
                    }}
                    className="text-[9px] font-black uppercase text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                  >
                    <ExternalLink size={10} /> Portale
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 md:gap-2 shrink-0">
              {/* CoPilot AI - Bitrix-style */}
              <CoPilotPanel
                recordType={type}
                record={item}
                context={{
                  pipeline: currentPipeline?.name,
                  stage: currentStage?.name,
                  responsible: currentResponsible.name,
                }}
                variant="icon"
              />
              {/* Mobile Options Menu */}
              <Button variant="ghost" size="icon" className="md:hidden h-8 w-8 text-slate-400">
                <MoreHorizontal size={18} />
              </Button>
              {/* Tablet/Desktop Close Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose} 
                className="hidden md:flex rounded-full h-8 w-8 text-slate-400 hover:bg-slate-50"
              >
                <X size={18} />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-slate-50/50 rounded-2xl p-3 border border-slate-100">
            <div className="min-w-0">
              <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Pipeline</p>
              <p className="text-[10px] md:text-[11px] font-bold text-slate-700 truncate">{currentPipeline?.name || 'Nexus Default'}</p>
            </div>
            <div className="min-w-0">
              <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Stage</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-blue-500" />
                <p className="text-[10px] md:text-[11px] font-bold text-blue-600 truncate">{currentStage?.name || 'N/A'}</p>
                {canMoveStage(item) && (
                  <button 
                    onClick={() => setActiveTabValue('details')} // Or open a stage selector
                    className="text-[8px] font-black uppercase text-slate-300 hover:text-blue-500 transition-colors"
                  >
                    Cambia
                  </button>
                )}
              </div>
            </div>
            <div className="col-span-2 md:col-span-1 min-w-0">
              <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Responsabile</p>
              <div className="flex items-center gap-1.5">
                <Avatar className="h-4 w-4 md:h-5 md:w-5">
                   <AvatarImage src={currentResponsible.avatar} />
                   <AvatarFallback className="text-[5px] md:text-[6px] bg-blue-100 text-blue-600 font-bold">
                     {currentResponsible.name[0]}
                   </AvatarFallback>
                </Avatar>
                <p className="text-[10px] md:text-[11px] font-bold text-slate-600 truncate">{currentResponsible.name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* RESPONSIVE NAVIGATION TABS - Sticky on mobile */}
        <Tabs value={activeTab} className="flex-1 flex flex-col overflow-hidden" onValueChange={setActiveTabValue}>
          <div className="bg-white border-b border-slate-100 px-4 shrink-0 relative flex items-center z-20">
            {/* Tab navigation arrows */}
            <div className="absolute left-0 bottom-0 top-0 w-10 bg-gradient-to-r from-white to-transparent z-30 pointer-events-none md:hidden" />
            <div className="absolute right-0 bottom-0 top-0 w-10 bg-gradient-to-l from-white to-transparent z-30 pointer-events-none md:hidden" />
            
              <TabsList className="bg-transparent h-12 w-full justify-start gap-4 md:gap-6 flex-nowrap overflow-x-auto no-scrollbar snap-x snap-mandatory min-w-max px-2">
                <TabsTrigger value="details" className="snap-start data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full px-0 text-[10px] font-black uppercase tracking-widest text-slate-400">Dettagli</TabsTrigger>
                <TabsTrigger value="tasks" className="snap-start data-[state=active]:bg-transparent data-[state=active]:text-amber-600 data-[state=active]:border-b-2 data-[state=active]:border-amber-600 rounded-none h-full px-0 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckSquare size={12} className={activeTab === 'tasks' ? "text-amber-500" : "text-slate-300"} />
                    Task
                  </div>
                </TabsTrigger>
                <TabsTrigger value="files" className="snap-start data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full px-0 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <div className="flex items-center gap-2">
                    <FileText size={12} className={activeTab === 'files' ? "text-blue-500" : "text-slate-300"} />
                    File
                  </div>
                </TabsTrigger>
                <TabsTrigger value="whatsapp" className="snap-start data-[state=active]:bg-transparent data-[state=active]:text-emerald-600 data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 rounded-none h-full px-0 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={12} className={activeTab === 'whatsapp' ? "text-emerald-500" : "text-slate-300"} />
                    WhatsApp
                  </div>
                </TabsTrigger>
                <TabsTrigger value="calendar" className="snap-start data-[state=active]:bg-transparent data-[state=active]:text-amber-600 data-[state=active]:border-b-2 data-[state=active]:border-amber-600 rounded-none h-full px-0 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <div className="flex items-center gap-2">
                    <Calendar size={12} className={activeTab === 'calendar' ? "text-amber-500" : "text-slate-300"} />
                    Calendario
                  </div>
                </TabsTrigger>
                <TabsTrigger value="signature" className="snap-start data-[state=active]:bg-transparent data-[state=active]:text-slate-900 data-[state=active]:border-b-2 data-[state=active]:border-slate-900 rounded-none h-full px-0 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <div className="flex items-center gap-2">
                    <PenTool size={12} className={activeTab === 'signature' ? "text-slate-900" : "text-slate-300"} />
                    Firma
                  </div>
                </TabsTrigger>
                <TabsTrigger value="quotes" className="snap-start data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full px-0 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <div className="flex items-center gap-2">
                    <Calculator size={12} className={activeTab === 'quotes' ? "text-blue-500" : "text-slate-300"} />
                    Preventivi
                  </div>
                </TabsTrigger>
               {isPreanalysis && (
                <TabsTrigger value="preanalysis" className="snap-start data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full px-0 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <div className="flex items-center gap-2">
                    <Zap size={12} className={activeTab === 'preanalysis' ? "text-blue-500 animate-pulse" : "text-slate-300"} />
                    PREANALISI
                  </div>
                </TabsTrigger>
              )}
              <TabsTrigger value="activities" className="snap-start data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full px-0 text-[10px] font-black uppercase tracking-widest text-slate-400">Attività</TabsTrigger>
              <TabsTrigger value="notes" className="snap-start data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full px-0 text-[10px] font-black uppercase tracking-widest text-slate-400">Note</TabsTrigger>
              <TabsTrigger value="files" className="snap-start data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full px-0 text-[10px] font-black uppercase tracking-widest text-slate-400">File</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden bg-[#f8fafc]">
            {/* TAB DETTAGLI RESPONSIVE */}
            <TabsContent value="details" className="m-0 flex-1 flex flex-col overflow-hidden focus-visible:outline-none">
              <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-6 pb-32">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-4"
                >
                <h3 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
                  <Info size={12} className="text-blue-500" /> Informazioni Affare
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="flex justify-between md:block text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Azienda</span>
                    <span className="font-black text-slate-700">{item.company || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between md:block text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Contatto</span>
                    <span className="font-black text-slate-700">{item.contact || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between md:block text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Telefono</span>
                    <a href={`tel:${item.phone}`} className="font-black text-blue-600 hover:underline">{item.phone || '-'}</a>
                  </div>
                  <div className="flex justify-between md:block text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Email</span>
                    <span className="font-black text-slate-700 truncate max-w-[120px] md:max-w-full block">{item.email || '-'}</span>
                  </div>
                  <div className="flex justify-between md:block text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Valore</span>
                    <span className="font-black text-emerald-600 italic">€ {item.value?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between md:block text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">Responsabile</span>
                    <Select disabled={!canAssignUsers} defaultValue={item.assigned_to} onValueChange={(val) => handleUpdate({ assigned_to: val })}>
                      <SelectTrigger className="h-8 border-slate-100 bg-slate-50/50 text-[11px] font-bold">
                        <SelectValue placeholder="Seleziona..." />
                      </SelectTrigger>
                      <SelectContent>
                        {CRM_USERS.map(u => (
                          <SelectItem key={u.id} value={u.id} className="text-[11px]">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-4 w-4">
                                <AvatarImage src={u.avatar} />
                                <AvatarFallback className="text-[6px]">{u.name[0]}</AvatarFallback>
                              </Avatar>
                              {u.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-between md:block text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">Team</span>
                    <Select defaultValue={item.team} onValueChange={(val) => handleUpdate({ team: val })}>
                      <SelectTrigger className="h-8 border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-widest">
                        <SelectValue placeholder="Team..." />
                      </SelectTrigger>
                      <SelectContent>
                        {CRM_TEAMS.map(t => (
                          <SelectItem key={t} value={t} className="text-[11px] uppercase tracking-widest font-black">{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Assistenti</span>
                      {canAssignUsers && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 text-[9px] font-black uppercase text-blue-600">
                               <UserPlus size={10} className="mr-1" /> Aggiungi
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-64 p-2 rounded-xl shadow-2xl border-slate-100">
                             <div className="space-y-1">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 py-1">Seleziona Assistenti</p>
                               {CRM_USERS.filter(u => u.id !== item.assigned_to).map(u => {
                                 const isSelected = item.assistants?.includes(u.id);
                                 return (
                                   <div key={u.id} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer" onClick={() => {
                                     const newAssistants = isSelected 
                                      ? (item.assistants || []).filter(id => id !== u.id)
                                      : [...(item.assistants || []), u.id];
                                     handleUpdate({ assistants: newAssistants });
                                   }}>
                                     <Checkbox checked={isSelected} className="rounded-sm border-slate-200" />
                                     <Avatar className="h-5 w-5">
                                        <AvatarImage src={u.avatar} />
                                        <AvatarFallback className="text-[8px]">{u.name[0]}</AvatarFallback>
                                     </Avatar>
                                     <div className="flex flex-col">
                                       <span className="text-[11px] font-bold text-slate-700">{u.name}</span>
                                       <span className="text-[8px] font-black uppercase text-slate-400 tracking-tighter">{u.role}</span>
                                     </div>
                                   </div>
                                 );
                               })}
                             </div>
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5">
                       {currentAssistants.length === 0 ? (
                         <div className="text-[10px] text-slate-400 italic">Nessun assistente assegnato</div>
                       ) : (
                         currentAssistants.map(u => (
                           <Badge key={u.id} className="bg-white border border-slate-100 shadow-sm text-[10px] font-bold text-slate-600 gap-1.5 px-2 py-1 pr-1 group">
                             <Avatar className="h-3 w-3">
                               <AvatarImage src={u.avatar} />
                               <AvatarFallback className="text-[5px]">{u.name[0]}</AvatarFallback>
                             </Avatar>
                             {u.name}
                             {canAssignUsers && (
                               <button 
                                onClick={() => handleUpdate({ assistants: (item.assistants || []).filter(id => id !== u.id) })}
                                className="text-slate-300 hover:text-rose-500 transition-colors"
                               >
                                 <X size={10} />
                               </button>
                             )}
                           </Badge>
                         ))
                       )}
                    </div>
                  </div>
                  <div className="flex justify-between md:block text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Pipeline</span>
                    <span className="font-black text-slate-700">{currentPipeline?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between md:block text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Stage</span>
                    <Badge variant="outline" className="font-black text-[9px] md:text-[10px] border-slate-200 bg-slate-50 uppercase">{currentStage?.name || 'N/A'}</Badge>
                  </div>
                </div>
              </motion.div>

              {/* CUSTOM FIELDS DYNAMIC SECTION */}
              {customFields.filter(f => f.entity_type === type).length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="mt-4 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Informazioni Personalizzate</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {customFields.filter(f => f.entity_type === type).map(field => {
                      const currentValue = item.custom_fields?.[field.name] || '';
                      return (
                        <div key={field.id} className="space-y-1.5">
                          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-tight flex items-center justify-between">
                            <span>{field.label} {field.required && <span className="text-rose-500">*</span>}</span>
                          </Label>
                          
                          {field.type === 'textarea' ? (
                            <Textarea 
                              disabled={!canModifyDeal(item)}
                              value={currentValue}
                              placeholder={`Inserisci ${field.label}...`}
                              onChange={(e) => handleUpdate({ custom_fields: { ...item.custom_fields, [field.name]: e.target.value } })}
                              className="text-xs font-bold border-slate-100 bg-slate-50/50 min-h-[80px] rounded-xl focus:bg-white transition-colors"
                            />
                          ) : field.type === 'checkbox' ? (
                            <div className="flex items-center justify-between h-11 px-4 bg-slate-50/50 border border-slate-100 rounded-xl">
                               <span className="text-[11px] font-bold text-slate-600">{field.label}</span>
                               <Checkbox 
                                 disabled={!canModifyDeal(item)}
                                 checked={!!currentValue} 
                                 onCheckedChange={(checked) => handleUpdate({ custom_fields: { ...item.custom_fields, [field.name]: checked } })} 
                               />
                            </div>
                          ) : (
                            <Input 
                              disabled={!canModifyDeal(item)}
                              type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                              value={currentValue}
                              placeholder={`Inserisci ${field.label}...`}
                              onChange={(e) => handleUpdate({ custom_fields: { ...item.custom_fields, [field.name]: e.target.value } })}
                              className="h-11 text-xs font-bold border-slate-100 bg-slate-50/50 rounded-xl focus:bg-white transition-colors"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>
          </TabsContent>

            {/* TAB WHATSAPP */}
            <TabsContent value="whatsapp" className="m-0 flex-1 flex flex-col overflow-hidden focus-visible:outline-none">
              <div className="flex-1 p-0 flex flex-col overflow-hidden">
                <WhatsAppChat deal={item} />
              </div>
            </TabsContent>

            {/* TAB CALENDARIO */}
            <TabsContent value="calendar" className="m-0 flex-1 overflow-y-auto p-8 focus-visible:outline-none custom-scrollbar bg-white">
               <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between p-6 bg-amber-50/50 rounded-[32px] border border-amber-100/50">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Scadenzario Affare</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Timeline appuntamenti e follow-up</p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => setIsEventModalOpen(true)}
                      className="bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-[10px] uppercase font-black tracking-widest h-10 px-6 shadow-lg shadow-amber-200 transition-all hover:scale-105 active:scale-95"
                    >
                      <Calendar size={16} className="mr-2" /> Pianifica
                    </Button>
                  </div>

                  <DealCalendarEvents dealId={item.id} />
               </div>
            </TabsContent>

            <TabsContent value="signature" className="m-0 flex-1 overflow-y-auto p-8 focus-visible:outline-none custom-scrollbar bg-white">
               <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <DealSignatures deal={item} />
               </div>
            </TabsContent>

            <TabsContent value="quotes" className="m-0 flex-1 overflow-y-auto p-8 focus-visible:outline-none custom-scrollbar bg-white">
               <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <DealQuotes deal={item} />
               </div>
            </TabsContent>

            <TabsContent value="tasks" className="m-0 flex-1 overflow-y-auto p-8 focus-visible:outline-none custom-scrollbar bg-white">
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <DealTasks dealId={item.id} />
               </div>
            </TabsContent>

            <TabsContent value="files" className="m-0 flex-1 overflow-y-auto p-8 focus-visible:outline-none custom-scrollbar bg-white">
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <DealFiles dealId={item.id} />
               </div>
            </TabsContent>

            {/* TAB PREANALISI RESPONSIVE - STEPPED VERSION */}
            <TabsContent value="preanalysis" className="m-0 flex flex-col h-full focus-visible:outline-none overflow-hidden">
              {isPreanalysis && (
                <div className="flex flex-col h-full relative group">
                  {!item.preanalysis_result ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-white">
                      <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-6 relative">
                         <div className="absolute inset-0 bg-blue-200 rounded-full animate-ping opacity-20" />
                         <Zap size={40} className="relative z-10" />
                      </div>
                      <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Qualificazione in corso</h3>
                      <p className="text-slate-500 text-sm mt-2 max-w-xs font-medium leading-relaxed">
                        I sistemi Nexus stanno analizzando le risposte del form per calcolare lo score ed estrarre i dati societari.
                      </p>
                      <div className="mt-8 w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-blue-600"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Stepper Header / Progress bar */}
                      <div className="px-6 py-5 bg-white border-b border-slate-100 shrink-0 shadow-sm z-30 relative">
                        <div className="flex flex-col gap-3">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                                {preanalysisStep === 0 && "Esito Qualifica"}
                                {preanalysisStep === 1 && "Dati Societari"}
                                {preanalysisStep === 2 && "Risposte Form Completo"}
                                {preanalysisStep === 3 && "Insights & Suggerimenti AI"}
                              </h2>
                            </div>
                            <div className="flex items-center gap-2 ml-auto">
                              <Button 
                                variant="secondary" 
                                size="icon" 
                                onClick={prevStep}
                                disabled={preanalysisStep === 0}
                                className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 hover:text-blue-600 border border-slate-100 transition-all disabled:opacity-20"
                              >
                                <ChevronLeft size={20} />
                              </Button>
                              <Button 
                                variant="secondary" 
                                size="icon" 
                                onClick={nextStep}
                                disabled={preanalysisStep === 3}
                                className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 transition-all disabled:opacity-20"
                              >
                                <ChevronRight size={20} />
                              </Button>
                            </div>
                          </div>
                          <div className="flex gap-1 h-1.5 px-0.5">
                            {[0, 1, 2, 3].map((s) => (
                              <div 
                                key={s} 
                                className={cn(
                                  "flex-1 rounded-full transition-all duration-300",
                                  s === preanalysisStep ? "bg-blue-600" : 
                                  s < preanalysisStep ? "bg-blue-100" : "bg-slate-100"
                                )} 
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* FLOATING NAVIGATION ARROWS - Ultra-High Visibility */}
                      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex items-center justify-between pointer-events-none z-[100] px-3 md:px-5">
                        <Button 
                          variant="secondary" 
                          size="icon" 
                          onClick={(e) => { e.stopPropagation(); prevStep(); }}
                          disabled={preanalysisStep === 0}
                          className={cn(
                            "pointer-events-auto h-14 w-14 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.2)] bg-white border-2 border-slate-100 text-slate-800 hover:bg-slate-50 hover:text-blue-600 hover:scale-110 transition-all active:scale-95 disabled:opacity-0 disabled:invisible",
                            preanalysisStep === 0 ? "opacity-0 invisible" : "opacity-100 visible"
                          )}
                        >
                          <ChevronLeft size={32} />
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="icon" 
                          onClick={(e) => { e.stopPropagation(); nextStep(); }}
                          disabled={preanalysisStep === 3}
                          className={cn(
                            "pointer-events-auto h-14 w-14 rounded-full shadow-[0_10px_40px_rgba(37,99,235,0.3)] bg-blue-600 text-white hover:bg-blue-700 hover:scale-110 transition-all active:scale-95 disabled:opacity-0 disabled:invisible",
                            preanalysisStep === 3 ? "opacity-0 invisible" : "opacity-100 visible"
                          )}
                        >
                          <ChevronRight size={32} />
                        </Button>
                      </div>

                      {/* Step Content Container - SCROLLABLE */}
                      <div id="preanalysis-content-container" className="flex-1 overflow-y-auto p-4 md:p-6 pb-40 relative space-y-6 min-h-0 bg-white no-scrollbar">
                        {preanalysisStep === 0 && (
                          <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                          >
                            <div className="bg-blue-600 rounded-[28px] p-6 text-white shadow-xl shadow-blue-100 relative overflow-hidden">
                              <Zap size={80} className="absolute -right-4 -bottom-4 text-white/10" />
                              <div className="relative z-10">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 block mb-1">Esito Qualifica</span>
                                <div className="flex items-end justify-between">
                                  <h3 className="text-4xl font-black">{item.preanalysis_result.score}%</h3>
                                  <Badge className={cn(
                                    "font-black text-[11px] uppercase px-4 py-1.5 rounded-xl border-none shadow-sm",
                                    item.preanalysis_result.result === 'Idoneo' || item.preanalysis_result.result === 'Positivo' ? "bg-emerald-400 text-emerald-950" : 
                                    item.preanalysis_result.result === 'Non idoneo' || item.preanalysis_result.result === 'Negativo' ? "bg-rose-400 text-rose-950" : 
                                    "bg-blue-400 text-blue-950"
                                  )}>
                                    {item.preanalysis_result.result === 'Positivo' ? 'Idoneo' : 
                                     item.preanalysis_result.result === 'Negativo' ? 'Non idoneo' : 
                                     item.preanalysis_result.result === 'Dubbio' ? 'In valutazione' : item.preanalysis_result.result}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Tipo Richiesta</span>
                                <p className="text-sm font-bold text-slate-700">{item.preanalysis_result.request_type}</p>
                              </div>
                              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Importo</span>
                                <p className="text-sm font-black text-emerald-600">€ {item.preanalysis_result.estimated_amount?.toLocaleString()}</p>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {preanalysisStep === 1 && (
                          <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-4"
                          >
                            <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest px-1">Dati Societari Extra</h3>
                            <div className="grid grid-cols-1 gap-4">
                              {[
                                { label: "Ragione Sociale", value: item.preanalysis_result.company_data?.name, icon: Building },
                                { label: "P.IVA / CF", value: item.preanalysis_result.company_data?.vat || '-', icon: Info },
                                { label: "Settore", value: item.preanalysis_result.company_data?.industry || 'Agricoltura/Industry', icon: TrendingUp },
                                { label: "Referente", value: item.preanalysis_result.contact_data?.name || item.contact, icon: User },
                                { label: "Telefono", value: item.preanalysis_result.contact_data?.phone || item.phone, icon: Phone },
                                { label: "Email", value: item.preanalysis_result.contact_data?.email || item.email, icon: Mail },
                              ].map((field, i) => (
                                <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
                                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                                    <field.icon size={20} />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">{field.label}</span>
                                    <p className="text-sm font-bold text-slate-700 truncate">{field.value || '-'}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}

                        {preanalysisStep === 2 && (
                          <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-4"
                          >
                             <div className="flex items-center justify-between px-1">
                               <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Risposte Form Completo</h3>
                               <Badge variant="outline" className="text-[8px] font-black uppercase text-blue-500 bg-blue-50 border-blue-100">7 Domande</Badge>
                             </div>
                             <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                               <div className="divide-y divide-slate-100">
                                 {[
                                   { q: "Tipo Investimento", a: item.preanalysis_result.request_type },
                                   { q: "Budget Previsto", a: item.preanalysis_result.estimated_amount || item.preanalysis_result.budget ? `€ ${(item.preanalysis_result.estimated_amount || item.preanalysis_result.budget).toLocaleString()}` : null },
                                   { q: "Note del Lead", a: item.preanalysis_result.notes },
                                   { q: "Servizio Richiesto", a: item.preanalysis_result.service_requested },
                                   { q: "Precedenti Esperienze", a: item.preanalysis_result.form_responses?.experience },
                                   { q: "Tempistiche Progetto", a: item.preanalysis_result.form_responses?.timeline },
                                   { q: "Sorgente Lead", a: item.form_source || 'Integrazione Diretta' }
                                 ].map((resp, i) => (
                                   <div key={i} className="p-6 md:p-8 space-y-3 hover:bg-slate-50/50 transition-colors">
                                     <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] block">{resp.q}</span>
                                     <div className={cn(
                                       "text-sm font-semibold leading-relaxed transition-all",
                                       !resp.a ? "text-slate-400 italic bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200" : "text-slate-800"
                                     )}>
                                       {resp.a ? (
                                         <span className="flex items-start gap-3">
                                           <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                                           "{resp.a}"
                                         </span>
                                       ) : (
                                         <span className="flex items-center gap-2">
                                           <X size={14} className="text-slate-300" />
                                           Il lead non ha fornito una risposta
                                         </span>
                                       )}
                                     </div>
                                   </div>
                                 ))}
                               </div>
                             </div>
                          </motion.div>
                        )}

                        {preanalysisStep === 3 && (
                          <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-5"
                          >
                             <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 relative overflow-hidden">
                               <Badge className="bg-emerald-600 text-white font-black uppercase text-[8px] tracking-[0.2em] mb-4">Nexus Core Analysis</Badge>
                               <h3 className="text-lg font-black text-emerald-900 uppercase tracking-tighter mb-4 flex items-center gap-2">
                                 <Zap size={18} className="text-emerald-500" /> Insights AI
                               </h3>
                               <div className="space-y-3">
                                 {item.preanalysis_result.auto_notes?.map((note: string, i: number) => (
                                   <div key={i} className="flex gap-3 bg-white/60 p-3 rounded-2xl border border-emerald-100/30">
                                      <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                      <p className="text-[11px] text-emerald-900/80 font-bold leading-relaxed">{note}</p>
                                   </div>
                                 ))}
                                 {(!item.preanalysis_result.auto_notes || item.preanalysis_result.auto_notes.length === 0) && (
                                   <p className="text-[11px] text-slate-400 font-bold italic">Nessun insight automatico generato per questo lead.</p>
                                 )}
                               </div>
                             </div>
                          </motion.div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </TabsContent>

            {/* TAB ATTIVITÀ RESPONSIVE */}
            <TabsContent value="activities" className="m-0 flex-1 flex flex-col overflow-hidden focus-visible:outline-none">
              <div className="flex-1 overflow-y-auto p-4 md:p-5 pb-32 space-y-6">
                {canAddNote(item) ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm focus-within:border-blue-400 transition-colors">
                    <Textarea 
                      placeholder="Documenta un aggiornamento o scrivi un feedback..." 
                      className="min-h-[80px] border-none focus-visible:ring-0 text-xs font-medium resize-none p-0 bg-transparent leading-relaxed"
                    />
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-50">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-slate-400 hover:text-blue-500"><Paperclip size={14} /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-slate-400 hover:text-blue-500"><LinkIcon size={14} /></Button>
                      </div>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-[10px] uppercase tracking-widest px-4 shadow-lg shadow-blue-100">Invia</Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sola lettura per attività</p>
                  </div>
                )}
                
                <CRMActivities dealId={item.id} />
              </div>
            </TabsContent>

            {/* TAB NOTE RESPONSIVE */}
            <TabsContent value="notes" className="m-0 flex-1 flex flex-col overflow-hidden focus-visible:outline-none">
              <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 pb-32">
                <div className="flex justify-between items-center shrink-0">
                  <h3 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <StickyNote size={12} className="text-amber-500" /> Note Personali
                  </h3>
                  <div className="flex items-center gap-1 text-[8px] md:text-[9px] font-bold text-slate-300">
                    <Clock size={10} /> Auto-save
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col min-h-[300px]">
                  <div className="border-b border-slate-50 p-2 flex gap-1 shrink-0">
                    <Button disabled={!canAddNote(item)} variant="ghost" size="icon" className="h-6 w-6 text-slate-400"><Save size={12} /></Button>
                  </div>
                  <Textarea 
                    readOnly={!canAddNote(item)}
                    placeholder={canAddNote(item) ? "Dettagli critici..." : "Sola lettura"} 
                    className="flex-1 border-none focus-visible:ring-0 resize-none text-[11px] md:text-xs font-medium p-4 leading-relaxed bg-transparent w-full"
                    defaultValue={item.custom_fields?.internal_notes || ''}
                  />
                </div>
              </div>
            </TabsContent>

            {/* TAB FILE RESPONSIVE */}
            <TabsContent value="files" className="m-0 flex-1 flex flex-col overflow-hidden focus-visible:outline-none">
              <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-6 pb-32">
                {canUploadFile(item) ? (
                  <div className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-blue-100 transition-all">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <p className="text-[10px] md:text-xs font-black text-blue-700 uppercase tracking-tight">Carica Allegati</p>
                    <p className="text-[8px] md:text-[10px] text-blue-400 font-bold mt-1">Trascina qui o clicca</p>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-6 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Caricamento file disabilitato</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-[9px] md:text-[10px] font-black text-slate-800 uppercase tracking-widest">Allegati (2)</h3>
                    <Button variant="ghost" size="sm" className="h-6 text-[8px] md:text-[9px] font-black text-blue-500 uppercase tracking-widest">Vedi Tutti</Button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <div className="bg-white p-3 rounded-2xl border border-slate-100 flex items-center gap-3 shadow-sm group">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
                        <FileText size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] md:text-[11px] font-black text-slate-700 uppercase tracking-tight truncate">Contratto_Firma.pdf</p>
                        <p className="text-[8px] md:text-[9px] text-slate-400 font-bold uppercase">1.2 MB • 12/05/2024</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 group-hover:text-blue-500"><MoreVertical size={14} /></Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* RESPONSIVE ACTIONS FOOTER */}
        <div className="bg-white border-t border-slate-100 p-4 flex gap-3 shrink-0 sticky bottom-0">
          <Button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl h-10 text-[9px] md:text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-50 active:scale-95 transition-all">
            AZIONI
          </Button>
          {canDeleteDeals && (
            <Button 
             variant="ghost" 
             onClick={async () => {
               if(window.confirm("Sicuro di voler eliminare questo affare?")) {
                 try {
                   await supabaseCRMService.deleteDeal(item.id);
                   toast.success("Affare eliminato");
                   onClose();
                   fetchInitialData(activeStructure?.slug);
                 } catch(e) { toast.error("Errore eliminazione"); }
               }
             }}
             className="h-10 w-10 p-0 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl"
            >
              <Trash2 size={18} />
            </Button>
          )}
          <Button variant="outline" onClick={onClose} className="flex-1 border-slate-200 text-slate-500 font-black rounded-xl h-10 text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-slate-50">
            CHIUDI
          </Button>
        </div>

        <CreateEventModal 
          isOpen={isEventModalOpen}
          onClose={() => setIsEventModalOpen(false)}
          onSuccess={() => {}}
          deals={[item]}
          initialData={{ deal_id: item.id }}
        />
      </SheetContent>
    </Sheet>
  );
};
