import { useState } from 'react';

interface UseSlideUpPopupReturn {
  isVisible: boolean;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  widthRatio: number;
  showPopup: (message: string, type?: 'info' | 'warning' | 'error' | 'success', duration?: number, widthRatio?: number) => void;
  hidePopup: () => void;
}

export const useSlideUpPopup = (): UseSlideUpPopupReturn => {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'warning' | 'error' | 'success'>('info');
  const [widthRatio, setWidthRatio] = useState(0.5);

  const showPopup = (
    newMessage: string,
    newType: 'info' | 'warning' | 'error' | 'success' = 'info',
    duration: number = 3550,
    newWidthRatio: number = 0.5
  ) => {
    setMessage(newMessage);
    setType(newType);
    setWidthRatio(newWidthRatio);
    setIsVisible(true);

    // Auto-hide after duration
    setTimeout(() => {
      hidePopup();
    }, duration);
  };

  const hidePopup = () => {
    setIsVisible(false);
  };

  return {
    isVisible,
    message,
    type,
    widthRatio,
    showPopup,
    hidePopup,
  };
};
