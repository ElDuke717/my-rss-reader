// src/components/FeedList.tsx
'use client';

import { Feed, FeedItem } from '@/types/feed';
import { format } from 'date-fns';
import DOMPurify from 'dompurify';
import Link from 'next/link';

interface FeedListProps {
  feeds: Feed[];
  onRemove?: (url: string) => void;
  itemsPerFeed?: number;
}

export function FeedList({ feeds, onRemove, itemsPerFeed = 3 }: FeedListProps) {
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'PPP');
    } catch {
      return dateStr;
    }
  };

  // Sort items by date and get latest n items
  const getLatestItems = (items: FeedItem[]) => {
    return [...items]
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
      .slice(0, itemsPerFeed);
  };

  const isHackerNewsFeed = (url: string) => {
    return url.includes('hnrss.org');
  };

  return (
    <div className="space-y-8">
      {feeds.map((feed) => (
        <div key={feed.url} className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <Link 
                  href={`/feed/${encodeURIComponent(feed.url)}`}
                  className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
                >
                  {feed.title}
                </Link>
                <div className="text-sm font-medium text-gray-700">
                  {feed.url}
                </div>
              </div>
              {onRemove && (
                <button
                  onClick={() => onRemove(feed.url)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
            {feed.description && (
              <p className="text-gray-600 mt-2">{feed.description}</p>
            )}
          </div>

          <div className="divide-y divide-gray-100">
            {getLatestItems(feed.items).map((item, index) => (
              <article key={item.link || index} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-gray-900">
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 transition-colors"
                    >
                      {item.title}
                    </a>
                  </h3>
                  
                  <div className="text-sm text-gray-600">
                    {item.pubDate && (
                      <time dateTime={item.pubDate} className="font-medium">
                        {formatDate(item.pubDate)}
                      </time>
                    )}
                    {item.author && (
                      <span className="ml-2">
                        by <span className="font-medium">{item.author}</span>
                      </span>
                    )}
                  </div>

                  {isHackerNewsFeed(feed.url) ? (
                    renderHackerNewsContent(item)
                  ) : (
                    item.description && (
                      <div 
                        className="text-gray-600 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(item.description)
                        }}
                      />
                    )
                  )}
                </div>
              </article>
            ))}
            <div className="p-4 bg-gray-50">
              <Link
                href={`/feed/${encodeURIComponent(feed.url)}`}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                View all articles →
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Helper function for Hacker News content
function renderHackerNewsContent(item: FeedItem) {
  const mainUrlMatch = item.content?.match(/Article URL: <a href="([^"]+)">/);
  const commentsUrlMatch = item.content?.match(/Comments URL: <a href="([^"]+)">/);
  const pointsMatch = item.content?.match(/Points: (\d+)/);
  const commentsMatch = item.content?.match(/# Comments: (\d+)/);

  const mainUrl = mainUrlMatch?.[1];
  const commentsUrl = commentsUrlMatch?.[1];
  const points = pointsMatch?.[1];
  const commentCount = commentsMatch?.[1];

  return (
    <div className="space-y-2">
      <div className="text-sm text-gray-600">
        {points && <span className="mr-3 font-medium">{points} points</span>}
        {commentCount && (
          <a 
            href={commentsUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            {commentCount} comments
          </a>
        )}
      </div>
      {mainUrl && (
        <a 
          href={mainUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 font-medium inline-block"
        >
          Read article →
        </a>
      )}
    </div>
  );
}