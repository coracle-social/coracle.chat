import { StyleSheet } from 'react-native';

// import NostrTest from '@/tests/integration/NostrTest';
import { Text, View } from '@/components/theme/Themed';
import { ScrollView } from 'react-native';

export default function TabOneScreen() {
  return (
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer}  contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <Text style={styles.title}>Dashboard</Text>
          <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
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
});
