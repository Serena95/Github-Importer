import React from 'react';
import FeedHeader from '@/components/feed/FeedHeader';
import { FeedComposer } from '@/components/feed/FeedComposer';
import FeedList from '@/components/feed/FeedList';
import { 
  Users, 
  TrendingUp, 
  Star, 
  Calendar, 
  Clock,
  Pin,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFeedStore } from '@/stores/feedStore';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const FeedPage: React.FC = () => {
  const { profile } = useAuth();
  const { posts } = useFeedStore();

  const sidebarStats = [
    { label: 'Post totali', value: posts.length, icon: MessageSquare, color: 'text-blue-500' },
    { label: 'Popolari', value: posts.filter(p => p.likesCount > 5).length, icon: TrendingUp, color: 'text-emerald-500' },
    { label: 'In evidenza', value: posts.filter(p => p.isPinned).length, icon: Star, color: 'text-amber-500' },
  ];

  return (
    <div className="h-full flex flex-col bg-[#f5f7fb]">
      <FeedHeader />
      
      <div className="flex-1 overflow-y-auto nexus-scrollbar p-4 lg:p-8">
        <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-8">
          
          <div className="flex-1 space-y-8 max-w-[800px] mx-auto w-full">
            <FeedComposer />
            <FeedList />
          </div>

          {/* Right Sidebar - Desktop Only - MODIFIED to be simpler or hidden if needed */}
          <div className="w-full lg:w-72 shrink-0 space-y-6 hidden xl:block">
            {/* User Quick Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-[10px] font-black uppercase tracking-widest">
                  Il tuo profilo
                </div>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <img 
                    src={profile?.photoURL} 
                    className="w-16 h-16 rounded-2xl object-cover shadow-lg" 
                    alt="" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 tracking-tight leading-tight uppercase">
                    {profile?.displayName}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {profile?.role}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Post</span>
                  <span className="text-xl font-black text-slate-800">{posts.filter(p => p.authorId === profile?.uid).length}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Commenti</span>
                  <span className="text-xl font-black text-slate-800">12</span>
                </div>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                Stats piattaforma
              </h4>
              <div className="space-y-4">
                {sidebarStats.map((stat, i) => (
                  <div key={i} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg bg-slate-50 group-hover:bg-white transition-colors", stat.color)}>
                        <stat.icon size={16} />
                      </div>
                      <span className="text-sm font-bold text-slate-600 group-hover:text-brand-blue transition-colors">
                        {stat.label}
                      </span>
                    </div>
                    <span className="text-sm font-black text-slate-400">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Birthday / Events placeholder */}
            <div className="bg-gradient-to-br from-brand-blue to-blue-600 rounded-2xl p-6 shadow-xl shadow-blue-100 text-white relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="text-[11px] font-black opacity-60 uppercase tracking-[0.2em] mb-2"> Prossimi Eventi</h4>
                <p className="text-sm font-bold leading-snug">
                  Nessun evento in programma per oggi. 
                </p>
                <button className="mt-4 text-[10px] font-black uppercase tracking-widest bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition-all">
                  Vedi calendario
                </button>
              </div>
              <Calendar className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 group-hover:scale-110 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedPage;
