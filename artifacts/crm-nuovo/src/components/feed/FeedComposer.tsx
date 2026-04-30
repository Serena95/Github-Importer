import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Type, 
  CheckSquare, 
  Calendar, 
  BarChart3, 
  Paperclip, 
  MoreHorizontal,
  Users,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { MessageComposer } from './composers/MessageComposer';
import { TaskComposer } from './composers/TaskComposer';
import { EventComposer } from './composers/EventComposer';
import { PollComposer } from './composers/PollComposer';
import { FileComposer } from './composers/FileComposer';

type FeedTab = 'message' | 'task' | 'event' | 'poll' | 'file' | 'other';

export const FeedComposer: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<FeedTab>('message');
  const [isExpanded, setIsExpanded] = useState(false);
  const [recipients, setRecipients] = useState<string[]>(['all']);

  const tabs = [
    { id: 'message', label: 'Messaggio', icon: Type },
    { id: 'task', label: 'Incarico', icon: CheckSquare },
    { id: 'event', label: 'Evento', icon: Calendar },
    { id: 'poll', label: 'Sondaggio', icon: BarChart3 },
    { id: 'file', label: 'File', icon: Paperclip },
    { id: 'other', label: 'Altro', icon: MoreHorizontal },
  ];

  return (
    <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden mb-6">
      {/* Bitrix Tabs */}
      <div className="flex border-b border-slate-100 bg-slate-50/30">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as FeedTab)}
            className={cn(
              "px-5 py-3 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all relative border-r border-slate-100 last:border-r-0",
              activeTab === tab.id 
                ? "bg-white text-blue-600 shadow-[0_-2px_0_inset_currentColor]" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            )}
          >
            <tab.icon size={14} className={cn(activeTab === tab.id ? "text-blue-500" : "text-slate-400")} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-0">
        {/* Dynamic Composer UI */}
        <div className="min-h-12 flex items-start">
          <div className="w-12 h-12 flex items-center justify-center shrink-0 border-r border-slate-50">
            <Avatar className="h-8 w-8 rounded-md">
              <AvatarImage src={profile?.photoURL} />
              <AvatarFallback className="rounded-md">{profile?.displayName?.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
          
          <div className="flex-1">
            {activeTab === 'message' && (
              <MessageComposer 
                onCancel={() => setIsExpanded(false)} 
                onSwitchTab={(tab) => setActiveTab(tab as FeedTab)}
              />
            )}
            {activeTab === 'task' && <TaskComposer onCancel={() => setIsExpanded(false)} />}
            {activeTab === 'event' && <EventComposer onCancel={() => setIsExpanded(false)} />}
            {activeTab === 'poll' && <PollComposer onCancel={() => setIsExpanded(false)} />}
            {activeTab === 'file' && <FileComposer onCancel={() => setIsExpanded(false)} />}
            {activeTab === 'other' && (
              <div className="p-8 text-center text-slate-400 italic text-sm">
                Funzionalità {activeTab} in arrivo...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
