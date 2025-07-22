import { usePopup } from '@/lib/hooks/usePopup';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PopupBase } from './PopupBase';

interface Layer2PopupProps {
  visible: boolean;
  onClose: () => void;
}

export const Layer2Popup: React.FC<Layer2PopupProps> = ({ visible, onClose }) => {
  const { pushPopup } = usePopup();

  const handleOpenLayer3 = () => {
    pushPopup('layer3');
  };

  return (
    <PopupBase visible={visible} onClose={onClose} animationType="slide">
      <Text style={styles.modalTitle}>Nested Popup (Layer 2)</Text>
      <Text style={styles.modalText}>
        This is the second layer popup. You can open another nested popup from here.
      </Text>
      <Text style={styles.modalText}>
        The back button should close this popup first, then the parent popup.
      </Text>

      <View style={styles.modalButtonRow}>
        <TouchableOpacity
          style={styles.modalButton}
          onPress={onClose}
        >
          <Text style={styles.modalButtonText}>Close</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modalButton, styles.secondaryButton]}
          onPress={handleOpenLayer3}
        >
          <Text style={styles.modalButtonText}>Open Layer 3</Text>
        </TouchableOpacity>
      </View>
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
  modalButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
