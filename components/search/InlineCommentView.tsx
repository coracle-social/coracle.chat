import { spacing } from '@/core/env/Spacing';
import { CloseButton } from '@/lib/components/CloseButton';
import { StandardTextInput } from '@/lib/components/StandardTextInput';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { CommentData, getAllComments, getTopLevelComments } from '@/lib/utils/commentUtils';
import { publishComment } from '@/lib/utils/dataHandling';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CommentView } from './CommentView';

interface InlineCommentViewProps {
  eventId: string;
  isVisible: boolean;
  onClose?: () => void;
  showAllComments?: boolean;
  onLoginRequired?: (message: string, type?: 'info' | 'warning' | 'error' | 'success') => void;
}

export const InlineCommentView: React.FC<InlineCommentViewProps> = ({
  eventId,
  isVisible,
  onClose,
  showAllComments = false,
  onLoginRequired
}) => {
  const colors = useThemeColors();

  const [commentData, setCommentData] = useState<CommentData | null>(null);
  const [allComments, setAllComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // Extract unique pubkeys from comments for profile loading
  const commentPubkeys = React.useMemo(() => {
    const pubkeys = new Set<string>();

    if (showAllComments) {
      allComments.forEach(comment => {
        if (comment.pubkey) pubkeys.add(comment.pubkey);
      });
    } else if (commentData) {
      commentData.topLevelComments.forEach(thread => {
        if (thread.comment.pubkey) pubkeys.add(thread.comment.pubkey);
        thread.replies.forEach(reply => {
          if (reply.pubkey) pubkeys.add(reply.pubkey);
        });
      });
    }

    return Array.from(pubkeys);
  }, [showAllComments, allComments, commentData]);

  useEffect(() => {
    if (isVisible) {
      loadComments();
    }
  }, [eventId, isVisible, showAllComments]);

  const loadComments = async () => {
    try {
      setLoading(true);
      setError(null);

      if (showAllComments) {
        // Load all comments for full view
        const comments = await getAllComments(eventId);
        setAllComments(comments);
        setCommentData(null);
      } else {
        // Load top-level comments with replies
        //currently not working??
        const data = await getTopLevelComments(eventId, 3);
        setCommentData(data);
        setAllComments([]);
      }
    } catch (err) {
      console.error('[INLINE-COMMENT] Error loading comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

    const handlePostComment = async () => {
    if (!commentText.trim()) return;

    setIsPosting(true);

    try {
      console.log('[INLINE-COMMENT] Posting comment:', commentText);

      // Publish the comment using the data handling function
      await publishComment(commentText.trim(), eventId);

      console.log('[INLINE-COMMENT] Comment published successfully');

      // Clear the input
      setCommentText('');

      // Reload comments to show the new comment
      await loadComments();
    } catch (err) {
      console.error('[INLINE-COMMENT] Error posting comment:', err);

      // Check if it's an authentication error
      const errorMessage = err instanceof Error ? err.message : 'Failed to post comment';
      if (errorMessage.includes('No user logged in')) {
        if (onLoginRequired) {
          onLoginRequired('You must login to post comments', 'warning');
        }
      }
      // Don't show Alert for auth errors since we have slideup popup
    } finally {
      setIsPosting(false);
    }
  };

  if (!isVisible) {
    return null;
  }

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surfaceVariant }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Comments
          </Text>
          <CloseButton onPress={handleClose} size="small" />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.placeholder }]}>
            Loading comments...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surfaceVariant }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            All Comments
          </Text>
          <CloseButton onPress={handleClose} size="small" />
        </View>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
          </Text>
          <TouchableOpacity onPress={loadComments} style={styles.retryButton}>
            <Text style={[styles.retryText, { color: colors.primary }]}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const hasComments = showAllComments ? allComments.length > 0 : (commentData?.topLevelComments.length || 0) > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceVariant }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Comments
        </Text>
        <CloseButton onPress={handleClose} size="small" />
      </View>

      {/* Comments */}
      <ScrollView style={styles.commentsContainer} showsVerticalScrollIndicator={false}>
        {!hasComments ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.placeholder }]}>
              No comments yet. Be the first to comment!
            </Text>
          </View>
        ) : showAllComments ? (
          // Show all comments in chronological order
          allComments.map((comment) => (
            <CommentView
              key={comment.id}
              comment={comment}
              isTopLevel={true}
            />
          ))
        ) : (
          // Show top-level comments with replies
          commentData?.topLevelComments.map((thread) => (
            <CommentView
              key={thread.comment.id}
              comment={thread.comment}
              totalReplies={thread.replyCount}
              isTopLevel={true}
            />
          ))
        )}
      </ScrollView>

      {/* Show "View All Comments" button if not in full view */}
      {!showAllComments && commentData && commentData.totalCommentCount > 3 && (
        <View style={styles.viewAllContainer}>
          <TouchableOpacity
            style={[styles.viewAllButton, { borderColor: colors.border }]}
            onPress={() => {
              // This would typically navigate to full comment view
              Alert.alert('View All Comments', 'This would open the full comment view');
            }}
          >
            <Text style={[styles.viewAllText, { color: colors.primary }]}>
              View all {commentData.totalCommentCount} comments
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Comment Input */}
      <View style={[styles.commentInputContainer, { borderTopColor: colors.border }]}>
        <StandardTextInput
          placeholder="Write a comment..."
          value={commentText}
          onChangeText={setCommentText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.postButton,
            {
              backgroundColor: commentText.trim() ? colors.primary : colors.surfaceVariant,
              opacity: commentText.trim() && !isPosting ? 1 : 0.6
            }
          ]}
          onPress={handlePostComment}
          disabled={!commentText.trim() || isPosting}
        >
          <Text style={[styles.postButtonText, {
            color: commentText.trim() ? colors.surface : colors.placeholder
          }]}>
            {isPosting ? 'Posting...' : 'Post'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing(1),
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1.5),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },

  commentsContainer: {
    maxHeight: 300, // Limit height for inline view
    paddingHorizontal: spacing(2),
  },
  commentContainer: {
    marginVertical: spacing(1),
    paddingVertical: spacing(1),
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing(0.5),
  },
  timestamp: {
    fontSize: 12,
    marginLeft: spacing(1),
  },
  commentContent: {
    marginBottom: spacing(0.5),
  },
  inlineEntity: {

    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing(0.25),
    marginVertical: spacing(0.1),
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  replyInfo: {
    marginTop: spacing(0.5),
  },
  replyCount: {
    fontSize: 12,
  },
  repliesContainer: {
    marginTop: spacing(1),
  },
  moreRepliesButton: {
    paddingVertical: spacing(0.5),
    marginTop: spacing(0.5),
  },
  moreRepliesText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    paddingVertical: spacing(3),
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  loadingContainer: {
    paddingVertical: spacing(3),
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
  },
  errorContainer: {
    paddingVertical: spacing(3),
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: spacing(2),
  },
  retryButton: {
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  retryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  viewAllContainer: {
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1.5),
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  viewAllButton: {
    paddingVertical: spacing(1),
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '500',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1.5),
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },

  postButton: {
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
    borderRadius: 12,
    marginLeft: spacing(1),
  },
  postButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  hashtag: {
    fontSize: 14,
    fontWeight: '500',
  },
  url: {
    fontSize: 14,
    fontWeight: '500',
  },
});
