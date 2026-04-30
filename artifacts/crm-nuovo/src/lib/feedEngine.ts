import { SocialPost, SocialPoll } from '@/types';

export interface FeedItem {
  id: string;
  type: 'post' | 'ad' | 'poll' | 'suggested';
  data: any;
}

export class FeedEngine {
  /**
   * Processes raw posts into a filtered, sorted, and injected feed.
   */
  static processFeed(
    rawPosts: SocialPost[], 
    polls: SocialPoll[], 
    ads: any[], 
    algorithm: 'algorithmic' | 'chronological' | 'trending' = 'algorithmic'
  ): FeedItem[] {
    
    // 1. Calculate scores if algorithmic
    let sortedPosts = [...rawPosts];
    
    if (algorithm !== 'chronological') {
      sortedPosts = sortedPosts.sort((a, b) => {
        const scoreA = (a.score || 0) + (a.isSponsored ? 1000 : 0) + (a.isPinned ? 5000 : 0);
        const scoreB = (b.score || 0) + (b.isSponsored ? 1000 : 0) + (b.isPinned ? 5000 : 0);
        return scoreB - scoreA;
      });
    } else {
      sortedPosts = sortedPosts.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.()?.getTime() || 0;
        const dateB = b.createdAt?.toDate?.()?.getTime() || 0;
        return dateB - dateA;
      });
    }

    // 2. Inject Ads, Polls, and Suggestions every 5 posts
    const finalFeed: FeedItem[] = [];
    let adIndex = 0;
    let pollIndex = 0;

    sortedPosts.forEach((post, index) => {
      finalFeed.push({ id: post.id, type: 'post', data: post });

      // Every 5 posts, inject an element
      if ((index + 1) % 5 === 0) {
        const cycle = Math.floor(index / 5) % 3;
        
        if (cycle === 0) {
          // Inject Ad
          finalFeed.push({ 
            id: `ad-${index}`, 
            type: 'ad', 
            data: ads[adIndex % ads.length] || { sponsor: 'Skyline Social', content: 'Promoted Content' } 
          });
          adIndex++;
        } else if (cycle === 1) {
          // Inject Poll
          if (polls.length > 0) {
            const poll = polls[pollIndex % polls.length];
            finalFeed.push({ id: `poll-${poll.id}-${index}`, type: 'poll', data: poll });
            pollIndex++;
          }
        } else {
          // Inject Suggested Post (placeholder or most viral different from current list)
          finalFeed.push({ id: `suggested-${index}`, type: 'suggested', data: post });
        }
      }
    });

    return finalFeed;
  }
}
