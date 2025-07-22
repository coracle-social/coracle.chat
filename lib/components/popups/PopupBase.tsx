import React from 'react';
import { createPortal } from 'react-dom';
import { Modal, Platform, Pressable, StyleSheet } from 'react-native';

interface PopupBaseProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  animationType?: 'none' | 'slide' | 'fade';
}

export const PopupBase: React.FC<PopupBaseProps> = ({
  visible,
  onClose,
  children,
  animationType = 'fade'
}) => {
  const modalElement = (
    <Modal
      animationType={animationType}
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={onClose}
      >
        <Pressable style={styles.modalContainer} onPress={() => {}}>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );

  // Use portal on web, regular modal on native
  if (Platform.OS === 'web') {
    return createPortal(modalElement, document.body);
  }

  return modalElement;
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    margin: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 300,
    maxWidth: 500,
  },
});
