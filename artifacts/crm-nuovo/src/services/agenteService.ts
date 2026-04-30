import { GoogleGenAI } from "@google/genai";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const KNOWLEDGE_BASE = `
STUDIO PROFESSIONALE - KNOWLEDGE BASE
Servizi:
1. Consulenza Fiscale: Dichiarazione redditi (150€), Pianificazione fiscale (500€).
2. Consulenza Legale: Contrattualistica (300€), Pareri legali (200€).
3. Consulenza Aziendale: Business Plan (1000€), Analisi di bilancio (400€).

FAQ:
- Orari: Lun-Ven 09:00-18:00 (Pausa 13:00-14:00).
- Appuntamenti: Necessari per consulenze in sede.
- Documenti: Portare sempre documento identità e codice fiscale.

Policy:
- Riservatezza assoluta dei dati.
- Pagamento anticipato per pareri scritti.
`;

const SYSTEM_INSTRUCTION = `
Nome: AgenteCRM
Lingua: Italiano, tono professionale e cordiale, dare del Lei.
Firma: "– Assistente virtuale"

COMPORTAMENTI OBBLIGATORI:
1. Rispondi SOLO usando le informazioni della Knowledge Base fornita.
2. Se non sai rispondere, dì esattamente: "Non ho questa informazione, la metto in contatto con un operatore".
3. Per prenotare appuntamenti, devi raccogliere: Nome, Data, Ora e Motivo.
4. Proponi preventivi basati sul listino prezzi.
5. ESCALATION AUTOMATICA: Se l'utente usa parole come "rimborso", "avvocato", "denuncia", "operatore", "persona", "responsabile", "reclamo", informa che un operatore umano prenderà in carico la richiesta.
6. Orari di ufficio: Lun-Ven 09:00-18:00, pausa 13:00-14:00. Se fuori orario, informa l'utente.

CONTESTO:
${KNOWLEDGE_BASE}
`;

export async function sendMessageToAgente(
  tenantId: string,
  clientId: string,
  userMessage: string,
  history: { role: string; text: string }[] = []
) {
  // 1. Check for escalation keywords
  const escalationKeywords = ["rimborso", "avvocato", "denuncia", "operatore", "persona", "responsabile", "reclamo"];
  const needsEscalation = escalationKeywords.some(word => userMessage.toLowerCase().includes(word));

  if (needsEscalation) {
    const escalationMsg = "La Sua richiesta richiede l'intervento di un professionista. Un nostro operatore La ricontatterà al più presto. – Assistente virtuale";
    await saveMessage(tenantId, clientId, userMessage, escalationMsg, true);
    return { text: escalationMsg, escalated: true };
  }

  // 2. Call Gemini
  try {
    const contents = history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }]
    }));
    
    contents.push({ role: 'user', parts: [{ text: userMessage }] });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const botResponse = response.text || "Mi scusi, si è verificato un errore.";
    const finalResponse = botResponse.includes("– Assistente virtuale") ? botResponse : `${botResponse}\n\n– Assistente virtuale`;

    // 3. Save to Firestore
    await saveMessage(tenantId, clientId, userMessage, finalResponse, false);

    return { text: finalResponse, escalated: false };
  } catch (error) {
    console.error("Errore AgenteCRM:", error);
    return { text: "Non ho questa informazione, la metto in contatto con un operatore. – Assistente virtuale", escalated: true };
  }
}

async function saveMessage(tenantId: string, clientId: string, userMsg: string, botMsg: string, escalated: boolean) {
  const chatRef = collection(db, 'tenants', tenantId, 'cilento_preventivi_chat');
  await addDoc(chatRef, {
    clientId,
    userMessage: userMsg,
    botResponse: botMsg,
    escalated,
    timestamp: serverTimestamp()
  });
}
