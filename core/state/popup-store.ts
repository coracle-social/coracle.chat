type PopupState = {
  isVisible: boolean;
  currentPopup: string | null;
  popupStack: string[];
};

type PopupStore = {
  subscribe: (callback: (state: PopupState) => void) => () => void;
  set: (state: Partial<PopupState>) => void;
  showPopup: (popupType: string) => void;
  hidePopup: () => void;
  pushPopup: (popupType: string) => void;
  popPopup: () => void;
  clearPopups: () => void;
};

class PopupStoreImpl implements PopupStore {
  private state: PopupState = {
    isVisible: false,
    currentPopup: null,
    popupStack: []
  };

  private subscribers: Set<(state: PopupState) => void> = new Set();

  subscribe(callback: (state: PopupState) => void) {
    this.subscribers.add(callback);
    // Call immediately with current state
    callback(this.state);

    return () => {
      this.subscribers.delete(callback);
    };
  }

  set(newState: Partial<PopupState>) {
    this.state = { ...this.state, ...newState };
    this.notifySubscribers();
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.state));
  }

  showPopup = (popupType: string) => {
    this.set({
      isVisible: true,
      currentPopup: popupType,
      popupStack: [popupType]
    });
  };

  hidePopup = () => {
    this.set({
      isVisible: false,
      currentPopup: null,
      popupStack: []
    });
  };

  pushPopup = (popupType: string) => {
    const newStack = [...this.state.popupStack, popupType];
    this.set({
      currentPopup: popupType,
      popupStack: newStack
    });
  };

  popPopup = () => {
    if (this.state.popupStack.length <= 1) {
      this.hidePopup();
      return;
    }

    const newStack = this.state.popupStack.slice(0, -1);
    const previousPopup = newStack[newStack.length - 1];
    this.set({
      currentPopup: previousPopup,
      popupStack: newStack
    });
  };

  clearPopups = () => {
    this.set({
      isVisible: false,
      currentPopup: null,
      popupStack: []
    });
  };
}

export const popupStore = new PopupStoreImpl();
