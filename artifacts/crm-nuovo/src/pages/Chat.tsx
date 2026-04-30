import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  where
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical, 
  Phone, 
  Video, 
  Search, 
  Circle,
  Hash,
  Users,
  User as UserIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';

const Chat: React.FC = () => {
  const { user, tenant } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeChat, setActiveChat] = useState<any>({ id: 'general', name: 'Generale', type: 'channel' });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!tenant || !activeChat) return;

    const q = query(
      collection(db, 'tenants', tenant.id, 'messages'),
      where('channelId', '==', activeChat.id),
      orderBy('createdAt', 'asc')
    );

    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)));
      setTimeout(scrollToBottom, 100);
    }, (error) => handleFirestoreError(error, OperationType.LIST, `tenants/${tenant.id}/messages`));

    return () => unsub();
  }, [tenant, activeChat]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !tenant) return;

    await addDoc(collection(db, 'tenants', tenant.id, 'messages'), {
      tenantId: tenant.id,
      channelId: activeChat.id,
      senderId: user.uid,
      senderName: user.displayName || 'Utente',
      content: newMessage,
      type: 'text',
      createdAt: serverTimestamp()
    });

    setNewMessage('');
  };

  const channels = [
    { id: 'general', name: 'Generale', type: 'channel' },
    { id: 'sales', name: 'Vendite', type: 'channel' },
    { id: 'support', name: 'Supporto', type: 'channel' },
  ];

  const [directMessages, setDirectMessages] = useState<any[]>([]);

  useEffect(() => {
    if (!tenant) return;
    const q = query(collection(db, 'tenants', tenant.id, 'users'));
    const unsub = onSnapshot(q, (snap) => {
      setDirectMessages(snap.docs.map(doc => ({ 
        id: doc.id, 
        name: doc.data().displayName || 'Utente', 
        status: doc.data().status === 'active' ? 'online' : 'offline' 
      })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `tenants/${tenant.id}/users`));
    return () => unsub();
  }, [tenant]);

  return (
    <div className="h-full flex bg-white overflow-hidden">
      {/* Chat Sidebar */}
      <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/50">
        <div className="p-6 border-b border-slate-100 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800">Chat</h2>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-slate-400">
              <MoreVertical size={18} />
            </Button>
          </div>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={14} />
            <Input 
              placeholder="Cerca conversazioni..." 
              className="pl-9 bg-slate-100 border-none h-9 rounded-full text-xs focus-visible:ring-2 focus-visible:ring-blue-400/30"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-8">
          {/* Channels */}
          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-2">Canali</h3>
            <div className="space-y-1">
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setActiveChat(channel)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all font-bold text-sm",
                    activeChat.id === channel.id 
                      ? "bg-blue-500 text-white shadow-lg shadow-blue-100" 
                      : "text-slate-500 hover:bg-white hover:shadow-sm"
                  )}
                >
                  <Hash size={16} className={activeChat.id === channel.id ? "text-blue-200" : "text-slate-300"} />
                  {channel.name}
                </button>
              ))}
            </div>
          </div>

          {/* Direct Messages */}
          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-2">Messaggi Diretti</h3>
            <div className="space-y-1">
              {directMessages.map((dm) => (
                <button
                  key={dm.id}
                  onClick={() => setActiveChat(dm)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all font-bold text-sm",
                    activeChat.id === dm.id 
                      ? "bg-blue-500 text-white shadow-lg shadow-blue-100" 
                      : "text-slate-500 hover:bg-white hover:shadow-sm"
                  )}
                >
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={cn(
                        "text-[10px]",
                        activeChat.id === dm.id ? "bg-blue-400 text-white" : "bg-slate-200 text-slate-500"
                      )}>
                        {dm.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn(
                      "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white",
                      dm.status === 'online' ? "bg-emerald-500" : "bg-slate-300"
                    )}></div>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="truncate">{dm.name}</p>
                    <p className={cn(
                      "text-[10px] font-medium truncate",
                      activeChat.id === dm.id ? "text-blue-100" : "text-slate-400"
                    )}>
                      {dm.status === 'online' ? 'Attivo ora' : 'Offline'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Chat Header */}
        <div className="h-20 px-8 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 font-bold">
              {activeChat.type === 'channel' ? <Hash size={20} /> : activeChat.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-slate-800">{activeChat.name}</h3>
              <div className="flex items-center gap-1.5">
                <Circle size={8} className="fill-emerald-500 text-emerald-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">12 Membri Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full text-slate-400 hover:text-blue-500 hover:bg-blue-50">
              <Phone size={20} />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full text-slate-400 hover:text-blue-500 hover:bg-blue-50">
              <Video size={20} />
            </Button>
            <div className="w-px h-6 bg-slate-100 mx-2"></div>
            <Button variant="ghost" size="icon" className="rounded-full text-slate-400">
              <MoreVertical size={20} />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-auto p-8 space-y-6 bg-slate-50/30">
          {messages.map((msg, i) => {
            const isMe = msg.senderId === user?.uid;
            return (
              <div key={msg.id} className={cn(
                "flex items-end gap-3",
                isMe ? "flex-row-reverse" : "flex-row"
              )}>
                {!isMe && (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-slate-200 text-slate-500 text-[10px] font-bold">
                      {msg.senderName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={cn(
                  "max-w-[70%] space-y-1",
                  isMe ? "items-end" : "items-start"
                )}>
                  {!isMe && <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{msg.senderName}</p>}
                  <div className={cn(
                    "px-4 py-3 rounded-2xl text-sm font-medium shadow-sm",
                    isMe 
                      ? "bg-blue-500 text-white rounded-br-none" 
                      : "bg-white text-slate-700 rounded-bl-none border border-slate-100"
                  )}>
                    {msg.content}
                  </div>
                  <p className={cn(
                    "text-[9px] font-bold text-slate-400 uppercase tracking-tighter",
                    isMe ? "text-right mr-1" : "ml-1"
                  )}>
                    {msg.createdAt?.toDate ? format(msg.createdAt.toDate(), 'HH:mm') : '...'}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-6 bg-white border-t border-slate-100">
          <form onSubmit={sendMessage} className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100 focus-within:border-blue-400/50 focus-within:ring-4 focus-within:ring-blue-400/10 transition-all">
            <Button type="button" variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-blue-500 hover:bg-white">
              <Paperclip size={20} />
            </Button>
            <Input 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Scrivi un messaggio in ${activeChat.name}...`}
              className="flex-1 bg-transparent border-none shadow-none focus-visible:ring-0 text-sm font-medium"
            />
            <Button type="button" variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-amber-500 hover:bg-white">
              <Smile size={20} />
            </Button>
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-4 h-10 shadow-lg shadow-blue-100">
              <Send size={18} className="mr-2" />
              INVIA
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
