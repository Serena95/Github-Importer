import React from 'react';
import { Loader2, Flame, Thermometer, Snowflake } from 'lucide-react';
import { useLeadScoreStore, scoreLabelColor } from '@/stores/leadScoreStore';
import { cn } from '@/lib/utils';

interface LeadScoreBadgeProps {
  leadId: string;
  size?: 'sm' | 'md';
}

const LeadScoreBadge: React.FC<LeadScoreBadgeProps> = ({ leadId, size = 'sm' }) => {
  const score = useLeadScoreStore((s) => s.scores[leadId]);
  if (!score) return null;

  if (score.loading) {
    return (
      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100">
        <Loader2 size={10} className="animate-spin text-slate-400" />
        <span className="text-[9px] font-bold text-slate-400">AI...</span>
      </div>
    );
  }

  const colors = scoreLabelColor(score.label);
  const Icon = score.label === 'Hot' ? Flame : score.label === 'Warm' ? Thermometer : Snowflake;

  if (size === 'sm') {
    return (
      <div className={cn('flex items-center gap-1 px-1.5 py-0.5 rounded-md', colors.soft)} title={score.summary}>
        <Icon size={9} className={colors.text} />
        <span className={cn('text-[9px] font-black', colors.text)}>{score.score}</span>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-lg', colors.soft)} title={score.summary}>
      <Icon size={12} className={colors.text} />
      <span className={cn('text-[10px] font-black', colors.text)}>{score.score}/100 · {score.label}</span>
    </div>
  );
};

export default LeadScoreBadge;
