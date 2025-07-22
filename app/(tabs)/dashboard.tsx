import { usePopup } from '@/lib/hooks/usePopup';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// import NostrTest from '@/tests/integration/NostrTest';
import { ScrollView } from 'react-native';

export default function DashboardScreen() {
  const { showPopup } = usePopup();

  const openPortalModal = (modalType: string) => {
    showPopup(modalType);
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
        <Text style={styles.title}>Dashboard</Text>
        <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />

        {/* Portal Popup Test Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.portalButton]}
            onPress={() => openPortalModal('portal')}
          >
            <Text style={styles.buttonText}>Open Portal Popup</Text>
          </TouchableOpacity>
        </View>

        {/* <NostrTest /> */}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1, //for mobile scroll extend
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 15,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
  },
  portalButton: {
    backgroundColor: '#FF6B35',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
