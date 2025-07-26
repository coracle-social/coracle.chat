import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DashboardModal() {
  const { modalType = 'small' } = useLocalSearchParams<{ modalType: string }>();
  const [nestedModalVisible, setNestedModalVisible] = useState(false);

  const getModalContent = () => {
    switch (modalType) {
      case 'small':
        return {
          title: 'Small Modal',
          content: 'This is a small modal for testing back button behavior.',
          size: 'small'
        };
      case 'medium':
        return {
          title: 'Medium Modal',
          content: 'This is a medium-sized modal. Try pressing the back button while this is open.',
          size: 'medium'
        };
      case 'large':
        return {
          title: 'Large Modal',
          content: 'This is a larger modal that takes up more screen space. Test the back button behavior with this modal open.',
          size: 'large'
        };
      default:
        return {
          title: 'Default Modal',
          content: 'This is a default modal.',
          size: 'small'
        };
    }
  };

  const modalContent = getModalContent();

    return (
    <View style={styles.container}>
      <Pressable
        style={styles.overlay}
        onPress={() => router.back()}
      >
        <Pressable
          style={[
            styles.modal,
            styles[`${modalContent.size}Modal` as keyof typeof styles] as any
          ]}
          onPress={() => {}}
        >
          <Text style={styles.modalTitle}>{modalContent.title}</Text>
          <Text style={styles.modalText}>{modalContent.content}</Text>

          {modalType === 'medium' && (
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => router.back()}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.secondaryButton]}
                onPress={() => setNestedModalVisible(true)}
              >
                <Text style={styles.modalButtonText}>Open Large</Text>
              </TouchableOpacity>
            </View>
          )}

          {modalType !== 'medium' && (
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => router.back()}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          )}
        </Pressable>
      </Pressable>

      {/* Nested Large Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={nestedModalVisible}
        onRequestClose={() => setNestedModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setNestedModalVisible(false)}
        >
          <Pressable style={styles.largeModal} onPress={() => {}}>
            <Text style={styles.modalTitle}>Nested Large Modal</Text>
            <Text style={styles.modalText}>
              This is a nested modal opened from within another modal.
              Test the back button behavior with this modal open.
            </Text>
            <Text style={styles.modalText}>
              The back button should close this modal first, then the parent modal.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setNestedModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
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
  },
  smallModal: {
    minWidth: 250,
    maxWidth: 300,
  },
  mediumModal: {
    minWidth: 300,
    maxWidth: 400,
    padding: 24,
  },
  largeModal: {
    minWidth: 350,
    maxWidth: 500,
    padding: 28,
  },
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
