import { usePopup } from '@/lib/hooks/usePopup';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PopupBase } from './PopupBase';

interface PortalPopupProps {
  visible: boolean;
  onClose: () => void;
}

export const PortalPopup: React.FC<PortalPopupProps> = ({ visible, onClose }) => {
  const { pushPopup } = usePopup();

  const handleOpenLayer2 = () => {
    pushPopup('layer2');
  };

  return (
    <PopupBase visible={visible} onClose={onClose} animationType="fade">
      <Text style={styles.modalTitle}>Portal Popup (Layer 1)</Text>
      <Text style={styles.modalText}>
        This is the main portal popup. You can open nested popups from here.
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
          onPress={handleOpenLayer2}
        >
          <Text style={styles.modalButtonText}>Open Layer 2</Text>
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
