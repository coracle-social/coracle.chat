import { WebContainer } from '@/lib/components/WebContainer';
import { usePopup } from '@/lib/hooks/usePopup';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { Text, View } from '@/lib/theme/Themed';
import { View as RNView, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

// import NostrTest from '@/tests/integration/NostrTest';

export default function DashboardScreen() {
  const { showPopup } = usePopup();
  const colors = useThemeColors();

  const openPortalModal = (modalType: string) => {
    showPopup(modalType);
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={[styles.scrollContainer, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      <WebContainer style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Dashboard</Text>
        <RNView style={[styles.separator, { backgroundColor: colors.divider }]} />

        {/* Portal Popup Test Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={() => openPortalModal('portal')}
          >
            <Text style={[styles.buttonText, { color: colors.surface }]}>Open Portal Popup</Text>
          </TouchableOpacity>
        </View>

        {/* <NostrTest /> */}
      </WebContainer>
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
