import { create } from 'zustand';
import { FeedPost, FeedComment } from '@/types';

interface FeedState {
  posts: FeedPost[];
  activeFilter: string;
  isPinnedOnly: boolean;
  setPosts: (posts: FeedPost[]) => void;
  setActiveFilter: (filter: string) => void;
  setIsPinnedOnly: (pinnedOnly: boolean) => void;
}

export const useFeedStore = create<FeedState>((set) => ({
  posts: [],
  activeFilter: 'all',
  isPinnedOnly: false,
  setPosts: (posts) => set({ posts }),
  setActiveFilter: (activeFilter) => set({ activeFilter }),
  setIsPinnedOnly: (isPinnedOnly) => set({ isPinnedOnly }),
}));
