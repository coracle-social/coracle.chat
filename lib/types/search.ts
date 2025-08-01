
export interface BareEvent {
  event: any; // The raw Nostr event
  id: string; // Unique identifier
  type: 'profile' | 'content';
  // Minimal metadata that's actually needed
  authorPubkey?: string;
  verified?: boolean;
  followerCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
  // Content-specific fields (optional)
  emojiCount?: number; // Total emoji reaction count
  replyCount?: number;
  // WoT-specific fields (optional)
  wotScore?: number;
  trustLevel?: 'high' | 'medium' | 'low' | 'negative';
  networkDistance?: number;
}

/**
 * WoT search options interface
 */
export interface WotSearchOptions {
  minScore?: number;
  maxScore?: number;
  trustLevels?: ('high' | 'medium' | 'low' | 'negative')[];
  networkDistance?: number;
  hasProfile?: boolean;
  hasNip05?: boolean;
  recentActivity?: boolean;
  limit?: number;
}

/**
 * Options for profile search operations
 */
export interface ProfileSearchOptions {
  term: string;
  isLoadMore?: boolean;
  offset?: number;
  limit?: number;
  profileSearchStore?: any;
}

/**
 * Result of a profile search operation
 */
export interface ProfileSearchResult {
  results: BareEvent[]; // Changed from SearchResult[] to BareEvent[]
  newOffset: number;
}

/**
 * Options for content search operations
 */
export interface ContentSearchOptions {
  term: string;
  isLoadMore?: boolean;
  offset?: number;
  limit?: number;
}

/**
 * Result of a content search operation
 */
export interface ContentSearchResult {
  results: BareEvent[];
  newOffset: number;
}
