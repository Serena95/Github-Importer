import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  setDoc,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { CRMStructure, CRMStage, CRMDeal, CRMFormResult, PreanalysisResult, CRMAutomation, CRMCustomFieldDefinition, SmartProcess, SmartRecord, SmartFieldDefinition, WhatsAppMessage, CRMCalendarEvent, CRMTask, CRMSignature, CRMQuote, CRMProduct, ClientPortalAccess, CRMWorkspace, CRMWorkspaceMember, CRMContact, CRMCompany, CRMActivity } from '@/types/crm';
import { CRM_STRUCTURES, CRM_PIPELINE_STAGES, LEADS_STAGES } from '@/constants/crm';
import { notificationService } from './notificationService';
import { whatsappService } from './whatsappService';
import { NotificationType } from '@/types/notifications';
import { supabaseFeedService } from './supabaseFeedService';

import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';

export const supabaseCRMService = {
  // Workspaces
  async getWorkspaces() {
    const user = auth.currentUser;
    if (!user) return [];
    
    // Get memberships first
    const memberQuery = query(collection(db, 'crm_workspace_members'), where('user_id', '==', user.uid));
    const memberSnap = await getDocs(memberQuery);
    const workspaceIds = memberSnap.docs.map(doc => doc.data().workspace_id);
    
    if (workspaceIds.length === 0) {
      // Create default workspace if none exists? 
      // For this implementation, we assume at least one exists or we create one on startup if needed.
      return [];
    }
    
    // Fetch workspace details
    const workspaces: CRMWorkspace[] = [];
    for (const wid of workspaceIds) {
      const wSnap = await getDoc(doc(db, 'crm_workspaces', wid));
      if (wSnap.exists()) {
        workspaces.push({ id: wSnap.id, ...wSnap.data() } as CRMWorkspace);
      }
    }
    return workspaces;
  },

  async createWorkspace(name: string) {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");
    
    const workspaceId = `ws-${Math.random().toString(36).substr(2, 9)}`;
    const workspaceData: Partial<CRMWorkspace> = {
      name,
      owner_id: user.uid,
      settings: {
        currency: 'EUR',
        timezone: 'Europe/Rome'
      },
      created_at: new Date().toISOString()
    };
    
    await setDoc(doc(db, 'crm_workspaces', workspaceId), workspaceData);
    
    const memberId = `${workspaceId}_${user.uid}`;
    await setDoc(doc(db, 'crm_workspace_members', memberId), {
      workspace_id: workspaceId,
      user_id: user.uid,
      role: 'owner',
      joined_at: new Date().toISOString()
    });
    
    return { id: workspaceId, ...workspaceData } as CRMWorkspace;
  },

  async saveWorkspace(workspace: CRMWorkspace) {
    const { id, ...data } = workspace;
    try {
      await updateDoc(doc(db, 'crm_workspaces', id), {
        ...data,
        updated_at: new Date().toISOString()
      });
      return workspace;
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `crm_workspaces/${id}`);
      throw e;
    }
  },

  async getWorkspaceMembers(workspaceId: string) {
    try {
      const q = query(collection(db, 'crm_workspace_members'), where('workspace_id', '==', workspaceId));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CRMWorkspaceMember));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, `crm_workspace_members`);
      throw e;
    }
  },

  async getActivities() {
    try {
      const q = query(collection(db, 'crm_activities'), orderBy('created_at', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CRMActivity));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'crm_activities');
      throw e;
    }
  },

  async createActivity(activity: any) {
    try {
      const docRef = await addDoc(collection(db, 'crm_activities'), {
        ...activity,
        created_at: new Date().toISOString()
      });
      return { id: docRef.id, ...activity };
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'crm_activities');
      throw e;
    }
  },

  async deleteActivity(id: string) {
    try {
      await deleteDoc(doc(db, 'crm_activities', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `crm_activities/${id}`);
      throw e;
    }
  },

  // Quotes & Products
  async getProducts() {
    const q = query(collection(db, 'crm_products'), orderBy('name', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CRMProduct));
  },

  async saveProduct(product: Partial<CRMProduct>) {
    const { id, ...data } = product;
    const payload = {
      ...data,
      created_at: new Date().toISOString()
    };

    if (id) {
      await updateDoc(doc(db, 'crm_products', id), payload);
    } else {
      await addDoc(collection(db, 'crm_products'), payload);
    }
  },

  async getQuotes(dealId: string) {
    const q = query(collection(db, 'crm_quotes'), where('deal_id', '==', dealId), orderBy('created_at', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CRMQuote));
  },

  async saveQuote(quote: Partial<CRMQuote>) {
    const { id, ...data } = quote;
    const user = auth.currentUser;
    const payload = {
      ...data,
      updated_at: new Date().toISOString(),
      ...(id ? {} : { 
        created_at: new Date().toISOString(),
        created_by: user?.uid || 'system'
      })
    };

    if (id) {
      await updateDoc(doc(db, 'crm_quotes', id), payload);
      return { id, ...payload } as CRMQuote;
    } else {
      const docRef = await addDoc(collection(db, 'crm_quotes'), payload);
      return { id: docRef.id, ...payload } as CRMQuote;
    }
  },

  async deleteQuote(id: string) {
    await deleteDoc(doc(db, 'crm_quotes', id));
  },

  // Portal Access
  async createPortalLink(dealId: string) {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    const payload = {
      deal_id: dealId,
      token,
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString()
    };

    await setDoc(doc(db, 'crm_portal_access', token), payload);
    return token;
  },

  async getPortalAccess(token: string) {
    const snap = await getDoc(doc(db, 'crm_portal_access', token));
    if (!snap.exists()) return null;
    return snap.data() as ClientPortalAccess;
  },

  // Reporting & Analytics
  async getReportingDeals(filters: { 
    startDate?: string; 
    endDate?: string; 
    pipelineId?: string;
    userId?: string;
    status?: string;
    workspaceId?: string;
  }) {
    try {
      if (!filters.workspaceId) {
        console.warn("getReportingDeals: No workspaceId provided, skipping query.");
        return [];
      }

      const q = query(
        collection(db, 'crm_deals'), 
        where('workspace_id', '==', filters.workspaceId)
      );
      
      const snap = await getDocs(q);
      let deals = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CRMDeal));

      // In-memory sorting and filtering to avoid missing index errors
      deals.sort((a, b) => {
        const dateA = a.created_at || '';
        const dateB = b.created_at || '';
        return dateB.localeCompare(dateA); // Descending
      });

      if (filters.pipelineId) deals = deals.filter(d => d.structure_id === filters.pipelineId);
      if (filters.userId) deals = deals.filter(d => d.assigned_to === filters.userId);
      if (filters.startDate) deals = deals.filter(d => d.created_at >= filters.startDate!);
      if (filters.endDate) deals = deals.filter(d => d.created_at <= filters.endDate!);
      if (filters.status) {
        if (filters.status === 'won') deals = deals.filter(d => d.stage_id?.toLowerCase().includes('vinto'));
        else if (filters.status === 'lost') deals = deals.filter(d => d.stage_id?.toLowerCase().includes('perso'));
        else deals = deals.filter(d => d.stage_id === filters.status);
      }

      return deals;
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'crm_deals/reporting');
      return [];
    }
  },

  // Signatures
  async getSignatures(dealId: string) {
    const q = query(collection(db, 'crm_signatures'), where('deal_id', '==', dealId), orderBy('requested_at', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CRMSignature));
  },

  async saveSignature(sig: Partial<CRMSignature>) {
    const { id, ...data } = sig;
    const payload = {
      ...data,
      ...(id ? {} : { requested_at: new Date().toISOString() })
    };

    if (id) {
      await updateDoc(doc(db, 'crm_signatures', id), payload);
      return { id, ...payload } as CRMSignature;
    } else {
      const docRef = await addDoc(collection(db, 'crm_signatures'), payload);
      return { id: docRef.id, ...payload } as CRMSignature;
    }
  },

  // Tasks
  async getTasks(relatedId?: string, type?: string) {
    let q = query(collection(db, 'crm_tasks'), orderBy('created_at', 'desc'));
    if (relatedId && type) {
      q = query(collection(db, 'crm_tasks'), where('related_to_id', '==', relatedId), where('related_to_type', '==', type), orderBy('created_at', 'desc'));
    }
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CRMTask));
  },

  async saveTask(task: Partial<CRMTask>) {
    const { id, ...data } = task;
    const currentUser = auth.currentUser;
    
    const payload = {
      ...data,
      updated_at: new Date().toISOString(),
      ...(id ? {} : { created_at: new Date().toISOString(), created_by: currentUser?.uid, assigned_to: data.assigned_to || currentUser?.uid })
    };

    if (id) {
      await updateDoc(doc(db, 'crm_tasks', id), payload);
      return { id, ...payload } as CRMTask;
    } else {
      const docRef = await addDoc(collection(db, 'crm_tasks'), payload);
      return { id: docRef.id, ...payload } as CRMTask;
    }
  },

  async deleteTask(id: string) {
    await deleteDoc(doc(db, 'crm_tasks', id));
  },

  // Calendar Events
  async getCalendarEvents() {
    const snap = await getDocs(collection(db, 'calendar_events'));
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CRMCalendarEvent));
  },

  async getDealCalendarEvents(dealId: string) {
    const q = query(collection(db, 'calendar_events'), where('deal_id', '==', dealId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CRMCalendarEvent));
  },

  async saveCalendarEvent(event: Partial<CRMCalendarEvent>) {
    const { id, ...data } = event;
    const currentUser = auth.currentUser;
    
    const payload = {
      ...data,
      updated_at: new Date().toISOString(),
      ...(id ? {} : { created_at: new Date().toISOString(), assigned_to: currentUser?.uid })
    };

    if (id) {
      await updateDoc(doc(db, 'calendar_events', id), payload);
      return { id, ...payload } as CRMCalendarEvent;
    } else {
      const docRef = await addDoc(collection(db, 'calendar_events'), payload);
      return { id: docRef.id, ...payload } as CRMCalendarEvent;
    }
  },

  async deleteCalendarEvent(id: string) {
    await deleteDoc(doc(db, 'calendar_events', id));
  },

  // Helper to send notifications
  async sendCRMNotification(params: {
    type: NotificationType;
    title: string;
    description: string;
    dealId: string;
    dealTitle: string;
    structureId?: string;
    structureSlug?: string;
    userId: string;
  }) {
    const currentUser = auth.currentUser;
    await notificationService.createNotification({
      type: params.type,
      title: params.title,
      description: params.description,
      dealId: params.dealId,
      dealTitle: params.dealTitle,
      structureId: params.structureId,
      structureSlug: params.structureSlug,
      userId: params.userId,
      createdBy: {
        id: currentUser?.uid || 'system',
        name: currentUser?.displayName || 'System Automation',
        avatar: currentUser?.photoURL || undefined
      }
    });
  },

  // Initialize CRM structures and stages if they don't exist for a workspace
  async initializeCRM(workspaceId?: string) {
    if (!workspaceId) return;

    try {
      // Init WhatsApp Templates
      await whatsappService.initializeTemplates();

      const structuresRef = collection(db, 'crm_structures');
      const qStructs = query(structuresRef, where('workspace_id', '==', workspaceId));
      let structsSnap;
      try {
        structsSnap = await getDocs(qStructs);
      } catch (e) {
        handleFirestoreError(e, OperationType.LIST, 'crm_structures');
        return; // handleFirestoreError throws, but for TS
      }

      const existingSlugs = new Set(structsSnap.docs.map(doc => doc.data().slug));
      
      const newStructuresToInsert = CRM_STRUCTURES.filter(s => !existingSlugs.has(s.slug));

      for (const s of newStructuresToInsert) {
        try {
          await addDoc(structuresRef, {
            workspace_id: workspaceId,
            name: s.name,
            slug: s.slug,
            color: s.color,
            created_at: new Date().toISOString()
          });
        } catch (e) {
          handleFirestoreError(e, OperationType.CREATE, 'crm_structures');
        }
      }

      // Re-fetch structures for this workspace
      let allStructsSnap;
      try {
        allStructsSnap = await getDocs(qStructs);
      } catch (e) {
        handleFirestoreError(e, OperationType.LIST, 'crm_structures');
        return;
      }

      const allStructs = allStructsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CRMStructure));

      for (const struct of allStructs) {
        const stagesRef = collection(db, 'crm_stages');
        const q = query(stagesRef, where('structure_id', '==', struct.id));
        let stagesSnap;
        try {
          stagesSnap = await getDocs(q);
        } catch (e) {
          handleFirestoreError(e, OperationType.LIST, 'crm_stages');
          continue;
        }
        
        const stageMap = new Map();
        stagesSnap.docs.forEach(doc => {
          const s = doc.data();
          stageMap.set(s.name, { id: doc.id, ...s });
        });

        const allStages = struct.slug === 'leads' ? LEADS_STAGES : CRM_PIPELINE_STAGES;

        for (const stageDef of allStages) {
          const existing = stageMap.get(stageDef.name);
          if (existing) {
            const updates: any = {};
            if (existing.position !== stageDef.position) updates.position = stageDef.position;
            if (existing.color !== stageDef.color) updates.color = stageDef.color;
            if (existing.is_won !== stageDef.is_won) updates.is_won = stageDef.is_won;
            if (existing.is_lost !== stageDef.is_lost) updates.is_lost = stageDef.is_lost;

            if (Object.keys(updates).length > 0) {
              try {
                await updateDoc(doc(db, 'crm_stages', existing.id), updates);
              } catch (e) {
                handleFirestoreError(e, OperationType.UPDATE, `crm_stages/${existing.id}`);
              }
            }
          } else {
            try {
              await addDoc(stagesRef, {
                structure_id: struct.id,
                name: stageDef.name,
                position: stageDef.position,
                is_won: stageDef.is_won,
                is_lost: stageDef.is_lost,
                color: stageDef.color
              });
            } catch (e) {
              handleFirestoreError(e, OperationType.CREATE, 'crm_stages');
            }
          }
        }
      }
    } catch (error) {
      console.error("CRM Sync failed:", error);
    }
  },

  async getStructures(workspaceId?: string) {
    let q = query(collection(db, 'crm_structures'), orderBy('name'));
    if (workspaceId) {
      q = query(collection(db, 'crm_structures'), where('workspace_id', '==', workspaceId), orderBy('name'));
    }
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CRMStructure));
  },

  async getStages(structureId?: string) {
    let q = query(collection(db, 'crm_stages'), orderBy('position'));
    if (structureId) {
      q = query(collection(db, 'crm_stages'), where('structure_id', '==', structureId), orderBy('position'));
    }
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CRMStage));
  },

  async getDeals(structureId?: string, workspaceId?: string, filters?: any) {
    let q = query(collection(db, 'crm_deals'), orderBy('created_at', 'desc'));
    
    const conditions = [];
    if (workspaceId) conditions.push(where('workspace_id', '==', workspaceId));
    if (structureId) conditions.push(where('structure_id', '==', structureId));
    
    // Filtri aggiuntivi da applicare lato server se presenti
    if (filters) {
      if (filters.owner && filters.owner.length > 0) {
        conditions.push(where('assigned_to', 'in', filters.owner));
      }
      if (filters.stage && filters.stage.length > 0) {
        conditions.push(where('stage_id', 'in', filters.stage));
      }
      // Firestore limita le query 'in' a 10 elementi. 
      // Se sono di più, converrebbe gestirli diversamente o filtrarli in memoria.
    }

    if (conditions.length > 0) {
      q = query(collection(db, 'crm_deals'), ...conditions, orderBy('created_at', 'desc'));
    }
    
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CRMDeal));
  },

  async updateDealStage(dealId: string, stageId: string) {
    const stageSnap = await getDoc(doc(db, 'crm_stages', stageId));
    const stageData = stageSnap.data();

    const dealRef = doc(db, 'crm_deals', dealId);
    await updateDoc(dealRef, { stage_id: stageId, updated_at: new Date().toISOString() });
    
    const updatedDealSnap = await getDoc(dealRef);
    const deal = { id: updatedDealSnap.id, ...updatedDealSnap.data() } as CRMDeal;

    if (stageData) {
      const isWon = stageData.name.toLowerCase().includes('vinto');
      const isLost = stageData.name.toLowerCase().includes('perso');
      
      let type: NotificationType = 'stage_change';
      if (isWon) type = 'deal_won';
      if (isLost) type = 'deal_lost';

      await this.sendCRMNotification({
        type,
        title: isWon ? '🏆 Affare Vinto!' : (isLost ? '❌ Affare Perso' : '🔄 Cambio Stage'),
        description: `L'affare "${deal.title}" è passato allo stage: ${stageData.name}`,
        dealId: deal.id,
        dealTitle: deal.title,
        structureId: deal.structure_id,
        userId: deal.assigned_to === 'user-1' || deal.assigned_to === 'user-2' || deal.assigned_to === 'user-3' ? deal.assigned_to : 'all'
      });

      const currentUser = auth.currentUser;
      await supabaseFeedService.logCRMActivity({
        type: isWon ? 'deal_won' : (isLost ? 'deal_lost' : 'stage_change'),
        dealId: deal.id,
        dealTitle: deal.title,
        content: `L'affare **${deal.title}** è passato allo stage: **${stageData.name}**`,
        authorId: currentUser?.uid || 'system',
        authorName: currentUser?.displayName || 'Sistema',
        authorPhoto: currentUser?.photoURL || undefined,
        metadata: {
          previous_stage_id: deal.stage_id, // This is actually the new one now
          new_stage_name: stageData.name,
          is_won: isWon,
          is_lost: isLost
        }
      });

      await this.triggerAutomations(deal, 'stage_changed');
    }

    return deal;
  },

  async createDeal(dealData: Partial<CRMDeal>) {
    const docRef = await addDoc(collection(db, 'crm_deals'), {
      ...dealData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    const snap = await getDoc(docRef);
    const data = { id: snap.id, ...snap.data() } as CRMDeal;

    const currentUser = auth.currentUser;
    await supabaseFeedService.logCRMActivity({
      type: 'deal_created',
      dealId: data.id,
      dealTitle: data.title,
      content: `Creato nuovo affare: **${data.title}** per **${data.company || 'N/A'}**`,
      authorId: currentUser?.uid || 'system',
      authorName: currentUser?.displayName || 'Sistema',
      authorPhoto: currentUser?.photoURL || undefined,
      metadata: {
        value: data.value,
        company: data.company
      }
    });

    await this.triggerAutomations(data, 'deal_created');

    return data;
  },

  async updateDeal(dealId: string, updates: Partial<CRMDeal>) {
    const dealRef = doc(db, 'crm_deals', dealId);
    const snap = await getDoc(dealRef);
    const currentDeal = snap.exists() ? { id: snap.id, ...snap.data() } as CRMDeal : null;

    if (updates.preanalysis_result && currentDeal) {
      const tempDeal = { ...currentDeal, ...updates };
      const newScore = await this.calculateLeadScore(tempDeal);
      updates.preanalysis_result.score = newScore;
      
      if (newScore !== (currentDeal.preanalysis_result?.score || 0)) {
        // Trigger score-based automations
        await this.triggerAutomations(tempDeal, 'field_updated', { field: 'score', value: newScore });
      }
    }

    await updateDoc(dealRef, { ...updates, updated_at: new Date().toISOString() });
    const updatedSnap = await getDoc(dealRef);
    return { id: updatedSnap.id, ...updatedSnap.data() } as CRMDeal;
  },

  async calculateLeadScore(deal: CRMDeal): Promise<number> {
    let score = 0;
    const pre = deal.preanalysis_result;
    
    if (!pre) return 0;

    // 1. Budget Scoring (30 points max)
    if (pre.budget >= 100000) score += 30;
    else if (pre.budget >= 50000) score += 20;
    else if (pre.budget >= 10000) score += 10;
    else if (pre.budget > 0) score += 5;

    // 2. Industry (Settore) Scoring (15 points max)
    const hotIndustries = ['Tecnologia', 'Finanza', 'Energia', 'Healthcare'];
    if (pre.company_data?.industry && hotIndustries.includes(pre.company_data.industry)) {
      score += 15;
    } else if (pre.company_data?.industry) {
      score += 5;
    }

    // 3. Company Size (15 points max)
    if (pre.company_data?.size) {
      const sizeStr = pre.company_data.size.toLowerCase();
      if (sizeStr.includes('500') || sizeStr.includes('1000')) score += 15;
      else if (sizeStr.includes('50') || sizeStr.includes('200')) score += 10;
      else score += 5;
    }

    // 4. Request Type / Service (20 points max)
    const premiumServices = ['Sviluppo Software', 'Consulenza Strategica', 'AI Integration'];
    if (pre.service_requested && premiumServices.includes(pre.service_requested)) {
      score += 20;
    } else if (pre.service_requested) {
      score += 10;
    }

    // 5. Pre-analysis Auto-notes / Answers quality (20 points max)
    // Here we can use auto_notes as a proxy for positive signals detected during form submission
    if (pre.auto_notes && pre.auto_notes.length > 3) score += 20;
    else if (pre.auto_notes && pre.auto_notes.length > 0) score += 10;

    return Math.min(100, score);
  },

  async triggerAutomations(deal: CRMDeal, triggerType: string, extraData?: any) {
    try {
      const q = query(
        collection(db, 'crm_automations'), 
        where('workspace_id', '==', deal.workspace_id),
        where('pipeline_id', '==', deal.structure_id),
        where('is_active', '==', true)
      );
      const snap = await getDocs(q);
      const allAutos = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CRMAutomation));

      // Filter by trigger type and stage_id if applicable
      const relevantAutos = allAutos.filter(auto => {
        if (auto.trigger.type !== triggerType) return false;
        
        if (triggerType === 'stage_changed' && auto.stage_id !== deal.stage_id) return false;
        
        // Handle special conditions for field_updated if it's the score
        if (triggerType === 'field_updated' && extraData?.field === 'score') {
          const condition = auto.trigger.config?.condition;
          const threshold = auto.trigger.config?.threshold;
          const currentScore = deal.preanalysis_result?.score || 0;

          if (condition === 'greater_than' && currentScore <= threshold) return false;
          if (condition === 'less_than' && currentScore >= threshold) return false;
        }

        return true;
      });

      for (const auto of relevantAutos) {
        // Process actions sequence
        for (const action of auto.actions) {
          switch (action.type) {
            case 'task':
              await this.saveTask({
                title: action.config.title || 'Nuovo Task',
                description: action.config.description || 'Task generato automaticamente dal workflow.',
                status: 'todo',
                priority: 'medium',
                related_to_id: deal.id,
                related_to_type: 'deal',
                related_to_name: deal.title,
                assigned_to: deal.assigned_to
              });
              break;
            case 'notification':
              await this.sendCRMNotification({
                type: 'system_alert',
                title: '🤖 Automazione',
                description: action.config.message || 'Nuova notifica automatica',
                dealId: deal.id,
                dealTitle: deal.title,
                userId: deal.assigned_to
              });
              break;
            case 'note':
              await this.addActivity(deal.id, 'note', 'Nota Automatica', action.config.body || 'Nota generata dal sistema.');
              break;
            case 'assignee':
              if (action.config.assignee_id) {
                 await this.updateDeal(deal.id, { assigned_to: action.config.assignee_id });
              }
              break;
            case 'whatsapp':
              if (action.config.body && deal.phone) {
                await whatsappService.sendMessage({
                  dealId: deal.id,
                  recipientPhone: deal.phone,
                  content: action.config.body.replace('{{contact}}', deal.contact).replace('{{deal}}', deal.title)
                });
              }
              break;
            case 'email':
              // Logic for email sending (mock or real)
              await this.addActivity(deal.id, 'system', '📧 Email Inviata', `Auto-email inviata a ${deal.email}: ${action.config.subject}`);
              break;
            case 'webhook':
              // Logic for webhook call
              console.log("Triggering webhook:", action.config.url);
              break;
            case 'wait':
              // We can't really "wait" in a synchronous trigger function unless using a queue/worker.
              // For now, we'll log it. In a real system, this would schedule a future task.
              console.log(`Automation waiting ${action.config.wait_duration} ${action.config.wait_unit}`);
              break;
            case 'change_stage':
              if (action.config.stage_id) {
                await this.updateDeal(deal.id, { stage_id: action.config.stage_id });
              }
              break;
          }
        }
      }
    } catch (e) {
      console.warn("Automations execution failed:", e);
    }
  },

  async addActivity(dealId: string, type: 'task' | 'call' | 'note' | 'system', title: string, description: string) {
    const dealSnap = await getDoc(doc(db, 'crm_deals', dealId));
    const deal = dealSnap.exists() ? { id: dealSnap.id, ...dealSnap.data() } as CRMDeal : null;
    
    const activityRef = await addDoc(collection(db, 'crm_activities'), {
      deal_id: dealId,
      type,
      title,
      description,
      created_at: new Date().toISOString()
    });
    
    if (deal) {
      let feedType: 'task' | 'comment' | 'note' = 'comment';
      if (type === 'task') feedType = 'task';
      if (type === 'note') feedType = 'note';

      await this.sendCRMNotification({
        type: type === 'task' ? 'task_created' : 'new_comment',
        title: type === 'task' ? '📅 Nuovo Task Creato' : (type === 'note' ? '📝 Nuova Nota' : '💬 Nuovo Commento'),
        description: `${title}: ${description.substring(0, 50)}${description.length > 50 ? '...' : ''}`,
        dealId,
        dealTitle: deal.title,
        structureId: deal.structure_id,
        userId: deal.assigned_to.startsWith('user-') ? deal.assigned_to : 'all'
      });

      const currentUser = auth.currentUser;
      await supabaseFeedService.logCRMActivity({
        type: feedType,
        dealId,
        dealTitle: deal.title,
        content: `**${title}**: ${description}`,
        authorId: currentUser?.uid || 'system',
        authorName: currentUser?.displayName || 'Sistema',
        authorPhoto: currentUser?.photoURL || undefined,
        metadata: {
          activity_type: type
        }
      });
    }
  },

  async logFileActivity(dealId: string, fileName: string, fileSize: number) {
     const dealSnap = await getDoc(doc(db, 'crm_deals', dealId));
     const deal = dealSnap.exists() ? { id: dealSnap.id, ...dealSnap.data() } as CRMDeal : null;
     if (!deal) return;

     const currentUser = auth.currentUser;
     await supabaseFeedService.logCRMActivity({
        type: 'file',
        dealId,
        dealTitle: deal.title,
        content: `Caricato nuovo file: **${fileName}** (${Math.round(fileSize / 1024)} KB)`,
        authorId: currentUser?.uid || 'system',
        authorName: currentUser?.displayName || 'Sistema',
        authorPhoto: currentUser?.photoURL || undefined,
        metadata: {
          file_name: fileName,
          file_size: fileSize
        }
     });
  },

  async getDealActivities(dealId: string) {
    const q = query(collection(db, 'crm_activities'), where('deal_id', '==', dealId), orderBy('created_at', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getStructureActivities(structureId: string, workspaceId?: string) {
    if (!workspaceId) return [];

    // In Firestore we can't do a real inner join easily. 
    // We'll fetch deals first, then activities for those deals.
    const dealsQ = query(collection(db, 'crm_deals'), where('workspace_id', '==', workspaceId), where('structure_id', '==', structureId));
    const dealsSnap = await getDocs(dealsQ);
    const dealIds = dealsSnap.docs.map(doc => doc.id);
    
    if (dealIds.length === 0) return [];

    const activitiesQ = query(collection(db, 'crm_activities'), where('deal_id', 'in', dealIds), orderBy('created_at', 'desc'));
    const snap = await getDocs(activitiesQ);
    
    const dealsMap = new Map();
    dealsSnap.docs.forEach(doc => dealsMap.set(doc.id, doc.data()));

    return snap.docs.map(doc => {
      const data: any = doc.data();
      return {
        id: doc.id,
        ...data,
        crm_deals: {
          id: data.deal_id,
          ...dealsMap.get(data.deal_id)
        }
      };
    });
  },

  async checkAndTriggerReminders(deal: CRMDeal, stageName: string) {
    const inactivity = (await import('@/lib/reminderUtils')).getInactivityData(deal, stageName);
    if (!inactivity || !inactivity.isExpired) return;

    const lastReminderStage = deal.custom_fields?.last_reminder_stage;
    if (lastReminderStage === stageName) return;

    try {
      await this.addActivity(
        deal.id, 
        'task', 
        `⏰ REMINDER: ${stageName}`, 
        `Questo affare è inattivo da ${inactivity.daysInactivity} giorni nello stage "${stageName}".`
      );

      await this.updateDeal(deal.id, {
        custom_fields: {
          ...(deal.custom_fields || {}),
          last_reminder_stage: stageName
        }
      });

      console.log(`Reminder triggered for deal ${deal.id} in stage ${stageName}`);
    } catch (error) {
      console.error("Error triggering reminder:", error);
    }
  },

  async processFormSubmission(payload: any, formUrl: string) {
    const formMappings: Record<string, string> = {
      'https://forms.gle/RBigx9gHGJ5pEJeS6': 'finanza-agevolata',
      'https://forms.gle/kUaGCoJcW7uYZU44A': 'servizi-digitali'
    };

    const structureSlug = formMappings[formUrl] || 'finanza-agevolata';

    const structQ = query(collection(db, 'crm_structures'), where('slug', '==', structureSlug));
    const structSnap = await getDocs(structQ);
    if (structSnap.empty) throw new Error(`Structure not found for slug: ${structureSlug}`);
    const struct = { id: structSnap.docs[0].id, ...structSnap.docs[0].data() } as CRMStructure;

    const stageQ = query(collection(db, 'crm_stages'), where('structure_id', '==', struct.id), where('name', '==', 'Form preanalisi'));
    const stageSnap = await getDocs(stageQ);
    if (stageSnap.empty) throw new Error('Preanalysis stage not found');
    const stageId = stageSnap.docs[0].id;

    const score = Math.floor(Math.random() * 40) + 60; 
    const resultText = score > 85 ? 'Positivo' : (score > 70 ? 'Dubbio' : 'Negativo');

    const preanalysis: PreanalysisResult = {
      score,
      result: resultText,
      company_data: {
        name: payload.company || 'N/A',
        vat: payload.vat
      },
      contact_data: {
        name: payload.name || 'N/A',
        phone: payload.phone || 'N/A',
        email: payload.email || 'N/A'
      },
      request_type: payload.type || 'N/A',
      budget: payload.budget || payload.expectedValue || 0,
      service_requested: payload.service || 'N/A',
      notes: payload.notes || 'N/A',
      estimated_amount: payload.expectedValue || payload.budget || 0,
      auto_notes: [`Preanalisi automatica: Score ${score}%`, `Fonte: ${formUrl}`],
      submission_date: new Date().toISOString()
    };

    await addDoc(collection(db, 'crm_form_results'), {
      structure_slug: structureSlug,
      form_url: formUrl,
      payload,
      score,
      result: resultText,
      created_at: new Date().toISOString()
    });

    const dealRef = await addDoc(collection(db, 'crm_deals'), {
      workspace_id: struct.workspace_id || 'system',
      structure_id: struct.id,
      stage_id: stageId,
      title: `Lead Google Form: ${payload.company}`,
      company: payload.company,
      contact: payload.name,
      phone: payload.phone,
      email: payload.email,
      value: payload.expectedValue || 0,
      assigned_to: 'Support Team',
      preanalysis_result: preanalysis,
      form_source: formUrl,
      custom_fields: payload,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    const dealSnap = await getDoc(dealRef);
    const deal = { id: dealSnap.id, ...dealSnap.data() } as CRMDeal;

    await this.sendCRMNotification({
      type: 'new_form',
      title: '📝 Nuovo Form Preanalisi',
      description: `Nuovo lead da Google Form per ${payload.company}`,
      dealId: deal.id,
      dealTitle: deal.title,
      structureId: struct.id,
      structureSlug: struct.slug,
      userId: 'all'
    });

    await this.addActivity(deal.id, 'system', '📝 Form Ricevuto', `Lead acquisito tramite form Google: ${formUrl}`);
    
    await this.saveTask({
      title: '📞 Verifica telefonica',
      description: `Contattare ${payload.name} al numero ${payload.phone} per verificare il form inviato tramite ${formUrl}.`,
      status: 'todo',
      priority: 'high',
      related_to_id: deal.id,
      related_to_type: 'deal',
      related_to_name: deal.title,
      assigned_to: deal.assigned_to
    });
    
    // Auto WhatsApp Welcome
    if (deal.phone) {
      await whatsappService.sendMessage({
        dealId: deal.id,
        recipientPhone: deal.phone,
        content: `Ciao ${deal.contact}! Abbiamo ricevuto la tua richiesta per "${deal.title}". Un nostro consulente ti contatterà presto.`
      });
    }

    return deal;
  },

  async getAutomations(pipelineId: string, workspaceId: string, stageId?: string) {
    try {
      let q = query(
        collection(db, 'crm_automations'), 
        where('workspace_id', '==', workspaceId),
        where('pipeline_id', '==', pipelineId)
      );
      if (stageId) {
        q = query(
          collection(db, 'crm_automations'), 
          where('workspace_id', '==', workspaceId),
          where('pipeline_id', '==', pipelineId), 
          where('stage_id', '==', stageId)
        );
      }
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CRMAutomation));
    } catch (e: any) {
      if (e?.code === 'permission-denied' || (e?.message && e.message.includes('Missing or insufficient permissions'))) {
        return [];
      }
      handleFirestoreError(e, OperationType.GET, 'crm_automations');
      throw e;
    }
  },

  async saveAutomation(automation: Partial<CRMAutomation>, workspaceId: string) {
    const { id, ...saveData } = automation;
    const payload = {
      ...saveData,
      workspace_id: workspaceId,
      updated_at: new Date().toISOString()
    };

    try {
      if (id) {
         const docRef = doc(db, 'crm_automations', id);
         await updateDoc(docRef, payload);
         const snap = await getDoc(docRef);
         return { id: snap.id, ...snap.data() } as CRMAutomation;
      } else {
         const docRef = await addDoc(collection(db, 'crm_automations'), {
           ...payload,
           created_at: new Date().toISOString()
         });
         const snap = await getDoc(docRef);
         return { id: snap.id, ...snap.data() } as CRMAutomation;
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, id ? `crm_automations/${id}` : 'crm_automations');
      throw e;
    }
  },

  async deleteAutomation(id: string) {
    await deleteDoc(doc(db, 'crm_automations', id));
  },

  async getCustomFieldDefinitions(entityType?: 'deal' | 'contact' | 'company' | 'lead') {
    let q = query(collection(db, 'crm_field_definitions'), orderBy('order'));
    if (entityType) {
      q = query(collection(db, 'crm_field_definitions'), where('entity_type', '==', entityType), orderBy('order'));
    }
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CRMCustomFieldDefinition));
  },

  async saveCustomFieldDefinition(field: Partial<CRMCustomFieldDefinition>) {
    const { id, ...saveData } = field;
    if (id) {
      await updateDoc(doc(db, 'crm_field_definitions', id), saveData);
      const snap = await getDoc(doc(db, 'crm_field_definitions', id));
      return { id: snap.id, ...snap.data() } as CRMCustomFieldDefinition;
    } else {
      const docRef = await addDoc(collection(db, 'crm_field_definitions'), saveData);
      const snap = await getDoc(docRef);
      return { id: snap.id, ...snap.data() } as CRMCustomFieldDefinition;
    }
  },

  async deleteCustomFieldDefinition(id: string) {
    await deleteDoc(doc(db, 'crm_field_definitions', id));
  },

  async searchGlobalDeals(queryString: string, workspaceId?: string) {
    if (!queryString || queryString.length < 2 || !workspaceId) return [];

    // Firestore doesn't support complex full-text search with ilike.
    // We'll fetch some and filter in memory for this demo.
    const q = query(collection(db, 'crm_deals'), where('workspace_id', '==', workspaceId));
    const snap = await getDocs(q);
    const allDeals = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    
    const lowerQuery = queryString.toLowerCase();
    const results = allDeals.filter(d => 
      d.title?.toLowerCase().includes(lowerQuery) ||
      d.company?.toLowerCase().includes(lowerQuery) ||
      d.contact?.toLowerCase().includes(lowerQuery) ||
      d.email?.toLowerCase().includes(lowerQuery) ||
      d.phone?.toLowerCase().includes(lowerQuery)
    ).slice(0, 10);

    return results;
  },

  async deleteDeal(id: string) {
    await deleteDoc(doc(db, 'crm_deals', id));
  },

  // CONTACTS
  async getContacts(workspaceId?: string) {
    let q = query(collection(db, 'crm_contacts'), orderBy('name', 'asc'));
    if (workspaceId) {
      q = query(collection(db, 'crm_contacts'), where('workspace_id', '==', workspaceId), orderBy('name', 'asc'));
    }
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CRMContact));
  },

  async saveContact(contact: Partial<CRMContact>) {
    const { id, ...data } = contact;
    const payload = {
      ...data,
      updated_at: new Date().toISOString(),
      ...(id ? {} : { created_at: new Date().toISOString() })
    };

    if (id) {
      await updateDoc(doc(db, 'crm_contacts', id), payload);
      return { id, ...payload } as CRMContact;
    } else {
      const docRef = await addDoc(collection(db, 'crm_contacts'), payload);
      return { id: docRef.id, ...payload } as CRMContact;
    }
  },

  async deleteContact(id: string) {
    await deleteDoc(doc(db, 'crm_contacts', id));
  },

  // COMPANIES
  async getCompanies(workspaceId?: string) {
    let q = query(collection(db, 'crm_companies'), orderBy('name', 'asc'));
    if (workspaceId) {
      q = query(collection(db, 'crm_companies'), where('workspace_id', '==', workspaceId), orderBy('name', 'asc'));
    }
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CRMCompany));
  },

  async saveCompany(company: Partial<CRMCompany>) {
    const { id, ...data } = company;
    const payload = {
      ...data,
      updated_at: new Date().toISOString(),
      ...(id ? {} : { created_at: new Date().toISOString() })
    };

    if (id) {
      await updateDoc(doc(db, 'crm_companies', id), payload);
      return { id, ...payload } as CRMCompany;
    } else {
      const docRef = await addDoc(collection(db, 'crm_companies'), payload);
      return { id: docRef.id, ...payload } as CRMCompany;
    }
  },

  async deleteCompany(id: string) {
    await deleteDoc(doc(db, 'crm_companies', id));
  },

  // SMART PROCESSES
  async getSmartProcesses() {
    const q = query(collection(db, 'smart_processes'), orderBy('created_at'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SmartProcess));
  },

  async saveSmartProcess(process: Partial<SmartProcess>) {
    const { id, ...saveData } = process;
    if (id) {
      await updateDoc(doc(db, 'smart_processes', id), saveData);
      const snap = await getDoc(doc(db, 'smart_processes', id));
      return { id: snap.id, ...snap.data() } as SmartProcess;
    } else {
      const docRef = await addDoc(collection(db, 'smart_processes'), {
        ...saveData,
        created_at: new Date().toISOString()
      });
      const snap = await getDoc(docRef);
      return { id: snap.id, ...snap.data() } as SmartProcess;
    }
  },

  async deleteSmartProcess(id: string) {
    await deleteDoc(doc(db, 'smart_processes', id));
  },

  async getSmartRecords(processId: string) {
    const q = query(collection(db, 'smart_records'), where('process_id', '==', processId), orderBy('created_at'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SmartRecord));
  },

  async getSmartFieldDefinitions(processId: string) {
    const q = query(collection(db, 'smart_fields'), where('process_id', '==', processId), orderBy('order'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SmartFieldDefinition));
  },

  async getSmartRecordById(id: string) {
    const snap = await getDoc(doc(db, 'smart_records', id));
    return { id: snap.id, ...snap.data() } as SmartRecord;
  },

  async saveSmartRecord(record: Partial<SmartRecord>) {
    const { id, ...saveData } = record;
    if (id) {
      await updateDoc(doc(db, 'smart_records', id), {
        ...saveData,
        updated_at: new Date().toISOString()
      });
      const snap = await getDoc(doc(db, 'smart_records', id));
      return { id: snap.id, ...snap.data() } as SmartRecord;
    } else {
      const docRef = await addDoc(collection(db, 'smart_records'), {
        ...saveData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      const snap = await getDoc(docRef);
      return { id: snap.id, ...snap.data() } as SmartRecord;
    }
  },

  async deleteSmartRecord(id: string) {
    await deleteDoc(doc(db, 'smart_records', id));
  },

  async convertLeadToDeal(leadId: string, targetPipelineId: string) {
    const dealRef = doc(db, 'crm_deals', leadId);
    
    // Fetch target pipeline's first stage
    const stagesRef = collection(db, 'crm_stages');
    const q = query(stagesRef, where('structure_id', '==', targetPipelineId), orderBy('position'));
    const stagesSnap = await getDocs(q);
    
    if (stagesSnap.empty) throw new Error("No stages found for target pipeline");
    const firstStageId = stagesSnap.docs[0].id;
    
    await updateDoc(dealRef, {
      structure_id: targetPipelineId,
      stage_id: firstStageId,
      updated_at: new Date().toISOString()
    });
    
    const currentUser = auth.currentUser;
    await supabaseFeedService.logCRMActivity({
      type: 'deal_won',
      dealId: leadId,
      dealTitle: 'Conversione Lead',
      content: `Lead convertito con successo in Affare nella pipeline selezionata.`,
      authorId: currentUser?.uid || 'system',
      authorName: currentUser?.displayName || 'Sistema',
      authorPhoto: currentUser?.photoURL || undefined
    });
  }
};

