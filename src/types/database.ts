// src/types/database.ts
export interface UserFeed {
    id: string;
    user_id: string;
    feed_url: string;
    feed_title: string;
    created_at: string;
    last_fetched: string;
  }