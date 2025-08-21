import { popupStore } from '@/lib/stores/popup-store';
import { useStore } from '@/lib/stores/useWelshmanStore2';

export const usePopup = () => {
  const [state] = useStore(popupStore);

  if (!state) {
    return {
      isVisible: false,
      currentPopup: null,
      popupStack: [],
      showPopup: popupStore.showPopup,
      hidePopup: popupStore.hidePopup,
      pushPopup: popupStore.pushPopup,
      popPopup: popupStore.popPopup,
      clearPopups: popupStore.clearPopups
    };
  }

  return {
    ...state,
    showPopup: popupStore.showPopup,
    hidePopup: popupStore.hidePopup,
    pushPopup: popupStore.pushPopup,
    popPopup: popupStore.popPopup,
    clearPopups: popupStore.clearPopups
  };
};
