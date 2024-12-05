// src/app/api/feed/route.ts
import { NextRequest } from 'next/server';
import Parser from 'rss-parser';

export async function GET(req: NextRequest) {
  // Create URL object from the request URL
  const url = new URL(req.url);
  const feedUrl = url.searchParams.get('url');

  if (!feedUrl) {
    return new Response(
      JSON.stringify({ error: 'URL is required' }), 
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  const parser = new Parser();
  try {
    const feed = await parser.parseURL(feedUrl);
    return new Response(
      JSON.stringify(feed), 
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch feed' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}