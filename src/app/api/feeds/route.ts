// src/app/api/feeds/route.ts
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { parseFeed } from "@/utils/feedUtils";
import type { NextRequest } from "next/server";

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Check cache first
    const cached = cache.get(url);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Returning cached feed for:', url);
      return NextResponse.json(cached.data);
    }

    console.log('Fetching fresh feed for:', url);
    const feed = await parseFeed(url);
    
    if (!feed) {
      return NextResponse.json(
        { error: "Unable to parse feed" }, 
        { status: 400 }
      );
    }

    // Update cache
    cache.set(url, {
      data: feed,
      timestamp: Date.now()
    });

    return NextResponse.json(feed);
  } catch (error) {
    console.error('Feed processing error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to process feed';
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes('429')) {
        errorMessage = 'Rate limit exceeded. Please try again in a few minutes.';
        statusCode = 429;
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Unable to connect to feed server';
        statusCode = 503;
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Feed server took too long to respond';
        statusCode = 504;
      }
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: statusCode }
    );
  }
}