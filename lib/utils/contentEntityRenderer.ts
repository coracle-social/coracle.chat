import { isEvent, isProfile, parse } from '@welshman/content';
import { parseContent } from './contentParser';

export interface NostrEntity {
  pubkey?: string;
  id?: string;
  relays: string[];
  raw: string;
  type: 'profile' | 'event';
}

export interface ContentEntityData {
  profiles: NostrEntity[];
  events: NostrEntity[];
  hashtags: string[];
  urls: string[];
}

export const extractNostrEntities = (contentText: string, tags: string[][] = [], authorPubkey?: string): ContentEntityData => {
  // Parse content with Welshman parser to extract profiles and events
  const parsedElements = parse({
    content: contentText,
    tags: tags
  });

  const profiles = parsedElements
    .filter(element => isProfile(element))
    .map(element => ({
      pubkey: element.value.pubkey,
      relays: element.value.relays || [],
      raw: element.raw,
      type: 'profile' as const
    }))
    .filter(profile => profile.pubkey !== authorPubkey);

  const events = parsedElements
    .filter(element => isEvent(element))
    .map(element => ({
      id: element.value.id,
      relays: element.value.relays || [],
      raw: element.raw,
      type: 'event' as const
    }));

  // Parse content to get hashtags and URLs
  const parsedContent = parseContent(contentText);
  const hashtags = parsedContent.hashtags || [];
  const urls = parsedContent.urls || [];

  return { profiles, events, hashtags, urls };
};
