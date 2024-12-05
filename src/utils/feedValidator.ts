// src/utils/feedValidator.ts
export function isValidFeedUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      return ['http:', 'https:'].includes(parsedUrl.protocol);
    } catch {
      return false;
    }
  }
  
  export function sanitizeFeedUrl(url: string): string {
    // Remove any whitespace
    url = url.trim();
    
    // Ensure the URL starts with http:// or https://
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    return url;
  }