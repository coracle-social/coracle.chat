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
