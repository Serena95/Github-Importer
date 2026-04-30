import { Router, type IRouter } from "express";
import { GoogleGenAI } from "@google/genai";

const router: IRouter = Router();

const baseUrl = process.env["AI_INTEGRATIONS_GEMINI_BASE_URL"];
const apiKey = process.env["AI_INTEGRATIONS_GEMINI_API_KEY"];

if (!baseUrl || !apiKey) {
  throw new Error(
    "AI_INTEGRATIONS_GEMINI_BASE_URL and AI_INTEGRATIONS_GEMINI_API_KEY must be set",
  );
}

const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    apiVersion: "",
    baseUrl,
  },
});

const MODEL = "gemini-2.5-flash";

type CopilotAction =
  | "summarize"
  | "next_action"
  | "draft_email"
  | "lead_score"
  | "custom";

interface CopilotRequest {
  action: CopilotAction;
  recordType: "deal" | "lead" | "contact" | "company" | "task";
  record: Record<string, unknown>;
  context?: Record<string, unknown>;
  customPrompt?: string;
}

const ACTION_PROMPTS: Record<CopilotAction, (recordType: string) => string> = {
  summarize: (rt) =>
    `Sei un assistente CRM esperto. Riassumi questo ${rt} in 3-5 punti chiave essenziali per un commerciale italiano. Usa un tono professionale, sintetico, focalizzato su valore commerciale e prossimi passi. Rispondi in italiano in markdown.`,
  next_action: (rt) =>
    `Sei un coach commerciale esperto. Analizza questo ${rt} e suggerisci LE 3 PROSSIME AZIONI CONCRETE in ordine di priorità per fare avanzare la trattativa. Per ogni azione indica: cosa fare, quando, e perché. Rispondi in italiano in markdown con elenco numerato.`,
  draft_email: (rt) =>
    `Sei un esperto di email commerciali italiane. Scrivi una email di follow-up professionale, calda ma diretta, basata sul contesto di questo ${rt}. Includi oggetto e corpo. Tono: cordiale, italiano formale ma non rigido. Massimo 150 parole. Formatta come:\n\n**Oggetto:** ...\n\n**Corpo:**\n...`,
  lead_score: () =>
    `Sei un esperto di lead scoring B2B italiano. Analizza questi dati e fornisci:\n1. Un punteggio da 0 a 100\n2. La classificazione (Hot / Warm / Cold)\n3. 3 motivazioni in bullet point\n\nRispondi in italiano in markdown, formato:\n\n**Punteggio:** XX/100 — **Hot/Warm/Cold**\n\n**Motivazioni:**\n- ...\n- ...\n- ...`,
  custom: () =>
    `Sei un assistente CRM esperto. Rispondi in italiano, in modo professionale e sintetico. Usa markdown.`,
};

router.post("/copilot/generate", async (req, res) => {
  try {
    const body = req.body as CopilotRequest;
    if (!body || !body.action || !body.recordType || !body.record) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const systemPrompt = ACTION_PROMPTS[body.action](body.recordType);

    const recordJson = JSON.stringify(body.record, null, 2);
    const contextJson = body.context ? JSON.stringify(body.context, null, 2) : "";

    const userMessage =
      body.action === "custom" && body.customPrompt
        ? `${body.customPrompt}\n\nDati ${body.recordType}:\n\`\`\`json\n${recordJson}\n\`\`\`${contextJson ? `\n\nContesto aggiuntivo:\n\`\`\`json\n${contextJson}\n\`\`\`` : ""}`
        : `Dati ${body.recordType}:\n\`\`\`json\n${recordJson}\n\`\`\`${contextJson ? `\n\nContesto aggiuntivo:\n\`\`\`json\n${contextJson}\n\`\`\`` : ""}`;

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.6,
        maxOutputTokens: 8192,
      },
    });

    const text = response.text ?? "Non sono riuscito a generare una risposta.";
    res.json({ text, action: body.action });
  } catch (err) {
    req.log.error({ err }, "CoPilot error");
    res.status(500).json({ error: "Errore interno del CoPilot" });
  }
});

router.post("/copilot/stream", async (req, res) => {
  try {
    const body = req.body as CopilotRequest;
    if (!body || !body.action || !body.recordType || !body.record) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const systemPrompt = ACTION_PROMPTS[body.action](body.recordType);
    const recordJson = JSON.stringify(body.record, null, 2);
    const contextJson = body.context ? JSON.stringify(body.context, null, 2) : "";

    const userMessage =
      body.action === "custom" && body.customPrompt
        ? `${body.customPrompt}\n\nDati ${body.recordType}:\n\`\`\`json\n${recordJson}\n\`\`\`${contextJson ? `\n\nContesto aggiuntivo:\n\`\`\`json\n${contextJson}\n\`\`\`` : ""}`
        : `Dati ${body.recordType}:\n\`\`\`json\n${recordJson}\n\`\`\`${contextJson ? `\n\nContesto aggiuntivo:\n\`\`\`json\n${contextJson}\n\`\`\`` : ""}`;

    const stream = await ai.models.generateContentStream({
      model: MODEL,
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.6,
        maxOutputTokens: 8192,
      },
    });

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    req.log.error({ err }, "CoPilot stream error");
    try {
      res.write(`data: ${JSON.stringify({ error: "stream_error" })}\n\n`);
    } catch {}
    res.end();
  }
});

export default router;
