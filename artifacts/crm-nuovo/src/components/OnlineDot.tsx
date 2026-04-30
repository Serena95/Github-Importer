import React from 'react';
import { usePresenceStore } from '@/stores/presenceStore';
import { cn } from '@/lib/utils';

interface OnlineDotProps {
  uid?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'w-2 h-2 ring-1',
  md: 'w-2.5 h-2.5 ring-2',
  lg: 'w-3 h-3 ring-2',
};

const OnlineDot: React.FC<OnlineDotProps> = ({ uid, size = 'md', className }) => {
  const isOnline = usePresenceStore((s) => (uid ? s.isOnline(uid) : false));
  if (!uid) return null;
  return (
    <span
      className={cn(
        'absolute bottom-0 right-0 rounded-full ring-white',
        sizeMap[size],
        isOnline ? 'bg-emerald-500' : 'bg-slate-300',
        className
      )}
      title={isOnline ? 'Online' : 'Offline'}
    />
  );
};

export default OnlineDot;
