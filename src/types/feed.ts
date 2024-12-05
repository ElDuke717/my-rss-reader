export interface FeedItem {
  id?: string;
  title: string;
  link: string;
  pubDate: string;
  content?: string;
  description?: string;
  author?: string;
}

export interface Feed {
  id?: string;
  url: string;
  title: string;
  description?: string;
  items: FeedItem[];
  lastUpdated?: string;
}

export interface FeedCollection {
  id: string;
  name: string;
  feeds: Feed[];
  userId: string;
}
