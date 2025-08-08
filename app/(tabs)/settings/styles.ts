import { spacing } from '@/core/env/Spacing';
import { StyleSheet } from 'react-native';

export const settingsStyles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: spacing(5),
  },
  profileSection: {
    marginBottom: spacing(8),
  },
  sliderSection: {
    marginBottom: spacing(8),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing(3),
  },
  loginContainer: {
    alignItems: 'center',
    padding: spacing(5),
    borderRadius: spacing(3),
    borderWidth: 1,
  },
  loginText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: spacing(4),
  },
  slideOutContainer: {
    marginTop: 16,
    marginHorizontal: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 16,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
  },
  iosKitSection: {
    marginTop: spacing(8),
    padding: spacing(4),
    backgroundColor: '#f0f0f0',
    borderRadius: spacing(3),
  },
  componentContainer: {
    marginBottom: spacing(4),
    paddingVertical: spacing(2),
    paddingHorizontal: spacing(3),
    backgroundColor: '#fff',
    borderRadius: spacing(2),
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  componentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing(1),
  },
  paperSection: {
    marginTop: spacing(8),
    padding: spacing(4),
    backgroundColor: '#f0f0f0',
    borderRadius: spacing(3),
  },
});
