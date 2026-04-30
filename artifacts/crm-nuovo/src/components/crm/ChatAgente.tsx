import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Send, User, Loader2, AlertCircle, X } from 'lucide-react';
import { sendMessageToAgente } from '@/services/agenteService';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

interface ChatAgenteProps {
  clientId: string;
  onClose?: () => void;
}

const ChatAgente: React.FC<ChatAgenteProps> = ({ clientId, onClose }) => {
  const { tenant } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEscalated, setIsEscalated] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !tenant || isEscalated) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const history = messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      text: m.text
    }));

    try {
      const result = await sendMessageToAgente(tenant.id, clientId, input, history);

      const botMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'bot',
        text: result.text,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMsg]);
      if (result.escalated) {
        setIsEscalated(true);
      }
    } catch (error) {
      console.error("Errore chat:", error);
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'bot',
        text: "Mi scusi, si è verificato un errore tecnico. La prego di riprovare più tardi o di contattare un operatore.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[500px] md:h-[600px] max-h-[80vh] border-none shadow-2xl bg-white overflow-hidden rounded-3xl">
      <CardHeader className="bg-[#004a99] text-white p-6 shrink-0">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <p className="text-lg font-bold">AgenteCRM</p>
              <p className="text-[10px] uppercase tracking-widest opacity-70">Assistente Virtuale</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isEscalated && (
              <div className="flex items-center gap-2 bg-amber-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-amber-500/30">
                <AlertCircle className="w-3 h-3" /> Escalation Attiva
              </div>
            )}
            {onClose && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose}
                className="text-white hover:bg-white/10 rounded-full h-8 w-8"
              >
                <X size={18} />
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50" ref={scrollRef}>
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-[#004a99] text-white rounded-tr-none' 
                  : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                <p className={`text-[9px] mt-2 opacity-50 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm">
                <Loader2 className="w-5 h-5 animate-spin text-[#004a99]" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>

      <div className="p-6 bg-white border-t border-slate-100 shrink-0">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isEscalated ? "In attesa di un operatore..." : "Scriva qui il Suo messaggio..."}
            disabled={isLoading || isEscalated}
            className="rounded-full bg-slate-50 border-slate-200 focus:ring-[#004a99] h-12 px-6"
          />
          <Button 
            onClick={handleSend} 
            disabled={isLoading || isEscalated || !input.trim()}
            className="rounded-full w-12 h-12 p-0 bg-[#004a99] hover:bg-[#003d7a] shadow-lg shadow-blue-100 shrink-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ChatAgente;
