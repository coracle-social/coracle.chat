export interface QualityThresholds {
  minFollowers: number;
  minFollowing: number;
  minProfileInfo: boolean;

  minContentLength: number;
  maxContentLength: number;
  minEngagement: number;

  followerWeight: number;
  followingWeight: number;
  verificationWeight: number;
  engagementWeight: number;
  contentLengthWeight: number;
}

export interface SearchLimits {
  // Default limits for search results
  defaultProfileLimit: number;
  defaultContentLimit: number;

  // Limits for "load more" functionality
  profileLoadMoreLimit: number;
  contentLoadMoreLimit: number;

  // Relay loading limits
  relayProfileLimit: number;
  relayContentLimit: number;

  // WoT search limits
  wotSearchLimit: number;
}

export const DEFAULT_QUALITY_THRESHOLDS: QualityThresholds = {
  minFollowers: 2,
  minFollowing: 2,
  minProfileInfo: true,

  minContentLength: 10,
  maxContentLength: 10000,
  minEngagement: 1,

  followerWeight: 2.0,
  followingWeight: 0.5,
  verificationWeight: 0.3,
  engagementWeight: 1.0,
  contentLengthWeight: 0.1,
};

export const SEARCH_LIMITS: SearchLimits = {
  // Default limits for search results
  defaultProfileLimit: 50,
  defaultContentLimit: 50, // Changed from 50 for testing

  // Limits for "load more" functionality
  profileLoadMoreLimit: 50,
  contentLoadMoreLimit: 1, // Changed from 50 for testing

  // Relay loading limits
  relayProfileLimit: 50,
  relayContentLimit: 50,

  // WoT search limits
  wotSearchLimit: 50,
};
