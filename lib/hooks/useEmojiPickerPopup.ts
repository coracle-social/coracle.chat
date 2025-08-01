import { usePopup } from '@/lib/hooks/usePopup';
import { useCallback, useRef } from 'react';

export const useEmojiPickerPopup = () => {
  const { showPopup, hidePopup } = usePopup();
  const emojiCallbackRef = useRef<((emoji: string) => void) | null>(null);

  const openEmojiPicker = useCallback((onEmojiSelect: (emoji: string) => void) => {
    emojiCallbackRef.current = onEmojiSelect;
    showPopup('emoji-picker');
  }, [showPopup]);

  const handleEmojiSelect = useCallback((emoji: string) => {
    if (emojiCallbackRef.current) {
      emojiCallbackRef.current(emoji);
      emojiCallbackRef.current = null;
    }
    hidePopup();
  }, [hidePopup]);

  return {
    openEmojiPicker,
    handleEmojiSelect
  };
};
