// src/app/dashboard/page.tsx
'use client';

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { AddFeed } from "@/components/AddFeed";
import { FeedList } from "@/components/FeedList";
import type { Feed } from "@/types/feed";
import { supabase } from "@/utils/supabase";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load feeds from both local storage and database
  useEffect(() => {
    if (isLoaded && user) {
      loadFeeds();
    }
  }, [isLoaded, user]);

  const loadFeeds = async () => {
    try {
      // Load from local storage first
      const localFeeds = localStorage.getItem('rssFeeds');
      if (localFeeds) {
        setFeeds(JSON.parse(localFeeds));
      }

      if (user) {
        // Then load from database
        const { data: dbFeeds, error } = await supabase
          .from('user_feeds')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;

        // Fetch actual feed content for each saved feed
        const feedPromises = dbFeeds.map(dbFeed => 
          fetchFeed(dbFeed.feed_url)
        );

        const fetchedFeeds = await Promise.all(feedPromises);
        const validFeeds = fetchedFeeds.filter((feed): feed is Feed => feed !== null);
        
        setFeeds(validFeeds);
        // Update local storage with fetched feeds
        localStorage.setItem('rssFeeds', JSON.stringify(validFeeds));
      }
    } catch (err) {
      console.error('Error loading feeds:', err);
      setError(err instanceof Error ? err.message : 'Failed to load feeds');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFeed = async (url: string): Promise<Feed | null> => {
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
  };

  const handleAddFeed = async (url: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const feed = await fetchFeed(url);
      
      if (!feed) {
        throw new Error('Failed to fetch feed');
      }

      // Save to database if user is logged in
      if (user) {
        const { error: dbError } = await supabase
          .from('user_feeds')
          .upsert({
            user_id: user.id,
            feed_url: url,
            feed_title: feed.title,
            last_fetched: new Date().toISOString()
          });

        if (dbError) throw dbError;
      }

      // Update state and local storage
      const updatedFeeds = [...feeds, feed];
      setFeeds(updatedFeeds);
      localStorage.setItem('rssFeeds', JSON.stringify(updatedFeeds));

    } catch (error) {
      console.error('Feed addition error:', error);
      setError(error instanceof Error ? error.message : 'Failed to add feed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFeed = async (url: string) => {
    try {
      // Remove from database if user is logged in
      if (user) {
        const { error: dbError } = await supabase
          .from('user_feeds')
          .delete()
          .eq('user_id', user.id)
          .eq('feed_url', url);

        if (dbError) throw dbError;
      }

      // Update state and local storage
      const updatedFeeds = feeds.filter(feed => feed.url !== url);
      setFeeds(updatedFeeds);
      localStorage.setItem('rssFeeds', JSON.stringify(updatedFeeds));

    } catch (error) {
      console.error('Error removing feed:', error);
      setError(error instanceof Error ? error.message : 'Failed to remove feed');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Please sign in to access your RSS feeds
          </h1>
          <a
            href="/sign-in"
            className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your RSS Feeds</h1>
          <div className="text-sm text-gray-600">
            Welcome, {user.firstName || user.emailAddresses[0]?.emailAddress}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Feed</h2>
          <AddFeed onAdd={handleAddFeed} />
          {error && (
            <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
              {error}
            </div>
          )}
        </div>

        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {feeds.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No feeds yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first RSS feed.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <FeedList 
              feeds={feeds} 
              onRemove={handleRemoveFeed} 
            />
          </div>
        )}
      </div>

      {/* Quick start guide */}
      {feeds.length === 0 && (
        <div className="max-w-4xl mx-auto px-4 pb-8">
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              Quick Start Guide
            </h3>
            <p className="text-sm text-blue-700 mb-4">
              Try these popular RSS feeds to get started:
            </p>
            <ul className="list-disc list-inside text-sm text-blue-600 space-y-1">
              <li>https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml</li>
              <li>https://feeds.feedburner.com/TechCrunch</li>
              <li>https://hnrss.org/frontpage</li>
              <li>https://www.reddit.com/.rss</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}