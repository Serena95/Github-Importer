import { create } from 'zustand';

export interface LeadScore {
  score: number;
  label: 'Hot' | 'Warm' | 'Cold';
  summary: string;
  loading: boolean;
  error?: string;
}

interface LeadScoreState {
  scores: Record<string, LeadScore>;
  isBatchRunning: boolean;
  batchProgress: number;
  batchTotal: number;
  setScore: (leadId: string, score: LeadScore) => void;
  setLoading: (leadId: string) => void;
  setBatchRunning: (v: boolean, total?: number) => void;
  setBatchProgress: (n: number) => void;
  scoreLeads: (leads: any[]) => Promise<void>;
}

function parseScoreFromText(text: string): { score: number; label: 'Hot' | 'Warm' | 'Cold'; summary: string } {
  const scoreMatch = text.match(/\*\*Punteggio[:\s*]*?(\d{1,3})\/100/i) || text.match(/(\d{1,3})\/100/);
  const score = scoreMatch ? Math.min(100, parseInt(scoreMatch[1], 10)) : 50;
  const label: 'Hot' | 'Warm' | 'Cold' =
    score >= 70 ? 'Hot' : score >= 40 ? 'Warm' : 'Cold';
  const firstLine = text.split('\n').find(l => l.trim().length > 0) ?? text.slice(0, 120);
  return { score, label, summary: firstLine.replace(/\*+/g, '').trim() };
}

export const useLeadScoreStore = create<LeadScoreState>((set, get) => ({
  scores: {},
  isBatchRunning: false,
  batchProgress: 0,
  batchTotal: 0,

  setScore: (leadId, score) =>
    set((s) => ({ scores: { ...s.scores, [leadId]: score } })),

  setLoading: (leadId) =>
    set((s) => ({
      scores: {
        ...s.scores,
        [leadId]: { score: 0, label: 'Warm', summary: '', loading: true },
      },
    })),

  setBatchRunning: (v, total) =>
    set({ isBatchRunning: v, batchTotal: total ?? 0, batchProgress: 0 }),

  setBatchProgress: (n) => set({ batchProgress: n }),

  scoreLeads: async (leads) => {
    if (!leads.length) return;
    set({ isBatchRunning: true, batchTotal: leads.length, batchProgress: 0 });

    const CONCURRENCY = 3;
    const chunks: any[][] = [];
    for (let i = 0; i < leads.length; i += CONCURRENCY) {
      chunks.push(leads.slice(i, i + CONCURRENCY));
    }

    for (const chunk of chunks) {
      await Promise.all(
        chunk.map(async (lead) => {
          get().setLoading(lead.id);
          try {
            const res = await fetch('/api/copilot/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'lead_score',
                recordType: 'lead',
                record: {
                  title: lead.title,
                  value: lead.value,
                  source: lead.source,
                  company: lead.company,
                  contactName: lead.contactName,
                  notes: lead.notes,
                  status: lead.status,
                  priority: lead.priority,
                },
              }),
            });
            if (!res.ok) throw new Error('API error');
            const data = await res.json();
            const parsed = parseScoreFromText(data.text ?? '');
            get().setScore(lead.id, { ...parsed, loading: false });
          } catch {
            get().setScore(lead.id, {
              score: 0,
              label: 'Cold',
              summary: 'Errore scoring',
              loading: false,
              error: 'API error',
            });
          }
          set((s) => ({ batchProgress: s.batchProgress + 1 }));
        })
      );
    }

    set({ isBatchRunning: false });
  },
}));

export function scoreLabelColor(label: 'Hot' | 'Warm' | 'Cold') {
  return {
    Hot: { bg: 'bg-rose-500', text: 'text-rose-600', soft: 'bg-rose-50' },
    Warm: { bg: 'bg-amber-500', text: 'text-amber-600', soft: 'bg-amber-50' },
    Cold: { bg: 'bg-slate-400', text: 'text-slate-500', soft: 'bg-slate-50' },
  }[label];
}
