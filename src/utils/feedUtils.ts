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

// Array of CORS proxies to use as fallbacks
const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://cors-anywhere.herokuapp.com/',
  'https://cors-proxy.htmldriven.com/?url=',
];

// Add delay between requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function parseFeed(url: string) {
  let lastError = null;

  // Try each proxy in sequence
  for (const proxy of CORS_PROXIES) {
    try {
      console.log(`Attempting to fetch feed with proxy: ${proxy}`);
      
      // Add delay between attempts
      await delay(1000);

      const proxyUrl = `${proxy}${encodeURIComponent(url)}`;
      const response = await axios.get(proxyUrl, {
        headers: {
          'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml',
        },
        timeout: 10000,
      });

      if (!response.data) {
        throw new Error('No data received from feed');
      }

      const feed = await parser.parseString(response.data);
      
      return {
        url,
        title: feed.title || 'Untitled Feed',
        description: feed.description,
        items: (feed.items || []).map(item => ({
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
      console.error(`Failed to fetch with proxy ${proxy}:`, error);
      lastError = error;
      continue; // Try next proxy
    }
  }

  // If all proxies failed, throw the last error
  throw new Error(
    lastError instanceof Error 
      ? `Feed fetch failed: ${lastError.message}`
      : 'Failed to fetch feed from all available proxies'
  );
}