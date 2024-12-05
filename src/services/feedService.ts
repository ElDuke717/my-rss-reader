// src/services/feedService.ts
import { supabase } from '@/utils/supabase';
import type { Feed } from '@/types/feed';

export class FeedService {
  static async fetchFeed(url: string): Promise<Feed | null> {
    try {
      const response = await fetch('/api/feeds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch feed');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching feed:', error);
      return null;
    }
  }

  static async getUserFeeds(userId: string): Promise<Feed[]> {
    const { data: dbFeeds, error } = await supabase
      .from('user_feeds')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    const feedPromises = dbFeeds.map(dbFeed => 
      this.fetchFeed(dbFeed.feed_url)
    );

    const fetchedFeeds = await Promise.all(feedPromises);
    return fetchedFeeds.filter((feed): feed is Feed => feed !== null);
  }

  static async addUserFeed(userId: string, feed: Feed): Promise<void> {
    const { error } = await supabase
      .from('user_feeds')
      .upsert({
        user_id: userId,
        feed_url: feed.url,
        feed_title: feed.title,
        last_fetched: new Date().toISOString()
      });

    if (error) throw error;
  }

  static async removeUserFeed(userId: string, feedUrl: string): Promise<void> {
    const { error } = await supabase
      .from('user_feeds')
      .delete()
      .eq('user_id', userId)
      .eq('feed_url', feedUrl);

    if (error) throw error;
  }
}