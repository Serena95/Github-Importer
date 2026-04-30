import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { WhatsAppMessage, WhatsAppTemplate } from '@/types/crm';

export const whatsappService = {
  async getMessages(dealId: string) {
    const q = query(
      collection(db, 'whatsapp_messages'),
      where('deal_id', '==', dealId),
      orderBy('created_at', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as WhatsAppMessage));
  },

  subscribeToMessages(dealId: string, callback: (messages: WhatsAppMessage[]) => void) {
    const q = query(
      collection(db, 'whatsapp_messages'),
      where('deal_id', '==', dealId),
      orderBy('created_at', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WhatsAppMessage));
      callback(messages);
    });
  },

  async sendMessage(params: {
    dealId: string;
    recipientPhone: string;
    content: string;
    type?: WhatsAppMessage['type'];
    fileUrl?: string;
    fileName?: string;
    templateId?: string;
  }) {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Not authenticated');

    const messageData: Omit<WhatsAppMessage, 'id'> = {
      deal_id: params.dealId,
      sender_id: currentUser.uid,
      sender_name: currentUser.displayName || 'User',
      recipient_phone: params.recipientPhone,
      content: params.content,
      type: params.type || 'text',
      file_url: params.fileUrl,
      file_name: params.fileName,
      status: 'sent',
      template_id: params.templateId,
      direction: 'outbound',
      created_at: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'whatsapp_messages'), messageData);
    
    // Simulate delivery
    setTimeout(async () => {
      await updateDoc(docRef, { status: 'delivered', delivered_at: new Date().toISOString() });
      
      // Simulate read after some more time
      setTimeout(async () => {
        await updateDoc(docRef, { status: 'read', read_at: new Date().toISOString() });
      }, 5000);
    }, 2000);

    return { id: docRef.id, ...messageData } as WhatsAppMessage;
  },

  async getTemplates() {
    const snap = await getDocs(collection(db, 'whatsapp_templates'));
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as WhatsAppTemplate));
  },

  async initializeTemplates() {
    try {
      const snap = await getDocs(collection(db, 'whatsapp_templates'));
      if (!snap.empty) return;

      const sampleTemplates: Omit<WhatsAppTemplate, 'id'>[] = [
        {
          name: 'welcome_message',
          category: 'MARKETING',
          language: 'it',
          body: 'Ciao {{1}}! Benvenuto in Nexus CRM. Come possiamo aiutarti oggi?',
          status: 'approved',
          created_at: new Date().toISOString()
        },
        {
          name: 'deal_update',
          category: 'UTILITY',
          language: 'it',
          body: 'Ciao! Il tuo affare {{1}} è stato aggiornato allo stato: {{2}}.',
          status: 'approved',
          created_at: new Date().toISOString()
        },
        {
          name: 'meeting_reminder',
          category: 'UTILITY',
          language: 'it',
          body: 'Promemoria: il nostro appuntamento per {{1}} è confermato per domani alle {{2}}.',
          status: 'approved',
          created_at: new Date().toISOString()
        }
      ];

      for (const t of sampleTemplates) {
        await addDoc(collection(db, 'whatsapp_templates'), t);
      }
    } catch (error) {
      console.warn("WhatsApp templates initialization skipped or failed:", error);
    }
  },

  // Simulate an incoming message
  async simulateIncoming(dealId: string, phone: string, text: string) {
    const messageData: Omit<WhatsAppMessage, 'id'> = {
      deal_id: dealId,
      sender_id: 'whatsapp_system',
      sender_name: 'Customer',
      recipient_phone: 'system_crm',
      content: text,
      type: 'text',
      status: 'read',
      direction: 'inbound',
      created_at: new Date().toISOString()
    };

    await addDoc(collection(db, 'whatsapp_messages'), messageData);
  }
};
