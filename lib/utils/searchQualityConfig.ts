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

/**
 * Quality filtering functions
 */
export const meetsProfileQualityThresholds = (
  followerCount: number,
  followingCount: number,
  hasVerification: boolean,
  hasProfileInfo: boolean,
  thresholds: QualityThresholds = DEFAULT_QUALITY_THRESHOLDS
): boolean => {
  const hasMinimalFollowers = followerCount >= thresholds.minFollowers;
  const hasMinimalFollowing = followingCount >= thresholds.minFollowing;
  const isVerified = hasVerification;
  const hasValidProfileInfo = !thresholds.minProfileInfo || hasProfileInfo;

  return (hasMinimalFollowers && hasMinimalFollowing) || isVerified || hasValidProfileInfo;
};

export const meetsContentQualityThresholds = (
  contentLength: number,
  likeCount: number,
  replyCount: number,
  repostCount: number,
  thresholds: QualityThresholds = DEFAULT_QUALITY_THRESHOLDS
): boolean => {
  const hasMinimalContent = contentLength >= thresholds.minContentLength;
  const hasReasonableLength = contentLength <= thresholds.maxContentLength;
  const hasMinimalEngagement = (likeCount + replyCount + repostCount) >= thresholds.minEngagement;
  const hasValidContent = contentLength > 0;

  return hasMinimalContent && hasValidContent && hasReasonableLength;
};

/**
 * Calculate quality scores
 */
export const calculateProfileQualityScore = (
  followerCount: number,
  followingCount: number,
  verificationScore: number,
  thresholds: QualityThresholds = DEFAULT_QUALITY_THRESHOLDS
): number => {
  return Math.min(
    (followerCount / 1000) * thresholds.followerWeight +
    (followingCount / 500) * thresholds.followingWeight +
    (verificationScore / 2) * thresholds.verificationWeight,
    1.0
  );
};

export const calculateContentQualityScore = (
  likeCount: number,
  replyCount: number,
  repostCount: number,
  contentLength: number,
  thresholds: QualityThresholds = DEFAULT_QUALITY_THRESHOLDS
): number => {
  return Math.min(
    (likeCount / 100) * thresholds.engagementWeight +
    (replyCount / 50) * thresholds.engagementWeight +
    (repostCount / 25) * thresholds.engagementWeight +
    (contentLength / 1000) * thresholds.contentLengthWeight,
    1.0
  );
};
