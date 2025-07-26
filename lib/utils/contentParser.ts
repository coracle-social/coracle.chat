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

  const firstLine = text.split('\n')[0].trim();

  // Parse the first line with Welshman parser to remove Nostr entities
  const parsedElements = parse({
    content: firstLine,
    tags: [] // No tags needed for title parsing
  });

  // Remove Nostr entities (profiles, events, etc.) from the text
  let cleanText = firstLine;
  parsedElements.forEach(element => {
    if (element.type === ParsedType.Profile || element.type === ParsedType.Event) {
      cleanText = cleanText.replace(element.raw, '');
    }
  });

  cleanText = cleanText.replace(/\s+/g, ' ').trim();

  if (cleanText.length <= 100) {
    return cleanText;
  }

  const sentences = cleanText.split(/[.!?]+/);
  const firstSentence = sentences[0].trim();

  return firstSentence.length > 0 ? firstSentence : cleanText.substring(0, 100);
};

export interface WebsitePreview {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  domain: string;
}

export const extractUrls = (text: string): string[] => {
  const urlRegex = /https?:\/\/[^\s]+/g;
  return text.match(urlRegex) || [];
};

export const extractMediaUrls = (urls: string[]): string[] => {
  const mediaExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.mov', '.avi', '.webm'];
  return urls.filter(url => {
    const lowerUrl = url.toLowerCase();
    return mediaExtensions.some(ext => lowerUrl.includes(ext)) ||
           lowerUrl.includes('media.') ||
           lowerUrl.includes('cdn.') ||
           lowerUrl.includes('images.');
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

  // Remove URLs and hashtags from text for cleaner display
  let cleanText = content;
  urls.forEach(url => {
    cleanText = cleanText.replace(url, '');
  });
  hashtags.forEach(hashtag => {
    cleanText = cleanText.replace(hashtag, '');
  });

  return {
    text: cleanText.trim(),
    urls,
    mediaUrls,
    websiteUrls,
    hashtags,
  };
};

export const getDomain = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
};

export const createWebsitePreview = (url: string): WebsitePreview => {
  return {
    url,
    domain: getDomain(url),
  };
};

export const isImageUrl = (url: string): boolean => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const lowerUrl = url.toLowerCase();
  return imageExtensions.some(ext => lowerUrl.includes(ext)) ||
         lowerUrl.includes('media.') ||
         lowerUrl.includes('cdn.') ||
         lowerUrl.includes('images.');
};

export const isVideoUrl = (url: string): boolean => {
  const videoExtensions = ['.mp4', '.mov', '.avi', '.webm', '.mkv'];
  const lowerUrl = url.toLowerCase();
  return videoExtensions.some(ext => lowerUrl.includes(ext));
};
