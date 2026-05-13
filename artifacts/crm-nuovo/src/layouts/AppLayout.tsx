import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useDraggableScroll } from '@/hooks/useDraggableScroll';
import { 
  Building, 
  UserPlus, 
  DollarSign, 
  Ticket, 
  ClipboardList, 
  Shield,
  LayoutDashboard, 
  Users, 
  Briefcase, 
  CheckSquare, 
  MessageSquare, 
  Calendar as CalendarIcon, 
  Settings as SettingsIcon, 
  LogOut,
  X,
  Menu,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  HelpCircle,
  Clock,
  FileText,
  HardDrive,
  Mail,
  Target,
  Zap,
  Settings2,
  TrendingUp,
  Grid,
  Home,
  BarChart3,
  Activity,
  PieChart,
  Layers,
  Share2,
  Inbox,
  Send,
  FileSignature,
  Users2,
  GanttChart,
  Smartphone,
  Megaphone,
  Workflow,
  Bot,
  Store,
  ShieldCheck,
  PhoneCall,
  Hash,
  Video,
  User,
  Folder,
  FolderPlus,
  GitBranch,
  Headphones,
  Code,
  Package,
  Globe,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ChatAgente from '../components/crm/ChatAgente';
import NotificationCenter from '../components/NotificationCenter';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup,
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from '@/lib/utils';
import { GlobalSearch } from '../components/crm/GlobalSearch';
import { useCRMPermissions } from '@/hooks/useCRMPermissions';
import { useCRMStore } from '@/stores/crmStore';
import { format } from 'date-fns';
import QuickCreate from '../components/QuickCreate';
import OnlineDot from '../components/OnlineDot';
import WorkdayTimer from '../components/WorkdayTimer';
import { usePresence } from '@/hooks/usePresence';
import { usePresenceStore } from '@/stores/presenceStore';
import { useDesktopNotifications } from '@/hooks/useDesktopNotifications';

const ICONS = [
  { name: 'DollarSign', icon: DollarSign },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'Ticket', icon: Ticket },
  { name: 'ClipboardList', icon: ClipboardList },
  { name: 'MessageSquare', icon: MessageSquare },
  { name: 'Shield', icon: Shield },
  { name: 'Workflow', icon: Workflow },
];

const AppLayout: React.FC = () => {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Derive activeTab from current path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const activeTab = pathParts[0] || 'dashboard';
  const subTab = pathParts[1] || '';
  const currentActive = subTab ? `${activeTab}-${subTab}` : activeTab;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['crm', 'tasks', 'dashboard']);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const { role } = useCRMPermissions();
  const { smartProcesses } = useCRMStore();
  const crmScrollRef = useDraggableScroll();

  const isCRM = location.pathname.includes('/crm');

  // Bitrix-style: track current user presence + subscribe to tenant presence + desktop notifs
  usePresence();
  useDesktopNotifications();
  const initPresence = usePresenceStore((s) => s.init);
  const cleanupPresence = usePresenceStore((s) => s.cleanup);
  useEffect(() => {
    if (profile?.tenantId) {
      initPresence(profile.tenantId);
      return () => cleanupPresence();
    }
  }, [profile?.tenantId, initPresence, cleanupPresence]);

  const crmTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/crm/dashboard' },
    { id: 'leads', label: 'Lead', icon: Target, path: '/crm/leads' },
    { id: 'affari', label: 'Affari', icon: Briefcase, path: '/crm/affari' },
    { id: 'contacts', label: 'Contatti', icon: Users, path: '/crm/contacts' },
    { id: 'companies', label: 'Aziende', icon: Building, path: '/crm/companies' },
    { id: 'tasks', label: 'Task', icon: CheckSquare, path: '/crm/tasks' },
    { id: 'calendar', label: 'Calendario', icon: CalendarIcon, path: '/crm/calendario' },
    { id: 'analytics', label: 'Analisi', icon: BarChart3, path: '/crm/analytics' },
    { id: 'automations', label: 'Automazioni', icon: Zap, path: '/crm/automazioni' },
    { id: 'settings', label: 'Configura', icon: Settings2, path: '/crm/configurazione' },
  ];

  const setActiveTab = (tab: string) => {
    // Basic routing logic
    if (tab === 'dashboard-home' || tab === 'dashboard') {
      navigate('/dashboard');
    } else if (tab === 'feed') {
      navigate('/feed');
    } else if (['leads', 'contacts', 'companies', 'affari', 'crm', 'tasks'].includes(tab)) {
      if (tab === 'tasks') navigate('/crm/tasks');
      else navigate(`/crm/${tab}`);
    } else if (tab.startsWith('smart-process-')) {
      navigate(`/crm/${tab}`);
    } else if (tab.startsWith('dashboard-')) {
      navigate(`/dashboard/${tab.replace('dashboard-', '')}`);
    } else if (tab.startsWith('cc-')) {
      navigate(`/contact-center/${tab.replace('cc-', '')}`);
    } else if (tab.startsWith('chat-')) {
      navigate(`/chat/${tab.replace('chat-', '')}`);
    } else {
      // Fallback for others
      navigate(`/${tab.replace('-', '/')}`);
    }
  };

  const toggleMenu = (id: string) => {
    setExpandedMenus(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const getContextualBubbles = () => {
    const isCRM = location.pathname.includes('/crm');
    const isTasks = location.pathname.includes('/tasks');

    if (isCRM) {
      return [
        { id: 'new-lead', icon: UserPlus, color: 'bg-blue-500', label: 'Nuovo Lead' },
        { id: 'new-deal', icon: DollarSign, color: 'bg-emerald-500', label: 'Nuovo Affare' },
        { id: 'new-contact', icon: Users, color: 'bg-amber-500', label: 'Nuovo Contatto' },
        { id: 'new-company', icon: Building, color: 'bg-purple-500', label: 'Nuova Azienda' },
        { id: 'crm-settings', icon: SettingsIcon, color: 'bg-slate-600', label: 'Impostazioni CRM' }
      ];
    }

    if (isTasks) {
      return [
        { id: 'new-task', icon: CheckSquare, color: 'bg-purple-500', label: 'Nuovo Task' },
        { id: 'new-project', icon: Briefcase, color: 'bg-blue-500', label: 'Nuovo Progetto' },
        { id: 'tasks-kanban', icon: Grid, color: 'bg-emerald-500', label: 'Vista Kanban' },
        { id: 'tasks-gantt', icon: GanttChart, color: 'bg-amber-500', label: 'Vista Gantt' },
        { id: 'tasks-settings', icon: SettingsIcon, color: 'bg-slate-600', label: 'Impostazioni Task' }
      ];
    }

    // Default global bubbles
    return [
      { id: 'chat', icon: MessageSquare, color: 'bg-blue-500', label: 'Chat' },
      { id: 'calendar', icon: CalendarIcon, color: 'bg-emerald-500', label: 'Calendario' },
      { id: 'feed', icon: Layers, color: 'bg-amber-500', label: 'Feed' },
      { id: 'drive', icon: HardDrive, color: 'bg-purple-500', label: 'Drive' },
      { id: 'settings', icon: SettingsIcon, color: 'bg-slate-600', label: 'Impostazioni' }
    ];
  };

  const handleBubbleClick = (id: string) => {
    switch (id) {
      case 'new-lead':
        window.dispatchEvent(new CustomEvent('crm:openCreate', { detail: { type: 'lead' } }));
        break;
      case 'new-deal':
        window.dispatchEvent(new CustomEvent('crm:openCreate', { detail: { type: 'deal' } }));
        break;
      case 'new-contact':
        window.dispatchEvent(new CustomEvent('crm:openCreate', { detail: { type: 'contact' } }));
        break;
      case 'new-company':
        window.dispatchEvent(new CustomEvent('crm:openCreate', { detail: { type: 'company' } }));
        break;
      case 'new-task':
        window.dispatchEvent(new CustomEvent('tasks:openCreate'));
        break;
      case 'chat': navigate('/chat'); break;
      case 'calendar': navigate('/calendar'); break;
      case 'feed': navigate('/feed'); break;
      case 'drive': navigate('/drive'); break;
      case 'settings':
      case 'crm-settings':
      case 'tasks-settings':
        navigate('/settings');
        break;
      case 'tasks-kanban': navigate('/tasks/kanban'); break;
      case 'tasks-gantt': navigate('/tasks/gantt'); break;
    }
  };

  const handleDealClick = (dealId: string, structureSlug?: string) => {
    if (structureSlug) {
      navigate(`/crm/pipeline-${structureSlug}`);
    } else {
      navigate('/crm/affari');
    }
    
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('crm:openDeal', { detail: { dealId } }));
    }, 500);
  };

  useEffect(() => {
    const handleGlobalOpenDeal = (event: any) => {
      const { dealId, structureSlug } = event.detail;
      handleDealClick(dealId, structureSlug);
    };

    window.addEventListener('crm:openDealGlobal', handleGlobalOpenDeal);
    return () => window.removeEventListener('crm:openDealGlobal', handleGlobalOpenDeal);
  }, []);

  const navItems = [
    { id: 'crm', label: 'CRM', icon: Briefcase, subItems: [
      { id: 'crm-dashboard', label: 'Dashboard commerciale', icon: LayoutDashboard },
      { id: 'feed', label: 'Feed attività', icon: Activity },
      { id: 'leads', label: 'Lead', icon: Target },
      { id: 'contacts', label: 'Contatti', icon: Users },
      { id: 'companies', label: 'Aziende', icon: Building },
      { id: 'affari', label: 'Affari', icon: Briefcase },
      ...smartProcesses.map(p => {
        const IconComp = ICONS.find(i => i.name === p.icon)?.icon || DollarSign;
        return {
          id: `smart-process-${p.slug}`,
          label: p.name,
          icon: IconComp
        };
      }),
      { id: 'crm-new-process', label: '+ Nuovo processo', icon: Plus, className: "text-blue-500 font-black mt-2" },
    ]},
    { id: 'dashboard', label: 'Monitoraggio CRM', icon: Home, subItems: [
      { id: 'dashboard-home', label: 'Home dashboard', icon: LayoutDashboard },
      { id: 'dashboard-kpi', label: 'KPI', icon: BarChart3 },
      { id: 'dashboard-recent', label: 'Attività recenti', icon: Activity },
      { id: 'dashboard-pipeline', label: 'Pipeline overview', icon: PieChart },
    ], roles: ['admin', 'manager', 'viewer'] },
    { id: 'chat', label: 'Chat e chiamate', icon: MessageSquare, subItems: [
      { id: 'chat-private', label: 'Chat privata', icon: MessageSquare },
      { id: 'chat-group', label: 'Chat gruppo', icon: Users2 },
      { id: 'chat-channels', label: 'Canali', icon: Hash },
      { id: 'chat-video', label: 'Video call', icon: Video },
      { id: 'chat-voip', label: 'Chiamate VoIP', icon: PhoneCall },
    ]},
    { id: 'calendar', label: 'Calendario', icon: CalendarIcon, subItems: [
      { id: 'calendar-personal', label: 'Calendario personale', icon: User },
      { id: 'calendar-team', label: 'Calendario team', icon: Users },
      { id: 'calendar-events', label: 'Eventi', icon: CalendarIcon },
    ]},
    { id: 'docs', label: 'Documenti', icon: FileText, subItems: [
      { id: 'docs-manager', label: 'File manager', icon: Folder },
      { id: 'docs-folders', label: 'Cartelle', icon: FolderPlus },
      { id: 'docs-sharing', label: 'Condivisione', icon: Share2 },
    ]},
    { id: 'drive', label: 'Nexus Drive', icon: HardDrive, subItems: [
      { id: 'drive-personal', label: 'Drive personale', icon: HardDrive },
      { id: 'drive-team', label: 'Drive team', icon: Users },
      { id: 'drive-shared', label: 'File condivisi', icon: Share2 },
    ]},
    { id: 'mail', label: 'Webmail', icon: Mail, subItems: [
      { id: 'mail-inbox', label: 'Inbox', icon: Inbox },
      { id: 'mail-send', label: 'Invio email', icon: Send },
      { id: 'mail-templates', label: 'Template email', icon: FileSignature },
    ]},
    { id: 'groups', label: 'Gruppi di lavoro', icon: Users, subItems: [
      { id: 'groups-list', label: 'Gruppi', icon: Users },
      { id: 'groups-projects', label: 'Progetti', icon: Briefcase },
    ]},
    { id: 'tasks', label: 'Task e progetti', icon: CheckSquare, subItems: [
      { id: 'tasks-my', label: 'I miei task', icon: CheckSquare },
      { id: 'tasks-all', label: 'Tutti i task', icon: Layers },
      { id: 'tasks-kanban', label: 'Kanban', icon: Grid },
      { id: 'tasks-gantt', label: 'Gantt', icon: GanttChart },
    ]},
    { id: 'marketing', label: 'Marketing', icon: Target, subItems: [
      { id: 'marketing-email', label: 'Email marketing', icon: Mail },
      { id: 'marketing-sms', label: 'SMS marketing', icon: Smartphone },
      { id: 'marketing-campaigns', label: 'Campagne', icon: Megaphone },
      { id: 'marketing-leads', label: 'Lead generation', icon: UserPlus },
    ], roles: ['admin', 'manager', 'commerciale'] },
    { id: 'automation', label: 'Automazione', icon: Zap, subItems: [
      { id: 'automation-workflow', label: 'Workflow builder', icon: Workflow },
      { id: 'automation-triggers', label: 'Trigger', icon: Zap },
      { id: 'automation-robots', label: 'Robot', icon: Bot },
    ], roles: ['admin'] },
    { id: 'analytics', label: 'Analisi', icon: TrendingUp, subItems: [
      { id: 'analytics-dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'analytics-sales', label: 'Vendite', icon: DollarSign },
      { id: 'analytics-pipeline', label: 'Pipeline', icon: GitBranch },
    ], roles: ['admin', 'manager'] },
    { id: 'contact-center', label: 'Contact center', icon: Headphones, subItems: [
      { id: 'cc-overview', label: 'Panoramica', icon: Grid },
      { id: 'cc-livechat', label: 'Live chat', icon: MessageSquare },
      { id: 'cc-whatsapp', label: 'WhatsApp', icon: Smartphone },
      { id: 'cc-email', label: 'Email', icon: Mail },
      { id: 'cc-telegram', label: 'Telegram', icon: Send },
      { id: 'cc-facebook', label: 'Facebook', icon: Globe },
      { id: 'cc-instagram', label: 'Instagram', icon: Target },
    ], roles: ['admin', 'manager', 'commerciale'] },
    { id: 'apps', label: 'Applicazioni', icon: Grid, subItems: [
      { id: 'apps-marketplace', label: 'Marketplace', icon: Store },
      { id: 'apps-installed', label: 'Installate', icon: Package },
      { id: 'apps-integrations', label: 'Integrazioni', icon: Layers },
      { id: 'apps-developer', label: 'Sviluppatori', icon: Code },
    ], roles: ['admin'] },
    { id: 'settings', label: 'Impostazioni', icon: SettingsIcon, subItems: [
      { id: 'settings-users', label: 'Utenti', icon: Users },
      { id: 'settings-roles', label: 'Ruoli', icon: ShieldCheck },
      { id: 'settings-permissions', label: 'Permessi', icon: ShieldCheck },
      { id: 'settings-crm-fields', label: 'Campi CRM', icon: Settings2 },
    ], roles: ['admin'] },
  ];

  const filteredNavItems = navItems.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(role || 'viewer');
  });

  const sidebarContent = (
    <div className={cn(
      "flex flex-col h-full nexus-sidebar-gradient text-white/70 transition-all duration-300",
      isSidebarCollapsed ? "w-20" : "w-60"
    )}>
      <div className={cn(
        "p-6 flex items-center justify-between gap-3 shrink-0",
        isSidebarCollapsed && "flex-col p-4"
      )}>
        <div className="flex items-center gap-3 cursor-pointer overflow-hidden" onClick={() => navigate('/dashboard')}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold shrink-0 bg-[#2FC6F6]">N</div>
          {!isSidebarCollapsed && <span className="font-bold text-xl tracking-tight text-white whitespace-nowrap">Nexus</span>}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden text-white/70 hover:text-white hover:bg-white/10" 
          onClick={() => setIsSidebarOpen(false)}
        >
          <X size={20} />
        </Button>
      </div>

      <nav className="flex-1 px-4 space-y-0.5 overflow-y-auto nexus-scrollbar py-4">
        {filteredNavItems.map((item) => (
          <div key={item.id} className="mb-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    if (isSidebarCollapsed) {
                      setIsSidebarCollapsed(false);
                      return;
                    }
                    if (item.subItems) {
                      toggleMenu(item.id);
                      if (item.id === 'crm' && !location.pathname.includes('/crm')) {
                        navigate('/crm/affari');
                      }
                    } else {
                      navigate(`/${item.id}`);
                      setIsSidebarOpen(false);
                    }
                  }}
                  className={cn(
                    "w-full flex items-center justify-between transition-all text-xs font-medium group",
                    isSidebarCollapsed ? "p-2 justify-center rounded-lg" : "px-3 py-2 rounded-md",
                    (location.pathname.includes(`/${item.id}`) || (item.subItems?.some(s => location.pathname.includes(s.id))))
                      ? "bg-white/10 text-white shadow-sm" 
                      : "hover:bg-white/5 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={16} className={cn(
                      "transition-colors shrink-0",
                      (location.pathname.includes(`/${item.id}`) || (item.subItems?.some(s => location.pathname.includes(s.id)))) ? "text-[#2FC6F6]" : "group-hover:text-[#2FC6F6]"
                    )} />
                    {!isSidebarCollapsed && item.label}
                  </div>
                  {!isSidebarCollapsed && item.subItems && (
                    expandedMenus.includes(item.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                  )}
                </button>
              </TooltipTrigger>
              {isSidebarCollapsed && (
                <TooltipContent side="right">
                  {item.label}
                </TooltipContent>
              )}
            </Tooltip>

            {!isSidebarCollapsed && item.subItems && expandedMenus.includes(item.id) && (
              <div className="mt-1 ml-4 pl-4 border-l border-white/10 space-y-0.5">
                {item.subItems.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      if (sub.id === 'crm-new-process') {
                        // Special case handle in component probably or trigger event
                        window.dispatchEvent(new CustomEvent('crm:openSmartProcess'));
                      } else {
                        setActiveTab(sub.id);
                        setIsSidebarOpen(false);
                      }
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-1.5 rounded-md transition-all text-[11px] font-medium group text-left",
                      location.pathname.includes(sub.id) || currentActive === sub.id
                        ? "text-white bg-white/5" 
                        : "text-white/50 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <sub.icon size={14} className={cn(
                        "transition-colors",
                        location.pathname.includes(sub.id) || currentActive === sub.id ? "text-blue-400" : "group-hover:text-blue-400"
                      )} />
                      {sub.label}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10 shrink-0">
        <Button 
          variant="ghost" 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className={cn(
            "w-full text-white/50 hover:text-white hover:bg-white/5 text-xs",
            isSidebarCollapsed ? "justify-center px-0" : "justify-start px-3"
          )}
        >
          {isSidebarCollapsed ? <ChevronRight size={14} /> : (
            <>
              <Menu size={14} className="mr-2" />
              Riduci sidebar
            </>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f5f7fb] text-slate-900 overflow-hidden relative font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside className={cn(
        "hidden lg:flex flex-col z-30 shrink-0 transition-all duration-300",
        isSidebarCollapsed ? "w-20" : "w-60"
      )}>
        {sidebarContent}
      </aside>

      {/* Sidebar - Mobile */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-60 z-50 flex flex-col transition-transform duration-300 ease-in-out lg:hidden",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {sidebarContent}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Topbar */}
        <header className="h-[60px] nexus-topbar-gradient flex items-center justify-between px-4 lg:px-6 z-40 shrink-0 text-white shadow-lg">
          <div className="flex items-center gap-4 flex-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden text-white/70 hover:text-white" 
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={20} />
            </Button>

            <Button 
              variant="ghost" 
              size="icon" 
              className="hidden lg:flex text-white/70 hover:text-white" 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            >
              {isSidebarCollapsed ? <Plus size={20} className="rotate-45" /> : <Menu size={20} />}
            </Button>

            <GlobalSearch />
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <WorkdayTimer />

            <NotificationCenter onDealClick={handleDealClick} />

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/70 hover:text-white hover:bg-white/10 hidden sm:flex"
                  title="Guida e aiuto"
                >
                  <HelpCircle size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[90%] sm:w-[440px] p-0 flex flex-col">
                <SheetHeader className="p-6 border-b bg-gradient-to-br from-blue-50 to-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                      <HelpCircle size={20} />
                    </div>
                    <div>
                      <SheetTitle className="text-lg font-bold text-slate-800">Guida Nexus CRM</SheetTitle>
                      <SheetDescription className="text-xs text-slate-500">
                        Tutto quello che ti serve per iniziare
                      </SheetDescription>
                    </div>
                  </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  <section>
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-blue-600 mb-3">Inizia da qui</h3>
                    <div className="space-y-2">
                      <div className="flex gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">1</div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">Crea il tuo primo affare</p>
                          <p className="text-xs text-slate-500 mt-0.5">Vai su <strong>CRM › Affari</strong> e clicca "Nuovo affare". Trascinalo tra le colonne per aggiornarne lo stato.</p>
                        </div>
                      </div>
                      <div className="flex gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">2</div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">Aggiungi contatti e aziende</p>
                          <p className="text-xs text-slate-500 mt-0.5">Le sezioni <strong>Contatti</strong> e <strong>Aziende</strong> ti permettono di costruire la tua rubrica clienti.</p>
                        </div>
                      </div>
                      <div className="flex gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">3</div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">Organizza il lavoro con i Task</p>
                          <p className="text-xs text-slate-500 mt-0.5">In <strong>Task e progetti</strong> puoi creare attività, assegnarle al team e seguirle in vista Kanban o Gantt.</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-blue-600 mb-3">Sezioni principali</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => navigate('/crm/affari')}>
                        <Briefcase size={16} className="text-blue-600 mb-1.5" />
                        <p className="text-xs font-bold text-slate-800">CRM</p>
                        <p className="text-[10px] text-slate-500">Lead, affari, contatti</p>
                      </div>
                      <div className="p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => navigate('/tasks')}>
                        <CheckSquare size={16} className="text-blue-600 mb-1.5" />
                        <p className="text-xs font-bold text-slate-800">Task</p>
                        <p className="text-[10px] text-slate-500">Attività e progetti</p>
                      </div>
                      <div className="p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => navigate('/calendar')}>
                        <CalendarIcon size={16} className="text-blue-600 mb-1.5" />
                        <p className="text-xs font-bold text-slate-800">Calendario</p>
                        <p className="text-[10px] text-slate-500">Eventi e appuntamenti</p>
                      </div>
                      <div className="p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => navigate('/feed')}>
                        <Activity size={16} className="text-blue-600 mb-1.5" />
                        <p className="text-xs font-bold text-slate-800">Feed</p>
                        <p className="text-[10px] text-slate-500">Attività del team</p>
                      </div>
                      <div className="p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => navigate('/drive')}>
                        <HardDrive size={16} className="text-blue-600 mb-1.5" />
                        <p className="text-xs font-bold text-slate-800">Drive</p>
                        <p className="text-[10px] text-slate-500">File e documenti</p>
                      </div>
                      <div className="p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => navigate('/settings')}>
                        <SettingsIcon size={16} className="text-blue-600 mb-1.5" />
                        <p className="text-xs font-bold text-slate-800">Impostazioni</p>
                        <p className="text-[10px] text-slate-500">Profilo e workspace</p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-blue-600 mb-3">Suggerimenti rapidi</h3>
                    <ul className="space-y-2 text-xs text-slate-600">
                      <li className="flex gap-2"><span className="text-blue-600 font-bold">›</span> Usa la <strong>barra di ricerca</strong> in alto per trovare velocemente affari, contatti o aziende.</li>
                      <li className="flex gap-2"><span className="text-blue-600 font-bold">›</span> Riduci la barra laterale con il pulsante menu per avere più spazio di lavoro.</li>
                      <li className="flex gap-2"><span className="text-blue-600 font-bold">›</span> Clicca un affare per aprirne i dettagli e modificarlo.</li>
                      <li className="flex gap-2"><span className="text-blue-600 font-bold">›</span> Le notifiche (icona campanella) ti tengono aggiornato sulle attività del team.</li>
                    </ul>
                  </section>

                  <section className="pt-4 border-t border-slate-100">
                    <p className="text-[11px] text-slate-400 text-center">
                      Hai bisogno di altro aiuto? Vai in <button onClick={() => navigate('/settings')} className="text-blue-600 font-bold hover:underline">Impostazioni</button> per gestire account e workspace.
                    </p>
                  </section>
                </div>
              </SheetContent>
            </Sheet>
            
            <div className="h-8 w-[1px] bg-white/10 mx-1 lg:mx-2 hidden xs:block"></div>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 hover:bg-white/10 p-1 rounded-lg transition-colors outline-none shrink-0 min-w-0">
                <div className="relative shrink-0">
                  <Avatar className="h-8 w-8 border border-white/20 rounded-lg">
                    <AvatarImage src={profile?.photoURL} />
                    <AvatarFallback className="bg-brand-blue text-white font-bold">{profile?.displayName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <OnlineDot uid={profile?.uid} size="md" />
                </div>
                <span className="text-sm font-black text-white hidden md:inline truncate max-w-[100px]">{profile?.displayName}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/settings')}>Profilo</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>Impostazioni</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={async () => { await logout(); navigate('/login'); }} className="text-red-600">
                  <LogOut size={16} className="mr-2" />
                  Esci
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              onClick={() => navigate('/settings/invite')}
              className="bg-[#2FC6F6] hover:bg-[#1eb0e0] text-white font-bold rounded-full px-6 hidden sm:flex"
            >
              INVITA
            </Button>
          </div>
        </header>

        {/* Horizontal CRM Sidebar Nav */}
        <AnimatePresence>
          {isCRM && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 64, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-white border-b border-slate-200 shadow-sm z-20 relative group/crmnav"
            >
              <div className="max-w-full h-full relative">
                <div 
                  ref={crmScrollRef}
                  className="max-w-full px-6 h-full flex items-center gap-8 overflow-x-auto thin-scrollbar cursor-grab active:cursor-grabbing select-none scroll-smooth pb-2"
                >
                  {crmTabs.map((tab) => {
                    const pathBase = tab.path.split('/').pop() || '';
                    const isActive = location.pathname.includes(tab.id) || location.pathname.includes(pathBase);
                    return (
                      <button
                        key={tab.id}
                        onClick={() => navigate(tab.path)}
                        className={cn(
                          "h-full flex items-center gap-2 px-1 relative text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap group shrink-0",
                          isActive ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
                        )}
                      >
                        <tab.icon size={14} className={cn("transition-colors", isActive ? "text-blue-600" : "text-slate-300 group-hover:text-slate-500")} />
                        {tab.label}
                        {isActive && (
                          <motion.div 
                            layoutId="activeHorizontalTab"
                            className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600 rounded-t-full"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
                
                {/* Scroll indicators / Arrows */}
                <button 
                  onClick={() => crmScrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' })}
                  className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white via-white/80 to-transparent flex items-center justify-start pl-1 text-slate-400 hover:text-blue-600 opacity-0 group-hover/crmnav:opacity-100 transition-opacity z-10"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => crmScrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' })}
                  className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white via-white/80 to-transparent flex items-center justify-end pr-1 text-slate-400 hover:text-blue-600 opacity-0 group-hover/crmnav:opacity-100 transition-opacity z-10"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page Area */}
        <div className="flex-1 overflow-auto bg-[#f5f7fb] w-full max-w-full relative">
           <Outlet />
        </div>


        {/* Quick Create FAB - Bitrix-style "+" */}
        <QuickCreate />

        {/* AI Agent Bubble - Bottom Right */}
        <div className="fixed right-4 bottom-24 lg:bottom-8 z-[70]">
           <Button 
             onClick={() => setIsAIChatOpen(!isAIChatOpen)}
             size="icon" 
             className={cn(
               "w-12 h-12 lg:w-16 lg:h-16 rounded-full shadow-2xl hover:scale-110 transition-transform text-white border-2 border-white bg-brand-blue z-10",
               isAIChatOpen && "rotate-90"
             )}
           >
             {isAIChatOpen ? <X size={28} /> : <Bot size={28} />}
           </Button>
        </div>

        {/* AI Chat Popover */}
        <AnimatePresence>
          {isAIChatOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.9, transformOrigin: 'bottom right' }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="fixed bottom-36 lg:bottom-28 right-4 z-[60] w-[calc(100vw-32px)] sm:w-[350px] md:w-[400px] shadow-2xl rounded-3xl overflow-hidden max-h-[70vh] flex flex-col"
            >
              <ChatAgente clientId="floating-user" onClose={() => setIsAIChatOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AppLayout;
