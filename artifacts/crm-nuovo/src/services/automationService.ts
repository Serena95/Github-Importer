import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp,
  getDocs,
  query,
  where
} from 'firebase/firestore';

export const processNewLead = async (tenantId: string, leadId: string, leadData: any) => {
  try {
    // 1. Assegnazione automatica responsabile (Round Robin o casuale per ora)
    const usersRef = collection(db, 'tenants', tenantId, 'users');
    const usersSnap = await getDocs(usersRef);
    let assignedUserId = null;
    
    if (!usersSnap.empty) {
      const users = usersSnap.docs.map(d => d.id);
      assignedUserId = users[Math.floor(Math.random() * users.length)];
      
      await updateDoc(doc(db, 'tenants', tenantId, 'leads', leadId), {
        assignedTo: assignedUserId,
        updatedAt: serverTimestamp()
      });
    }

    // 2. Notifica interna
    await addDoc(collection(db, 'tenants', tenantId, 'notifications'), {
      userId: assignedUserId || 'admin',
      title: 'Nuovo Lead Ricevuto',
      message: `Un nuovo lead è stato registrato: ${leadData.title || 'Senza titolo'}`,
      type: 'lead',
      relatedId: leadId,
      read: false,
      createdAt: serverTimestamp()
    });

    // 3. Task automatico di primo contatto
    await addDoc(collection(db, 'tenants', tenantId, 'tasks'), {
      title: `Primo contatto: ${leadData.nome || ''} ${leadData.cognome || ''}`,
      description: `Effettuare il primo contatto telefonico o via email per il lead ${leadData.title || ''}.`,
      status: 'pending',
      priority: 'high',
      assignedTo: assignedUserId || 'admin',
      relatedTo: {
        type: 'lead',
        id: leadId
      },
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // +24h
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log(`Automazioni completate per il lead ${leadId}`);
  } catch (error) {
    console.error("Errore durante l'esecuzione delle automazioni lead:", error);
  }
};

export const processNewDeal = async (tenantId: string, dealId: string, dealData: any) => {
  try {
    // Automazioni specifiche per deal
    // 1. Notifica
    await addDoc(collection(db, 'tenants', tenantId, 'notifications'), {
      userId: dealData.assignedTo || 'admin',
      title: 'Nuovo Affare Creato',
      message: `Un nuovo affare è stato creato nella pipeline: ${dealData.title}`,
      type: 'deal',
      relatedId: dealId,
      read: false,
      createdAt: serverTimestamp()
    });

    // 2. Task specifico in base alla pipeline
    let taskDescription = 'Analizzare i dettagli dell\'affare e preparare la proposta.';
    if (dealData.pipelineId === 'FINANZA_AGEVOLATA') {
      taskDescription = 'Verificare i requisiti del bando e richiedere documentazione integrativa.';
    } else if (dealData.pipelineId === 'DIGITALE') {
      taskDescription = 'Pianificare call tecnica per analisi dei requisiti digitali.';
    }

    await addDoc(collection(db, 'tenants', tenantId, 'tasks'), {
      title: `Analisi iniziale affare: ${dealData.title}`,
      description: taskDescription,
      status: 'pending',
      priority: 'medium',
      assignedTo: dealData.assignedTo || 'admin',
      relatedTo: {
        type: 'deal',
        id: dealId
      },
      dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // +48h
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

  } catch (error) {
    console.error("Errore durante l'esecuzione delle automazioni deal:", error);
  }
};
