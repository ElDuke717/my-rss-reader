// src/utils/feedUtils.ts
import axios from 'axios';
import Parser from 'rss-parser';

const parser = new Parser({
  customFields: {
    item: [
      ['content:encoded', 'content'],
      ['description', 'description'],
    ],
  },
});

// Use a CORS proxy
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

export async function parseFeed(url: string): Promise<Feed | null> {
  try {
    console.log('Fetching feed from URL:', url); // Debug log

    // Use CORS proxy to fetch the feed
    const proxyUrl = `${CORS_PROXY}${encodeURIComponent(url)}`;
    console.log('Proxy URL:', proxyUrl); // Debug log

    const response = await axios.get(proxyUrl, {
      headers: {
        'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml',
      },
      timeout: 10000, // 10 second timeout
    });

    console.log('Feed response status:', response.status); // Debug log

    if (!response.data) {
      throw new Error('No data received from feed');
    }

    // Parse the feed content
    const feed = await parser.parseString(response.data);
    console.log('Parsed feed title:', feed.title); // Debug log
    
    return {
      url,
      title: feed.title || 'Untitled Feed',
      description: feed.description,
      items: feed.items.map(item => ({
        title: item.title || 'Untitled',
        link: item.link || '',
        pubDate: item.pubDate || new Date().toISOString(),
        content: item.content || item.description,
        author: item.creator || item.author,
        description: item.description
      })),
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Detailed feed parsing error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      url
    });
    throw error; // Re-throw to handle in the API route
  }
}