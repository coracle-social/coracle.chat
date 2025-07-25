export type SearchResultType = 'profile' | 'content' | 'event' | 'group' | 'article';

//fields such as likes won't fill on initial search since those events must be separately found
//there's probably a better way to group it, rather than adding it later
export interface SearchResultMetadata {
  timestamp?: number; // Creation timestamp
  recentActivityTimestamp?: number; // Most recent activity timestamp
  author?: string;
  authorPubkey?: string;
  tags?: string[];
  verified?: boolean;
  trustScore?: number;
  viewCount?: number;
  likeCount?: number;
  replyCount?: number;
  repostCount?: number;
  reactions?: Record<string, number>;
  followerCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
  searchScore?: number; // Score from fuzzy search with weighted fields
  qualityScore?: number; // Quality score based on followers, following, verification
}

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title?: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string; //placeholder since we aren't actually querying images yet
  metadata: SearchResultMetadata;
  //raw event data for components to handle, may change so that components only receive event
  event: any;
  relays?: string[]; // Relays used to find this content
}

export interface SearchTab {
  id: string;
  label: string;
  icon?: string;
  count?: number;
  badge?: string;
  type?: SearchResultType;
}

export interface SortOption {
  id: string;
  label: string;
  icon?: string;
  field: 'relevance' | 'date' | 'popularity' | 'trust' | 'name';
  direction: 'asc' | 'desc';
}
//placeholder icons, may use a checkbox instead
export interface FilterOption {
  id: string;
  label: string;
  type: 'checkbox' | 'radio' | 'range' | 'select';
  value: any;
  options?: { label: string; value: any }[];
}
