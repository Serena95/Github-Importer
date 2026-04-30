import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Smile, 
  Paperclip, 
  FileText, 
  Image as ImageIcon, 
  Check, 
  CheckCheck, 
  Clock, 
  AlertCircle,
  X,
  Type,
  Layout,
  Search,
  MoreVertical,
  Phone,
  Video
} from 'lucide-react';
import { whatsappService } from '@/services/whatsappService';
import { WhatsAppMessage, WhatsAppTemplate, CRMDeal } from '@/types/crm';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface WhatsAppChatProps {
  deal: CRMDeal;
}

export const WhatsAppChat: React.FC<WhatsAppChatProps> = ({ deal }) => {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsLoading(true);
    const unsub = whatsappService.subscribeToMessages(deal.id, (msgs) => {
      setMessages(msgs);
      setIsLoading(false);
    });

    whatsappService.getTemplates().then(setTemplates);

    return () => unsub();
  }, [deal.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await whatsappService.sendMessage({
        dealId: deal.id,
        recipientPhone: deal.phone,
        content: newMessage
      });
      setNewMessage('');
    } catch (error) {
      toast.error('Errore durante l\'invio del messaggio');
    }
  };

  const handleTemplateSelect = async (template: WhatsAppTemplate) => {
    let content = template.body;
    // Replace simple placeholders for demo
    content = content.replace('{{1}}', deal.contact);
    content = content.replace('{{2}}', deal.title);

    try {
      await whatsappService.sendMessage({
        dealId: deal.id,
        recipientPhone: deal.phone,
        content: content,
        type: 'template',
        templateId: template.id
      });
      setShowTemplates(false);
      toast.success('Template inviato');
    } catch (error) {
      toast.error('Errore nell\'invio del template');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    // Simulate upload
    setTimeout(async () => {
      try {
        await whatsappService.sendMessage({
          dealId: deal.id,
          recipientPhone: deal.phone,
          content: `File: ${file.name}`,
          type: file.type.startsWith('image/') ? 'image' : 'document',
          fileUrl: URL.createObjectURL(file), // Local preview simulation
          fileName: file.name
        });
        toast.success('File inviato');
      } catch (e) {
        toast.error('Errore invio file');
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }, 1500);
  };

  const getStatusIcon = (status: WhatsAppMessage['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-3 h-3 text-gray-400" />;
      case 'sent': return <Check className="w-3 h-3 text-gray-400" />;
      case 'delivered': return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case 'read': return <CheckCheck className="w-3 h-3 text-emerald-500" />;
      case 'failed': return <AlertCircle className="w-3 h-3 text-red-500" />;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-slate-50 border rounded-xl overflow-hidden shadow-sm relative" id="whatsapp-chat-container">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
            {deal.contact.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 leading-tight">{deal.contact}</h4>
            <p className="text-xs text-emerald-600 font-medium">{deal.phone}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-[10px] uppercase font-black text-slate-400 hover:text-emerald-600"
            onClick={() => whatsappService.simulateIncoming(deal.id, deal.phone, "Ciao! Ho ricevuto il vostro messaggio. Quando possiamo sentirci?")}
          >
            Simo Inbound
          </Button>
          <Button variant="ghost" size="icon" className="text-emerald-600"><Phone className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" className="text-emerald-600"><Video className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" className="text-gray-400"><Search className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" className="text-gray-400"><MoreVertical className="w-4 h-4" /></Button>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar"
        style={{ backgroundImage: 'url("https://w0.peakpx.com/wallpaper/580/630/HD-wallpaper-whatsapp-aesthetic-background-abstract-thumbnail.jpg")', backgroundSize: 'cover', backgroundBlendMode: 'overlay', backgroundColor: 'rgba(240, 242, 245, 0.9)' }}
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-2xl p-3 shadow-sm relative group ${
                  msg.direction === 'outbound' 
                    ? 'bg-[#dcf8c6] text-gray-800 rounded-tr-none' 
                    : 'bg-white text-gray-800 rounded-tl-none'
                }`}
              >
                {msg.type === 'template' && (
                  <div className="text-[10px] uppercase font-bold text-emerald-600 mb-1 flex items-center gap-1">
                    <Layout className="w-3 h-3" /> WhatsApp Template
                  </div>
                )}
                
                {msg.type === 'image' && msg.file_url && (
                  <img src={msg.file_url} alt="Attached" className="rounded-lg mb-2 max-w-full h-auto" />
                )}

                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-[10px] text-gray-500">
                    {format(new Date(msg.created_at), 'HH:mm')}
                  </span>
                  {msg.direction === 'outbound' && getStatusIcon(msg.status)}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Templates Drawer */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="absolute bottom-[72px] left-0 right-0 bg-white border-t rounded-t-2xl z-20 max-h-[60%] overflow-y-auto shadow-2xl p-4"
          >
            <div className="flex items-center justify-between mb-4 pb-2 border-b">
              <h5 className="font-bold text-gray-900 flex items-center gap-2">
                <Layout className="w-5 h-5 text-emerald-600" /> WhatsApp Templates
              </h5>
              <Button variant="ghost" size="icon" onClick={() => setShowTemplates(false)}><X className="w-5 h-5" /></Button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {templates.map(t => (
                <div 
                  key={t.id}
                  onClick={() => handleTemplateSelect(t)}
                  className="p-3 border rounded-xl hover:border-emerald-500 hover:bg-emerald-50 cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-emerald-700 uppercase">{t.category}</span>
                    <span className="text-[10px] text-gray-400 capitalize">{t.language}</span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2 italic">"{t.body}"</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <form 
        onSubmit={handleSend}
        className="p-3 bg-white border-t flex items-center gap-2 relative z-30"
      >
        <div className="flex items-center gap-1">
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="text-gray-500"
            onClick={() => setShowTemplates(!showTemplates)}
          >
            <Layout className={`w-5 h-5 ${showTemplates ? 'text-emerald-600' : ''}`} />
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="text-gray-500"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="w-5 h-5" />
          </Button>
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
        </div>

        <div className="flex-1 relative">
          <Input 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Scrivi un messaggio..."
            className="bg-gray-100 border-none focus-visible:ring-emerald-500 rounded-full pr-10"
          />
          <button 
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-500 transition-colors"
          >
            <Smile className="w-5 h-5" />
          </button>
        </div>

        <Button 
          type="submit" 
          size="icon" 
          disabled={!newMessage.trim() || isUploading}
          className="bg-emerald-600 hover:bg-emerald-700 rounded-full w-10 h-10 flex-shrink-0"
        >
          <Send className="w-4 h-4 text-white" />
        </Button>
      </form>
    </div>
  );
};
