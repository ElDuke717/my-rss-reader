// src/app/api/feeds/route.ts
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { parseFeed } from "@/utils/feedUtils";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" }, 
        { status: 400 }
      );
    }

    try {
      new URL(url); // Validate URL format
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" }, 
        { status: 400 }
      );
    }

    const feed = await parseFeed(url);
    console.log('Parsed feed:', feed); // Debug log

    if (!feed) {
      return NextResponse.json(
        { error: "Unable to parse feed" }, 
        { status: 400 }
      );
    }

    return NextResponse.json(feed);
  } catch (error) {
    console.error('Detailed feed processing error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { 
        error: "Failed to process feed",
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}