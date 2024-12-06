// src/app/feed/[feedUrl]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Feed } from '@/types/feed';
import { FeedList } from '@/components/FeedList';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function FeedPage() {
  const [feed, setFeed] = useState<Feed | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get the full pathname and extract the feedUrl
  const pathname = usePathname();
  const feedUrl = pathname?.split('/feed/')?.[1];

  const fetchFeed = async (url: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching feed for URL:', url);

      const response = await fetch('/api/feeds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to fetch feed');
      }

      setFeed(data);
    } catch (err) {
      console.error('Error in fetchFeed:', err);
      setError(err instanceof Error ? err.message : 'Failed to load feed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('Current pathname:', pathname);
    console.log('Extracted feedUrl:', feedUrl);

    if (!feedUrl) {
      setError('No feed URL provided');
      setIsLoading(false);
      return;
    }

    try {
      const decodedUrl = decodeURIComponent(feedUrl);
      console.log('Decoded URL:', decodedUrl);
      fetchFeed(decodedUrl);
    } catch (err) {
      console.error('Error decoding URL:', err);
      setError('Invalid feed URL');
      setIsLoading(false);
    }
  }, [pathname, feedUrl]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading feed...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Feed</h1>
            <p className="text-gray-700 mb-4">{error}</p>
            {feedUrl && (
              <div className="text-sm text-gray-500 mb-4">
                Feed URL: {decodeURIComponent(feedUrl)}
              </div>
            )}
            <div className="space-x-4">
              <button
                onClick={() => {
                  if (feedUrl) {
                    const decodedUrl = decodeURIComponent(feedUrl);
                    fetchFeed(decodedUrl);
                  }
                }}
                className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
              >
                Try Again
              </button>
              <Link 
                href="/dashboard" 
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!feed) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">No Feed Data Available</h1>
            <Link 
              href="/dashboard" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{feed.title}</h1>
            <Link 
              href="/dashboard" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
          <div className="text-gray-700 font-medium">
            {decodeURIComponent(feedUrl)}
          </div>
          {feed.description && (
            <p className="text-gray-600 mt-4">{feed.description}</p>
          )}
        </div>

        <FeedList 
          feeds={[feed]} 
          itemsPerFeed={feed.items.length} 
        />
      </div>
    </div>
  );
}