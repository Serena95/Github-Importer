import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  query, 
  where,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CRM_PIPELINES, DEFAULT_STAGES } from '@/constants/crm';
import { Pipeline, Deal } from '@/types';

export const initializePipelines = async (tenantId: string) => {
  const pipelinesRef = collection(db, 'tenants', tenantId, 'pipelines');
  const snap = await getDocs(pipelinesRef);
  
  if (snap.empty) {
    for (const p of CRM_PIPELINES) {
      await setDoc(doc(pipelinesRef, p.id), {
        id: p.id,
        tenantId,
        name: p.name,
        stages: DEFAULT_STAGES,
        createdAt: new Date().toISOString()
      });
    }
  }
};

export const getPipelineCounts = (tenantId: string, callback: (counts: Record<string, number>) => void) => {
  const dealsRef = collection(db, 'tenants', tenantId, 'deals');
  
  return onSnapshot(dealsRef, (snap) => {
    const counts: Record<string, number> = {};
    CRM_PIPELINES.forEach(p => counts[p.id] = 0);
    
    snap.docs.forEach(doc => {
      const deal = doc.data() as Deal;
      if (deal.pipelineId && counts[deal.pipelineId] !== undefined) {
        // Count only "pending" deals (not won/lost if we want Bitrix style)
        // For now let's count all active deals in the pipeline
        if (deal.stageId !== 'won' && deal.stageId !== 'lost') {
          counts[deal.pipelineId]++;
        }
      }
    });
    
    callback(counts);
  });
};
