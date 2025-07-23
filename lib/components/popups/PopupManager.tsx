import { usePopup } from '@/lib/hooks/usePopup';
import React, { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Layer2Popup } from './Layer2Popup';
import { Layer3Popup } from './Layer3Popup';
import { PortalPopup } from './PortalPopup';

export const PopupManager: React.FC = () => {
  const {
    isVisible,
    currentPopup,
    popupStack,
    showPopup,
    hidePopup,
    pushPopup,
    popPopup,
    clearPopups
  } = usePopup();

  useEffect(() => {
    if (!isVisible) return;

    const handleBackPress = () => {
      popPopup();
      return true; // Prevent default back action
    };

    if (Platform.OS === 'android') {
      const { BackHandler } = require('react-native');
      const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      return () => subscription.remove();
    } else if (Platform.OS === 'web') {
      //push a state so that back button does not trigger inter tab navigation
      const currentState = { modalOpen: true };
      window.history.pushState(currentState, '', window.location.href);

      const handlePopState = (event: PopStateEvent) => {
        popPopup();
        if (event.state?.modalOpen) {
          window.history.pushState(currentState, '', window.location.href);
        }
      };

      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
        // Clean up the state we added
        if (window.history.state?.modalOpen) {
          window.history.back();
        }
      };
    }
  }, [isVisible, popPopup]);

  if (!isVisible || !currentPopup) {
    return null;
  }

  const renderModal = (modalType: string, index: number) => {
    const isActive = index === popupStack.length - 1;
    const zIndex = 1000 + index;

    switch (modalType) {
      case 'portal':
        return (
          <View key={`modal-${index}`} style={[styles.modalLayer, { zIndex }]}>
            <PortalPopup visible={true} onClose={isActive ? hidePopup : () => {}} />
          </View>
        );
      case 'layer2':
        return (
          <View key={`modal-${index}`} style={[styles.modalLayer, { zIndex }]}>
            <Layer2Popup visible={true} onClose={isActive ? popPopup : () => {}} />
          </View>
        );
      case 'layer3':
        return (
          <View key={`modal-${index}`} style={[styles.modalLayer, { zIndex }]}>
            <Layer3Popup visible={true} onClose={isActive ? popPopup : () => {}} />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.modalContainer}>
      {popupStack.map((modalType, index) => renderModal(modalType, index))}
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
