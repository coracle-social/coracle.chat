import { parse, ParsedType } from '@welshman/content';

export interface ParsedContent {
  text: string;
  urls: string[];
  mediaUrls: string[];
  websiteUrls: string[];
  hashtags: string[];
}

export const extractTitle = (text: string): string => {
  if (!text) return '';

  const lines = text.split('\n').filter(line => line.trim().length > 0);

  // Try each line until we find one with actual text content
  for (const line of lines) {
    const trimmedLine = line.trim();

    // Parse the line with Welshman parser to remove Nostr entities
  const parsedElements = parse({
      content: trimmedLine,
    tags: [] // No tags needed for title parsing
  });

      // Remove Nostr entities (profiles, events, etc.) from the text
    let cleanText = trimmedLine;
    parsedElements.forEach(element => {
      if (element.type === ParsedType.Profile || element.type === ParsedType.Event) {
        cleanText = cleanText.replace(element.raw, '');
      }
    });

    // Also remove regular URLs
    const urlRegex = /https?:\/\/[^\s]+/g;
    cleanText = cleanText.replace(urlRegex, '');

    cleanText = cleanText.replace(/\s+/g, ' ').trim();

    // If we found actual text content, use it
    if (cleanText.length > 0) {
  if (cleanText.length <= 100) {
    return cleanText;
  }

  const sentences = cleanText.split(/[.!?]+/);
  const firstSentence = sentences[0].trim();

  return firstSentence.length > 0 ? firstSentence : cleanText.substring(0, 100);
    }
  }

  // If no text content found, return a default
  return 'Content';
};



export const extractUrls = (text: string): string[] => {
  const urls: string[] = [];

  // Extract plain URLs
  const plainUrlRegex = /https?:\/\/[^\s]+/g;
  const plainUrls = text.match(plainUrlRegex) || [];
  urls.push(...plainUrls);

  // Extract markdown links [text](url)
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  while ((match = markdownLinkRegex.exec(text)) !== null) {
    const url = match[2];
    if (url.startsWith('http')) {
      urls.push(url);
    }
  }

  // Extract markdown images ![alt](url)
  const markdownImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  while ((match = markdownImageRegex.exec(text)) !== null) {
    const url = match[2];
    if (url.startsWith('http')) {
      urls.push(url);
    }
  }

  // Remove duplicates while preserving order
  return [...new Set(urls)];
};

export const extractMediaUrls = (urls: string[]): string[] => {
  const mediaExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.mov', '.avi', '.webm'];
  const imageDomains = [
    'media.', 'cdn.', 'images.', 'img.', 'static.', 'assets.',
    'wp-content/uploads', 'uploads', 'media-library'
  ];

  return urls.filter(url => {
    const lowerUrl = url.toLowerCase();

    // Check for media file extensions
    if (mediaExtensions.some(ext => lowerUrl.includes(ext))) {
      return true;
    }

    // Check for image hosting domains
    if (imageDomains.some(domain => lowerUrl.includes(domain))) {
      return true;
    }

    // Check for common image patterns
    if (lowerUrl.includes('/wp-content/uploads/') ||
        lowerUrl.includes('/uploads/') ||
        lowerUrl.includes('/images/') ||
        lowerUrl.includes('/media/')) {
      return true;
    }

    return false;
  });
};

export const extractWebsiteUrls = (urls: string[]): string[] => {
  const mediaUrls = extractMediaUrls(urls);
  return urls.filter(url => !mediaUrls.includes(url));
};

export const extractHashtags = (text: string): string[] => {
  const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
  return text.match(hashtagRegex) || [];
};

export const parseContent = (content: string): ParsedContent => {
  const urls = extractUrls(content);
  const mediaUrls = extractMediaUrls(urls);
  const websiteUrls = extractWebsiteUrls(urls);
  const hashtags = extractHashtags(content);

  // Keep original content with URLs and hashtags intact
  const text = content;

  return {
    text,
    urls,
    mediaUrls,
    websiteUrls,
    hashtags,
  };
};

export const getDomain = (url: string): string => {
  const urlObj = new URL(url);
  return urlObj.hostname.replace('www.', '');
};



export const isVideoUrl = (url: string): boolean => {
  const videoExtensions = ['.mp4', '.mov', '.avi', '.webm', '.mkv'];
  const lowerUrl = url.toLowerCase();
  return videoExtensions.some(ext => lowerUrl.includes(ext));
};
