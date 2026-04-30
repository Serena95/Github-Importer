import React, { useState } from 'react';
import { SocialPoll } from '@/types';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';

interface PollCardProps {
  poll: SocialPoll;
  onVote?: (optionId: string) => void;
}

const PollCard: React.FC<PollCardProps> = ({ poll, onVote }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  const handleVote = (id: string) => {
    if (hasVoted) return;
    setSelectedOption(id);
    setHasVoted(true);
    onVote?.(id);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2FC6F6', '#FFC107', '#4CAF50']
    });
  };

  const totalVotes = poll.totalVotes + (hasVoted ? 1 : 0);

  return (
    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Badge className="bg-brand-blue/10 text-brand-blue border-none text-[8px] font-black uppercase">Sondaggio Live</Badge>
        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
           <Clock size={10} />
           <span>2 giorni rimanenti</span>
        </div>
      </div>
      
      <h3 className="font-bold text-slate-800 text-sm mb-4 leading-tight">{poll.question}</h3>
      
      <div className="space-y-3">
        {poll.options.map((option) => {
          const votes = option.votes + (selectedOption === option.id ? 1 : 0);
          const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
          
          return (
            <div key={option.id} className="relative">
              {!hasVoted ? (
                <button
                  onClick={() => handleVote(option.id)}
                  className="w-full text-left p-3 rounded-lg border border-slate-200 bg-white hover:border-brand-blue hover:text-brand-blue transition-all font-bold text-sm text-slate-600 active:scale-[0.98]"
                >
                  {option.text}
                </button>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between px-1">
                    <span className={cn(
                      "text-sm font-bold",
                      selectedOption === option.id ? "text-brand-blue" : "text-slate-600"
                    )}>
                      {option.text}
                      {selectedOption === option.id && <CheckCircle2 size={14} className="inline ml-1.5" />}
                    </span>
                    <span className="text-xs font-black text-slate-400">{percentage}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden relative">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={cn(
                        "h-full rounded-full",
                        selectedOption === option.id ? "bg-brand-blue" : "bg-slate-400"
                      )}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {totalVotes} voti totali
        </span>
        {hasVoted && (
          <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest">
            Voto registrato
          </span>
        )}
      </div>
    </div>
  );
};

export default PollCard;
