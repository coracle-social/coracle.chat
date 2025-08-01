import { ComponentStyles } from '@/core/env/ComponentStyles';
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
    backgroundColor: 'transparent',
    ...ComponentStyles.modal,
    margin: 0,
    alignItems: 'center',
    minWidth: 300,
    maxWidth: 500,
  },
});
