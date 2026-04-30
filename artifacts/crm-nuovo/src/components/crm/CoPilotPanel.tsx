import React, { useState } from 'react';
import { Sparkles, FileText, ArrowRight, Mail, Target, Loader2, Copy, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type CopilotAction = 'summarize' | 'next_action' | 'draft_email' | 'lead_score';

interface CoPilotPanelProps {
  recordType: 'deal' | 'lead' | 'contact' | 'company' | 'task';
  record: Record<string, unknown>;
  context?: Record<string, unknown>;
  variant?: 'button' | 'icon';
  triggerClassName?: string;
}

const ACTIONS: Array<{
  id: CopilotAction;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  bgColor: string;
}> = [
  {
    id: 'summarize',
    label: 'Riassumi',
    description: 'Sintesi in 3-5 punti chiave',
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 hover:bg-blue-100',
  },
  {
    id: 'next_action',
    label: 'Prossime azioni',
    description: 'Suggerisce le 3 mosse successive',
    icon: ArrowRight,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 hover:bg-emerald-100',
  },
  {
    id: 'draft_email',
    label: 'Scrivi email',
    description: 'Bozza di follow-up professionale',
    icon: Mail,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 hover:bg-amber-100',
  },
  {
    id: 'lead_score',
    label: 'Lead score',
    description: 'Punteggio 0-100 + motivazioni',
    icon: Target,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50 hover:bg-rose-100',
  },
];

const renderMarkdown = (text: string): React.ReactNode => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listBuffer: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const flushList = (key: string) => {
    if (!listBuffer.length || !listType) return;
    const items = listBuffer.map((item, i) => (
      <li key={i} className="ml-4 mb-1 text-sm text-slate-700">{renderInline(item)}</li>
    ));
    elements.push(
      listType === 'ol'
        ? <ol key={key} className="list-decimal mb-3 space-y-0.5">{items}</ol>
        : <ul key={key} className="list-disc mb-3 space-y-0.5">{items}</ul>
    );
    listBuffer = [];
    listType = null;
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList(`l-${i}`);
      return;
    }
    if (/^#{1,3}\s/.test(trimmed)) {
      flushList(`l-${i}`);
      const level = trimmed.match(/^#+/)?.[0].length || 1;
      const txt = trimmed.replace(/^#+\s/, '');
      const sizeClass = level === 1 ? 'text-base font-black' : level === 2 ? 'text-sm font-bold' : 'text-xs font-bold uppercase tracking-wider';
      elements.push(<h3 key={i} className={cn('text-slate-800 mt-3 mb-2', sizeClass)}>{renderInline(txt)}</h3>);
      return;
    }
    const olMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (olMatch) {
      if (listType !== 'ol') flushList(`l-${i}`);
      listType = 'ol';
      listBuffer.push(olMatch[2]);
      return;
    }
    if (/^[-*]\s/.test(trimmed)) {
      if (listType !== 'ul') flushList(`l-${i}`);
      listType = 'ul';
      listBuffer.push(trimmed.replace(/^[-*]\s+/, ''));
      return;
    }
    flushList(`l-${i}`);
    elements.push(<p key={i} className="text-sm text-slate-700 mb-2 leading-relaxed">{renderInline(trimmed)}</p>);
  });
  flushList('end');
  return elements;
};

const renderInline = (text: string): React.ReactNode => {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let lastIdx = 0;
  let match;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) parts.push(text.slice(lastIdx, match.index));
    const m = match[0];
    if (m.startsWith('**')) parts.push(<strong key={key++} className="font-bold text-slate-900">{m.slice(2, -2)}</strong>);
    else if (m.startsWith('*')) parts.push(<em key={key++}>{m.slice(1, -1)}</em>);
    else if (m.startsWith('`')) parts.push(<code key={key++} className="bg-slate-100 px-1 py-0.5 rounded text-xs font-mono">{m.slice(1, -1)}</code>);
    lastIdx = match.index + m.length;
  }
  if (lastIdx < text.length) parts.push(text.slice(lastIdx));
  return parts.length ? parts : text;
};

const CoPilotPanel: React.FC<CoPilotPanelProps> = ({
  recordType,
  record,
  context,
  variant = 'button',
  triggerClassName,
}) => {
  const [open, setOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<CopilotAction | null>(null);
  const [response, setResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const runAction = async (action: CopilotAction) => {
    setActiveAction(action);
    setResponse('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/copilot/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, recordType, record, context }),
      });

      if (!res.ok || !res.body) {
        throw new Error('Errore di rete');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.content) setResponse((prev) => prev + data.content);
            if (data.done) setIsLoading(false);
          } catch {}
        }
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setResponse('⚠️ Errore nella generazione. Verifica la connessione e riprova.');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(response);
      setCopied(true);
      toast.success('Copiato negli appunti');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Impossibile copiare');
    }
  };

  const reset = () => {
    setActiveAction(null);
    setResponse('');
    setIsLoading(false);
  };

  const Trigger = variant === 'icon' ? (
    <button
      type="button"
      title="CoPilot AI"
      className={cn(
        'h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center hover:scale-105 transition-transform shadow-md shadow-purple-200',
        triggerClassName
      )}
    >
      <Sparkles size={14} />
    </button>
  ) : (
    <button
      type="button"
      className={cn(
        'flex items-center gap-1.5 px-3 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white text-[11px] font-black uppercase tracking-wider hover:scale-105 transition-transform shadow-md shadow-purple-200',
        triggerClassName
      )}
    >
      <Sparkles size={12} />
      CoPilot AI
    </button>
  );

  return (
    <Sheet open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <SheetTrigger asChild>{Trigger}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[480px] p-0 flex flex-col">
        <SheetHeader className="p-5 border-b bg-gradient-to-br from-violet-50 via-white to-purple-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-200">
              <Sparkles size={18} />
            </div>
            <div>
              <SheetTitle className="text-base font-black text-slate-800">CoPilot AI</SheetTitle>
              <SheetDescription className="text-xs text-slate-500">
                Assistente intelligente basato su Gemini
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {!activeAction ? (
              <motion.div
                key="actions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-5 space-y-2"
              >
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Cosa vuoi fare?</p>
                {ACTIONS.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => runAction(a.id)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 transition-all text-left group',
                      a.bgColor
                    )}
                  >
                    <div className={cn('w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform', a.color)}>
                      <a.icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800">{a.label}</p>
                      <p className="text-xs text-slate-500 truncate">{a.description}</p>
                    </div>
                    <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                ))}

                <div className="mt-6 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Suggerimento</p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Il CoPilot legge i dati di questo {recordType} e genera contenuti su misura. I risultati sono indicativi: revisiona sempre prima di inviare.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="response"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={reset}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                    >
                      ← Indietro
                    </button>
                    <span className="text-xs text-slate-300">·</span>
                    <span className="text-xs font-bold text-slate-700">
                      {ACTIONS.find((a) => a.id === activeAction)?.label}
                    </span>
                  </div>
                  {response && !isLoading && (
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 text-xs font-bold text-violet-600 hover:text-violet-800"
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      {copied ? 'Copiato' : 'Copia'}
                    </button>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-4 min-h-[200px]">
                  {isLoading && !response && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Loader2 size={14} className="animate-spin" />
                      <span className="text-sm">Sto pensando...</span>
                    </div>
                  )}
                  {response && (
                    <div className="prose prose-sm max-w-none">
                      {renderMarkdown(response)}
                      {isLoading && <span className="inline-block w-2 h-4 bg-violet-500 animate-pulse ml-0.5" />}
                    </div>
                  )}
                </div>

                {!isLoading && response && (
                  <div className="mt-4 flex gap-2">
                    <Button
                      onClick={() => runAction(activeAction)}
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs font-bold"
                    >
                      Rigenera
                    </Button>
                    <Button
                      onClick={reset}
                      size="sm"
                      className="flex-1 text-xs font-bold bg-gradient-to-br from-violet-500 to-purple-600 text-white hover:opacity-90"
                    >
                      Altra azione
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CoPilotPanel;
