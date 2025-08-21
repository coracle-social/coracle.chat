import { repository } from '@welshman/app';
import { Filter, isChildOf, NOTE } from '@welshman/util';
import { loadCommentsForEvents } from './relayLoadingUtils';

export interface CommentThread {
  comment: any;
  replies: any[];
  replyCount: number;
  totalReplies: number; // Including nested replies
}

export interface CommentData {
  topLevelComments: CommentThread[];
  totalCommentCount: number;
}

export const getLocalCommentCount = (eventId: string): number => {
  const commentFilter = {
    kinds: [NOTE],
    '#e': [eventId],
  };

  const comments = repository.query([commentFilter]);
  return comments.filter(comment => comment.id !== eventId).length;
};

export const getTopLevelComments = async (eventId: string, limit: number = 3): Promise<CommentData> => {
  console.log(`[COMMENT-UTILS] Getting top-level comments for event: ${eventId}`);

  // Load comments from relays if needed
  await loadCommentsForEvents([eventId], {
    onCommentEvent: (event, url) => {
      console.log(`[COMMENT-UTILS] Comment event loaded from relay: ${url}`, event.id);
    }
  });

  // Get all comments that reference this event
  const commentFilter: Filter = {
    kinds: [NOTE],
    '#e': [eventId],
  };

  const allComments = repository.query([commentFilter]);
  const actualComments = allComments.filter(comment => comment.id !== eventId);

  console.log(`[COMMENT-UTILS] Found ${actualComments.length} total comments`);

  // Separate top-level comments from replies
  const topLevelComments: any[] = [];
  const replyComments: any[] = [];

  actualComments.forEach(comment => {
    if (isTopLevelComment(comment, eventId)) {
      topLevelComments.push(comment);
    } else {
      replyComments.push(comment);
    }
  });

  console.log(`[COMMENT-UTILS] Top-level comments: ${topLevelComments.length}, Replies: ${replyComments.length}`);

  // Sort top-level comments by popularity (reply count + creation time)
  const sortedTopLevelComments = topLevelComments.sort((a, b) => {
    const aReplies = getRepliesForComment(a.id, replyComments).length;
    const bReplies = getRepliesForComment(b.id, replyComments).length;

    // Sort by reply count first, then by creation time
    if (aReplies !== bReplies) {
      return bReplies - aReplies;
    }
    return b.created_at - a.created_at;
  });

  // Take the top comments based on limit
  const limitedTopLevelComments = sortedTopLevelComments.slice(0, limit);

  // Build comment threads with replies
  const commentThreads: CommentThread[] = limitedTopLevelComments.map(comment => {
    const replies = getRepliesForComment(comment.id, replyComments);
    const totalReplies = getTotalReplyCount(comment.id, replyComments);

    return {
      comment,
      replies: replies.slice(0, 3), // Show first 3 replies
      replyCount: replies.length,
      totalReplies
    };
  });

  return {
    topLevelComments: commentThreads,
    totalCommentCount: actualComments.length
  };
};

export const getAllComments = async (eventId: string): Promise<any[]> => {
  console.log(`[COMMENT-UTILS] Getting all comments for event: ${eventId}`);

  const commentFilter: Filter = {
    kinds: [NOTE],
    '#e': [eventId],
  };

  let comments = repository.query([commentFilter]);
  let actualComments = comments.filter(comment => comment.id !== eventId);

  console.log(`[COMMENT-UTILS] Found ${actualComments.length} local comments for event ${eventId}`);

  // If no comments found locally, try loading from relays
  if (actualComments.length === 0) {
    console.log(`[COMMENT-UTILS] No comments found locally, loading from relays...`);
    await loadCommentsForEvents([eventId], {
      onCommentEvent: (event, url) => {
        console.log(`[COMMENT-UTILS] Comment event loaded from relay: ${url}`, event.id);
      }
    });

    // Query again after loading from relays
    comments = repository.query([commentFilter]);
    actualComments = comments.filter(comment => comment.id !== eventId);
    console.log(`[COMMENT-UTILS] After relay load: ${actualComments.length} comments`);
  }

  // Sort by creation time (oldest first)
  const sortedComments = actualComments.sort((a, b) => a.created_at - b.created_at);

  console.log(`[COMMENT-UTILS] Retrieved ${sortedComments.length} comments for event ${eventId}`);

  return sortedComments;
};

export const isTopLevelComment = (comment: any, originalEvent: any): boolean => {
  return isChildOf(comment, originalEvent);
};

export const getRepliesForComment = (comment: any, allReplies: any[]): any[] => {
  return allReplies.filter(reply => isChildOf(reply, comment)).sort((a, b) => a.created_at - b.created_at);
};

export const getTotalReplyCount = (commentId: string, allReplies: any[]): number => {
  const directReplies = getRepliesForComment(commentId, allReplies);
  let totalCount = directReplies.length;

  // Recursively count nested replies
  directReplies.forEach(reply => {
    totalCount += getTotalReplyCount(reply.id, allReplies);
  });

  return totalCount;
};
