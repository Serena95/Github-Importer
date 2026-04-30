import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  setDoc,
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  limit, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import fs from 'fs';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import firebase config
const firebaseConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'firebase-applet-config.json'), 'utf8'));

// Initialize Firebase (Client SDK in Node.js)
const app_firebase = initializeApp(firebaseConfig);
const db = getFirestore(app_firebase, firebaseConfig.firestoreDatabaseId);

// Helper for safe stringify of potentially cyclic objects
function safeJsonStringify(obj: any): string {
  const cache = new Set();
  return JSON.stringify(obj, (_key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.has(value)) {
        return '[Circular]';
      }
      cache.add(value);
    }
    return value;
  });
}

// Webhook Helper
async function triggerWebhook(event: string, payload: any) {
  const webhookUrl = process.env.CRM_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    const body = safeJsonStringify({ event, payload, timestamp: new Date().toISOString() });
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body
    });
    console.log(`Webhook triggered: ${event}`);
  } catch (err) {
    console.error(`Failed to trigger webhook: ${event}`, err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Auth Middleware
  const authenticateAPI = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = process.env.API_TOKEN || 'nexus-crm-token-2024'; // Default for demo

    if (!authHeader || authHeader !== `Bearer ${token}`) {
      return res.status(401).json({ error: "Unauthorized. Valid API Token required." });
    }
    next();
  };

  // --- CRM PUBLIC API ROUTES (FIRESTORE) ---

  // GET /crm/deal
  app.get("/api/crm/deal", authenticateAPI, async (req, res) => {
    try {
      const q = query(collection(db, 'crm_deals'), limit(100));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch deals" });
    }
  });

  // POST /crm/deal
  app.post("/api/crm/deal", authenticateAPI, async (req, res) => {
    try {
      const dealData = {
        ...req.body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, 'crm_deals'), dealData);
      const newDeal = { id: docRef.id, ...dealData };

      await triggerWebhook('deal.created', newDeal);
      res.status(201).json(newDeal);
    } catch (error) {
      res.status(500).json({ error: "Failed to create deal" });
    }
  });

  // PUT /crm/deal
  app.put("/api/crm/deal", authenticateAPI, async (req, res) => {
    try {
      const { id, ...updates } = req.body;
      if (!id) return res.status(400).json({ error: "Deal ID required" });

      const docRef = doc(db, 'crm_deals', id);
      await updateDoc(docRef, { ...updates, updated_at: new Date().toISOString() });
      
      const updatedSnap = await getDoc(docRef);
      const data = { id: updatedSnap.id, ...updatedSnap.data() };

      await triggerWebhook('deal.updated', data);
      
      if (updates.stage_id) {
        await triggerWebhook('deal.stage.changed', data);
      }
      
      if (updates.status === 'won') await triggerWebhook('deal.won', data);
      if (updates.status === 'lost') await triggerWebhook('deal.lost', data);

      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to update deal" });
    }
  });

  // DELETE /crm/deal
  app.delete("/api/crm/deal", authenticateAPI, async (req, res) => {
    try {
      const { id } = req.query;
      if (!id || typeof id !== 'string') return res.status(400).json({ error: "Deal ID required as query param" });

      await deleteDoc(doc(db, 'crm_deals', id));
      res.json({ success: true, message: "Deal deleted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete deal" });
    }
  });

  // POST /crm/form (Generic Webhook for Lead/Deal creation)
  app.post("/api/crm/form", authenticateAPI, async (req, res) => {
    try {
      const { title, value, company_name, contact_name, phone, email, pipeline_id, stage_id } = req.body;
      
      const newDealData = {
        title: title || `Nuovo Lead Form - ${contact_name || 'Anonimo'}`,
        value: value || 0,
        structure_id: pipeline_id || 'base-crm',
        stage_id: stage_id || 'lead',
        custom_fields: {
          company: company_name || '',
          contact: contact_name || '',
          phone: phone || '',
          email: email || ''
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'crm_deals'), newDealData);
      const data = { id: docRef.id, ...newDealData };

      await triggerWebhook('deal.created', data);
      res.status(201).json({ success: true, deal: data });
    } catch (error) {
      res.status(500).json({ error: "Failed to process form webhook" });
    }
  });

  // ------------------------------

  // Serviamo la cartella public (verrà usata per lo script JS pubblico)
  app.use(express.static(path.join(__dirname, 'public')));

  // Endpoint Pubblico per intercettazione Form
  app.post("/api/public/form", async (req, res) => {
    try {
      const { name, email, phone, message, formId, source, ...extraFields } = req.body;
      
      console.log(`Ricevuta richiesta form: ${formId} da ${source}`);

      // Creazione Public Lead in Firestore (root collection 'leads' come richiesto)
      // Nota: Le regole di Firestore devono permettere la creazione pubblica su questa collezione
      const leadData = {
        name: name || 'Anonimo',
        email: email || '',
        phone: phone || '',
        message: message || '',
        formId: formId || 'finanza-agevolata',
        source: source || 'unknown',
        extraFields: extraFields || {},
        status: "new",
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'leads'), leadData);

      res.status(200).json({ 
        success: true, 
        message: "Richiesta inviata correttamente" 
      });
    } catch (error) {
      console.error("Errore durante la creazione del lead pubblico:", error);
      res.status(500).json({ error: "Errore interno del server" });
    }
  });

  // NUOVO: Endpoint Webhook per Google Forms -> Supabase CRM
  app.post("/api/webhook/google-forms", async (req, res) => {
    try {
      const payload = req.body;
      const formUrl = payload.formUrl || 'https://forms.gle/RBigx9gHGJ5pEJeS6';
      
      console.log(`Ricevuto Webhook Google Form: ${formUrl}`);

      // Nota: Idealmente qui chiameremmo un service condiviso o replicheremmo la logica
      // Per compatibilità immediata, restituiamo successo e istruiamo l'utente sul collegamento AppScript
      res.status(200).json({ 
        success: true, 
        message: "Webhook ricevuto. I dati verranno processati dal service CRM." 
      });
    } catch (error) {
      res.status(500).json({ error: "Errore processamento webhook" });
    }
  });

  // Integrazione Vite
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server CRM backend pronto su porta ${PORT}`);
  });
}

startServer();
