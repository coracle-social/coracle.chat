import { usePopup } from '@/lib/hooks/usePopup';
import { useCallback } from 'react';

// Global callback reference to share between hook instances
let globalEmojiCallback: ((emoji: string) => void) | null = null;

export const useEmojiPickerPopup = () => {
  const { showPopup, hidePopup } = usePopup();

  const openEmojiPicker = useCallback((onEmojiSelect: (emoji: string) => void) => {
    globalEmojiCallback = onEmojiSelect;
    showPopup('emoji-picker');
  }, [showPopup]);

  const handleEmojiSelect = useCallback((emoji: string) => {
    if (globalEmojiCallback) {
      const callback = globalEmojiCallback;
      globalEmojiCallback = null; // Clear before calling to prevent double calls
      callback(emoji);
      hidePopup(); // Hide popup after calling callback
    } else {
      hidePopup(); // Still hide popup even if no callback
    }
  }, [hidePopup]);

  return {
    openEmojiPicker,
    handleEmojiSelect
  };
};
