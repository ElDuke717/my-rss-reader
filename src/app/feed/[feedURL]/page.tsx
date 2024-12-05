// src/app/feed/[feedUrl]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Feed } from "@/types/feed";
import { FeedList } from "@/components/FeedList";

export default function FeedPage({ params }: { params: { feedUrl: string } }) {
  const [feed, setFeed] = useState<Feed | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const decodedUrl = decodeURIComponent(params.feedUrl);
        const response = await fetch("/api/feeds", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: decodedUrl }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch feed");
        }

        const feedData = await response.json();
        setFeed(feedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load feed");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeed();
  }, [params.feedUrl]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !feed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">{error || "Failed to load feed"}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {feed.title}
          </h1>
          <div className="text-gray-700 font-medium">{feed.url}</div>
          {feed.description && (
            <p className="text-gray-600 mt-4">{feed.description}</p>
          )}
        </div>

        <FeedList
          feeds={[feed]}
          itemsPerFeed={feed.items.length} // Show all items on the feed page
        />
      </div>
    </div>
  );
}
