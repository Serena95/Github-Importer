import { create } from 'zustand';
import { CRMStructure, CRMStage, CRMDeal, CRMCustomFieldDefinition, SmartProcess, CRMWorkspace, CRMContact, CRMCompany } from '@/types/crm';
import { supabaseCRMService } from '@/services/supabaseCRMService';
import { CRM_STRUCTURES, CRM_PIPELINE_STAGES } from '@/constants/crm';
import { toast } from 'sonner';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, Unsubscribe } from 'firebase/firestore';

interface CRMFilters {
  search: string;
  pipeline: string; // ID della struttura attiva
  stage: string[];  // ID degli stage
  owner: string[];  // ID degli assegnatari
  dateFrom: Date | null;
  dateTo: Date | null;
  valueMin: number | null;
  valueMax: number | null;
  score: [number, number];
  status: string[]; // 'attivo', 'vinto', 'perso'
}

interface SavedFilter {
  id: string;
  label: string;
  filters: Partial<CRMFilters>;
}

interface CRMState {
  structures: CRMStructure[];
  activeStructure: CRMStructure | null;
  workspaces: CRMWorkspace[];
  activeWorkspace: CRMWorkspace | null;
  stages: CRMStage[];
  deals: CRMDeal[];
  contacts: CRMContact[];
  companies: CRMCompany[];
  customFields: CRMCustomFieldDefinition[];
  smartProcesses: SmartProcess[];
  isLoading: boolean;
  initialLoadDone: boolean;
  error: string | null;
  unsubscribeFn: Unsubscribe | null;
  
  // Filters
  filters: CRMFilters;
  searchDebounceTimer: any;
  savedFilters: SavedFilter[];
  activeSavedFilterId: string | null;
  activeSavedFilterLabel: string | null;

  // Global Search
  globalSearchQuery: string;
  globalSearchResults: any[];
  isGlobalSearching: boolean;

  crmView: 'kanban' | 'list' | 'calendar';

  setStructures: (structures: CRMStructure[]) => void;
  setActiveStructure: (structure: CRMStructure) => void;
  setWorkspaces: (workspaces: CRMWorkspace[]) => void;
  setActiveWorkspace: (workspace: CRMWorkspace) => void;
  switchWorkspace: (workspace: CRMWorkspace) => Promise<void>;
  setStages: (stages: CRMStage[]) => void;
  setDeals: (deals: CRMDeal[]) => void;
  setContacts: (contacts: CRMContact[]) => void;
  setCompanies: (companies: CRMCompany[]) => void;
  setCustomFields: (fields: CRMCustomFieldDefinition[]) => void;
  
  setFilters: (filters: Partial<CRMFilters>) => void;
  refreshDealsWithFilters: () => Promise<void>;
  setCRMView: (view: 'kanban' | 'list' | 'calendar') => void;
  resetFilters: () => void;
  applySavedFilter: (id: string) => void;
  saveCurrentFilter: (label: string) => void;
  
  setGlobalSearchQuery: (query: string) => void;
  searchGlobal: (query: string) => Promise<void>;
  
  fetchInitialData: (preferredStructureSlug?: string, force?: boolean) => Promise<void>;
  fetchContacts: () => Promise<void>;
  fetchCompanies: () => Promise<void>;
  switchStructure: (structure: CRMStructure) => Promise<void>;
  moveDeal: (dealId: string, toStageId: string) => Promise<void>;
  subscribeToChanges: (structureId: string) => void;
  unsubscribeFromChanges: () => void;
  
  getFilteredDeals: () => CRMDeal[];
}

const DEFAULT_FILTERS: CRMFilters = {
  search: '',
  pipeline: '',
  stage: [],
  owner: [],
  dateFrom: null,
  dateTo: null,
  valueMin: null,
  valueMax: null,
  score: [0, 100],
  status: []
};

export const useCRMStore = create<CRMState>((set, get) => ({
  structures: [],
  activeStructure: null,
  workspaces: [],
  activeWorkspace: null,
  stages: [],
  deals: [],
  contacts: [],
  companies: [],
  customFields: [],
  smartProcesses: [],
  isLoading: false,
  initialLoadDone: false,
  error: null,
  unsubscribeFn: null,

  // Filters state
  filters: DEFAULT_FILTERS,
  searchDebounceTimer: null,
  savedFilters: [
    { id: 'miei', label: 'I miei affari', filters: { owner: ['user-1'] } }, 
    { id: 'vinti', label: 'Affari Vinti', filters: { status: ['vinto'] } },
    { id: 'attivi', label: 'Affari Attivi', filters: { status: ['attivo'] } },
    { id: 'valore-alto', label: 'Valore Alto (>10k)', filters: { valueMin: 10000 } },
  ],
  activeSavedFilterId: null,
  activeSavedFilterLabel: null,

  globalSearchQuery: '',
  globalSearchResults: [],
  isGlobalSearching: false,
  crmView: 'kanban',

  setStructures: (structures) => set({ structures }),
  setActiveStructure: (activeStructure) => set({ activeStructure }),
  setWorkspaces: (workspaces) => set({ workspaces }),
  setActiveWorkspace: (activeWorkspace) => set({ activeWorkspace }),
  
  switchWorkspace: async (workspace) => {
    set({ activeWorkspace: workspace, isLoading: true });
    try {
      const structures = await supabaseCRMService.getStructures(workspace.id);
      set({ structures });
      
      if (structures.length > 0) {
        await get().switchStructure(structures[0]);
      } else {
        set({ activeStructure: null, stages: [], deals: [] });
      }
    } catch (e) {
      toast.error("Errore nel cambio workspace");
    } finally {
      set({ isLoading: false });
    }
  },
  
  setStages: (stages) => set({ stages }),
  setDeals: (deals) => set({ deals }),
  setContacts: (contacts) => set({ contacts }),
  setCompanies: (companies) => set({ companies }),
  setCustomFields: (customFields) => set({ customFields }),

  setFilters: (newFilters) => {
    const state = get();
    const updatedFilters = { ...state.filters, ...newFilters };
    
    // Se cambia la pipeline, reset stage filter
    if (newFilters.pipeline && newFilters.pipeline !== state.filters.pipeline) {
      updatedFilters.stage = [];
    }

    set({ 
      filters: updatedFilters,
      activeSavedFilterId: null,
      activeSavedFilterLabel: null
    });

    // Debounce per ricerca, esecuzione immediata per altri filtri
    if ('search' in newFilters) {
      if (state.searchDebounceTimer) clearTimeout(state.searchDebounceTimer);
      const timer = setTimeout(() => {
        get().refreshDealsWithFilters();
      }, 300);
      set({ searchDebounceTimer: timer });
    } else {
      get().refreshDealsWithFilters();
    }
  },

  refreshDealsWithFilters: async () => {
    const { filters, activeWorkspace, activeStructure } = get();
    const pipelineId = filters.pipeline || activeStructure?.id;
    if (!pipelineId || !activeWorkspace) return;

    set({ isLoading: true });
    try {
      // Passiamo solo i filtri che Firestore può gestire bene in una query base
      const deals = await supabaseCRMService.getDeals(pipelineId, activeWorkspace.id, {
        owner: filters.owner,
        stage: filters.stage
      });
      set({ deals });
    } catch (e) {
      console.error("Error refreshing deals with filters:", e);
    } finally {
      set({ isLoading: false });
    }
  },

  setCRMView: (crmView) => set({ crmView }),

  resetFilters: () => {
    set({ 
      filters: { ...DEFAULT_FILTERS, pipeline: get().activeStructure?.id || '' }, 
      activeSavedFilterId: null, 
      activeSavedFilterLabel: null 
    });
    get().refreshDealsWithFilters();
  },

  applySavedFilter: (id) => {
    const saved = get().savedFilters.find(f => f.id === id);
    if (saved) {
      set({ 
        filters: { ...DEFAULT_FILTERS, pipeline: get().activeStructure?.id || '', ...saved.filters },
        activeSavedFilterId: id,
        activeSavedFilterLabel: saved.label
      });
      get().refreshDealsWithFilters();
    }
  },

  saveCurrentFilter: (label) => {
    const newFilter: SavedFilter = {
      id: `custom-${Date.now()}`,
      label,
      filters: { ...get().filters }
    };
    set((state) => ({
      savedFilters: [...state.savedFilters, newFilter],
      activeSavedFilterId: newFilter.id,
      activeSavedFilterLabel: label
    }));
  },

  setGlobalSearchQuery: (query) => set({ globalSearchQuery: query }),

  searchGlobal: async (queryStr) => {
    if (!queryStr || queryStr.length < 2) {
      set({ globalSearchResults: [], isGlobalSearching: false });
      return;
    }
    set({ isGlobalSearching: true });
    try {
      const results = await supabaseCRMService.searchGlobalDeals(queryStr, get().activeWorkspace?.id);
      set({ globalSearchResults: results });
    } catch (e) {
      console.error("Global search error:", e);
    } finally {
      set({ isGlobalSearching: false });
    }
  },

  getFilteredDeals: () => {
    const { deals, filters, stages } = get();
    return deals.filter(deal => {
      // In-memory filters per maggiore reattività su set di dati locali
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          deal.title?.toLowerCase().includes(searchLower) ||
          deal.company?.toLowerCase().includes(searchLower) ||
          deal.contact?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      
      if (filters.owner.length > 0 && !filters.owner.includes(deal.assigned_to)) return false;
      if (filters.stage.length > 0 && !filters.stage.includes(deal.stage_id)) return false;
      
      if (filters.valueMin !== null && deal.value < filters.valueMin) return false;
      if (filters.valueMax !== null && deal.value > filters.valueMax) return false;
      
      if (deal.preanalysis_result) {
        const score = deal.preanalysis_result.score;
        if (score < filters.score[0] || score > filters.score[1]) return false;
      }
      
      if (filters.dateFrom || filters.dateTo) {
        const created = new Date(deal.created_at);
        if (filters.dateFrom && created < filters.dateFrom) return false;
        if (filters.dateTo && created > filters.dateTo) return false;
      }
      
      if (filters.status.length > 0) {
        const stage = stages.find(s => s.id === deal.stage_id);
        const dealStatus = stage?.is_won ? 'vinto' : (stage?.is_lost ? 'perso' : 'attivo');
        if (!filters.status.includes(dealStatus)) return false;
      }
      
      return true;
    });
  },

  subscribeToChanges: (structureId) => {
    get().unsubscribeFromChanges();

    const { activeWorkspace } = get();
    let q = query(
      collection(db, 'crm_deals'), 
      where('structure_id', '==', structureId)
    );

    if (activeWorkspace) {
      q = query(
        collection(db, 'crm_deals'), 
        where('workspace_id', '==', activeWorkspace.id),
        where('structure_id', '==', structureId)
      );
    }

    const unsub = onSnapshot(q, (snapshot) => {
      const deals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CRMDeal));
      set({ deals: deals.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) });
    });

    set({ unsubscribeFn: unsub });
  },

  unsubscribeFromChanges: () => {
    const { unsubscribeFn } = get();
    if (unsubscribeFn) {
      unsubscribeFn();
      set({ unsubscribeFn: null });
    }
  },

  fetchInitialData: async (preferredStructureSlug?: string, force = false) => {
    const { isLoading, initialLoadDone } = get();
    if (isLoading) return;
    if (initialLoadDone && !preferredStructureSlug && !force) return;
    
    set({ isLoading: true, error: null });
    
    try {
      // 1. Fetch Workspaces
      const workspaces = await supabaseCRMService.getWorkspaces();
      
      if (!workspaces || workspaces.length === 0) {
        // Create an initial workspace if none exists for the current user
        try {
          const newWs = await supabaseCRMService.createWorkspace("La mia Azienda");
          workspaces.push(newWs);
        } catch (wsError) {
          console.error("Failed to create initial workspace", wsError);
        }
      }

      const activeWs = get().activeWorkspace || (workspaces && workspaces.length > 0 ? workspaces[0] : null);
      
      if (activeWs) {
        try {
          await supabaseCRMService.initializeCRM(activeWs.id);
        } catch (e) { 
          console.warn("Init failed for workspace", activeWs.id); 
        }
      }

      // 2. Fetch data for active workspace
      const structures = await supabaseCRMService.getStructures(activeWs?.id);
      
      if (structures && structures.length > 0) {
        let activeStruct = structures[0];
        if (preferredStructureSlug) {
           const found = structures.find(s => s.slug === preferredStructureSlug || `nexus-${s.slug}` === preferredStructureSlug);
           if (found) activeStruct = found;
        }

        const [stages, deals, contacts, companies, customFields, smartProcesses] = await Promise.all([
          supabaseCRMService.getStages(activeStruct.id),
          supabaseCRMService.getDeals(activeStruct.id, activeWs?.id),
          supabaseCRMService.getContacts(activeWs?.id),
          supabaseCRMService.getCompanies(activeWs?.id),
          supabaseCRMService.getCustomFieldDefinitions(),
          supabaseCRMService.getSmartProcesses()
        ]);
        
        set({ 
          workspaces,
          activeWorkspace: activeWs,
          structures, 
          activeStructure: activeStruct,
          stages,
          deals,
          contacts,
          companies,
          customFields,
          smartProcesses,
          initialLoadDone: true
        });
        
        get().subscribeToChanges(activeStruct.id);
      } else {
        set({ workspaces, activeWorkspace: activeWs, structures: [], activeStructure: null, initialLoadDone: true });
        throw new Error("No CRM data found");
      }
    } catch (error: any) {
      console.warn("CRM Fetch failed, using fallback:", error.message);
      
      const fallbackStructures = CRM_STRUCTURES.map(s => ({
        id: `local-${s.slug}`,
        name: s.name,
        slug: s.slug,
        color: s.color,
        workspace_id: 'local-workspace',
        created_at: new Date().toISOString()
      }));
      
      const defaultStruct = fallbackStructures[0];
      const fallbackStages = CRM_PIPELINE_STAGES.map((s, i) => ({
        id: `local-stage-${i}`,
        structure_id: defaultStruct.id,
        name: s.name,
        position: s.position,
        color: s.color,
        is_won: s.is_won,
        is_lost: s.is_lost,
        created_at: new Date().toISOString()
      }));
      
      set({ 
        structures: fallbackStructures, 
        activeStructure: defaultStruct, 
        stages: fallbackStages, 
        deals: [], 
        initialLoadDone: true 
      });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchContacts: async () => {
    const { activeWorkspace } = get();
    if (!activeWorkspace) return;
    set({ isLoading: true });
    try {
      const contacts = await supabaseCRMService.getContacts(activeWorkspace.id);
      set({ contacts });
    } catch (e) {
      console.error("Error fetching contacts", e);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCompanies: async () => {
    const { activeWorkspace } = get();
    if (!activeWorkspace) return;
    set({ isLoading: true });
    try {
      const companies = await supabaseCRMService.getCompanies(activeWorkspace.id);
      set({ companies });
    } catch (e) {
      console.error("Error fetching companies", e);
    } finally {
      set({ isLoading: false });
    }
  },

  switchStructure: async (structure) => {
    set({ isLoading: true, activeStructure: structure, stages: [], deals: [], error: null });

    try {
      if (structure.id.startsWith('local-')) {
        const fallbackStages = CRM_PIPELINE_STAGES.map((s, i) => ({
          id: `local-stage-${i}`,
          structure_id: structure.id,
          name: s.name,
          position: s.position,
          color: s.color,
          is_won: s.is_won,
          is_lost: s.is_lost,
          created_at: new Date().toISOString()
        }));
        set({ stages: fallbackStages, deals: [] });
        get().unsubscribeFromChanges();
      } else {
        const [stages, deals] = await Promise.all([
          supabaseCRMService.getStages(structure.id),
          supabaseCRMService.getDeals(structure.id, get().activeWorkspace?.id)
        ]);
        set({ stages, deals });
        get().subscribeToChanges(structure.id);
      }
    } catch (error: any) {
      set({ error: error.message });
      toast.error("Errore nel caricamento della pipeline");
    } finally {
      set({ isLoading: false });
    }
  },

  moveDeal: async (dealId, toStageId) => {
    const originalDeals = get().deals;
    const stages = get().stages;
    const toStage = stages.find(s => s.id === toStageId);
    
    if (toStage?.name.toLowerCase().includes('preanalisi')) {
      toast.error("Questa colonna è automatica. Non è possibile spostare affari qui manualmente.");
      return;
    }

    const deal = originalDeals.find(d => d.id === dealId);
    if (!deal) return;

    const updatedDeals = originalDeals.map(d => 
      d.id === dealId ? { ...d, stage_id: toStageId } : d
    );
    set({ deals: updatedDeals });

    try {
      await supabaseCRMService.updateDealStage(dealId, toStageId);
    } catch (error: any) {
      set({ deals: originalDeals, error: error.message });
    }
  }
}));

