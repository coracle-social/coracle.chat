import { Layout } from '@/core/env/Layout';
import { spacing } from '@/core/env/Spacing';
import ExpandableSlider from '@/lib/components/ExpandableSlider';
import { OptionButton } from '@/lib/components/OptionButton';
import ProfileCard from '@/lib/components/ProfileCard';
import SlideOutOptions from '@/lib/components/SlideOutOptions';
import Slider from '@/lib/components/Slider';
import { useStore } from '@/lib/stores/useWelshmanStore2';
import { useTheme, useThemeColors } from '@/lib/theme/ThemeContext';
import { Text, View } from '@/lib/theme/Themed';
import Feather from '@expo/vector-icons/Feather';
import { pubkey } from '@welshman/app';
import { Link } from 'expo-router';
import { Platform, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

export default function SettingsScreen() {
  const [currentPubkey] = useStore(pubkey);
  const { isDark, toggleTheme } = useTheme();
  const colors = useThemeColors();

  const handleSliderPress = () => {
    console.log('Slider pressed');
    //In case we need loading logic
  };

  const handleLogout = () => {
    pubkey.set(undefined);
    // The userProfile store will automatically update when pubkey changes
  };


  const notificationSliders = [
    {
      imageUrl: "https://via.placeholder.com/60",
      title: "Push Notifications",
      description: "Configure push notification preferences",
      onPress: handleSliderPress,
    },
    {
      imageUrl: "https://via.placeholder.com/60",
      title: "Email Notifications",
      description: "Manage email notification settings",
      onPress: handleSliderPress,
    },
  ];

  return (
    <>
      <View style={[styles.container, { backgroundColor: colors.background }, Platform.OS === 'web' && Layout.webContainer]}>
        <ScrollView showsVerticalScrollIndicator={false} style={{ backgroundColor: colors.background }}>
          <View style={styles.profileSection}>
            <Text style={styles.sectionTitle}>Profile</Text>
            {currentPubkey ? (
              <>
                <ProfileCard />
                <View style={styles.slideOutContainer}>
                  <SlideOutOptions
                    icon="more-vertical"
                    buttons={[
                      { //without a real onpress this closes the toggle
                        title: "Settings",
                        onPress: () => console.log("Settings pressed"),
                        icon: "settings",
                        color: colors.primary
                      },
                      {
                        title: "Logout",
                        onPress: handleLogout,
                        icon: "log-out",
                        color: colors.error
                      }
                    ]}
                  />
                </View>
              </>
            ) : (
              <View style={[
                styles.loginContainer,
                {
                  backgroundColor: colors.surfaceVariant,
                  borderColor: colors.border,
                }
              ]}>
                <Text style={[styles.loginText, { color: colors.placeholder }]}>Sign in to access your profile and settings</Text>
                <Link href="/modal" asChild>
                  <OptionButton
                    title="Login"
                    onPress={() => {}} // Link handles the navigation
                    icon="log-in"
                    variant="primary"
                    size="medium"
                  />
                </Link>
              </View>
            )}
          </View>

          <Text style={[styles.themeToggleLabel, { color: colors.text }]}>
                Dark/Light Mode
              </Text>
              <TouchableOpacity
                style={[
                  styles.themeToggleButton,
                  {
                    backgroundColor: colors.primary,
                    borderColor: colors.border,
                  }
                ]}
                onPress={toggleTheme}
              >
                <Feather
                  name={isDark ? "sun" : "moon"}
                  size={20}
                  color={colors.surface}
                />
              </TouchableOpacity>

          <View style={styles.sliderSection}>
            <Text style={styles.sectionTitle}>Examples(non-functional)</Text>
            <Slider
              imageUrl="https://via.placeholder.com/60"
              title="Account Settings"
              description="Manage your account preferences and security settings"
              onPress={handleSliderPress}
            />
          </View>

          <View style={styles.expandableSection}>
            <ExpandableSlider
              title="Notification Preferences"
              icon="bell"
              sliders={notificationSliders}
            />
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing(4),
  },
  webContainer: {
    maxWidth: 950,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: spacing(5),
  },
  profileSection: {
    marginBottom: spacing(8),
  },
  themeSection: {
    marginBottom: spacing(8),
  },
  sliderSection: {
    marginBottom: spacing(8),
  },
  expandableSection: {
    marginBottom: spacing(5),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing(3),
  },
  themeToggleLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  themeToggleButton: {
    width: spacing(10),
    height: spacing(10),
    borderRadius: spacing(5),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
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
});
