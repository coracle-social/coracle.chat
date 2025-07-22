import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { PopupBase } from './PopupBase';

interface Layer3PopupProps {
  visible: boolean;
  onClose: () => void;
}

export const Layer3Popup: React.FC<Layer3PopupProps> = ({ visible, onClose }) => {
  return (
    <PopupBase visible={visible} onClose={onClose} animationType="slide">
      <Text style={styles.modalTitle}>Nested Popup (Layer 3)</Text>
      <Text style={styles.modalText}>
        This is the third and final layer popup. This is as deep as we go!
      </Text>
      <Text style={styles.modalText}>
        The back button should close this popup first, then Layer 2, then Layer 1.
      </Text>

      <TouchableOpacity
        style={styles.modalButton}
        onPress={onClose}
      >
        <Text style={styles.modalButtonText}>Close</Text>
      </TouchableOpacity>
    </PopupBase>
  );
};

const styles = StyleSheet.create({
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
