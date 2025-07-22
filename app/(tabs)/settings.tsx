import { StyleSheet, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { Text, View } from '@/lib/theme/Themed';
import { Button } from '@rneui/themed';
import { Link } from 'expo-router';
import ProfileCard from '@/components/profile/ProfileCard';
import Slider from '@/components/generalUI/Slider';
import ExpandableSlider from '@/components/profile/ExpandableSlider';
import SlideOutOptions from '@/components/generalUI/SlideOutOptions';
import { useTheme } from '@/lib/theme/ThemeContext';
import Colors from '@/core/env/Colors';
import Feather from '@expo/vector-icons/Feather';
import { pubkey } from '@welshman/app';
import { useStore } from '@/stores/useWelshmanStore2';
import { spacing } from '@/core/env/Spacing';
import { Layout } from '@/core/env/Layout';

export default function SettingsScreen() {
  const [currentPubkey] = useStore(pubkey);
  const { isDark, toggleTheme } = useTheme();
  const colorScheme = isDark ? 'dark' : 'light';
  const colors = Colors[colorScheme];

  const handleButtonPress = () => {
    console.log('Profile button pressed');
    //This will eventually view profile as a foreign user
  };

  const handleSliderPress = () => {
    console.log('Slider pressed');
    //In case we need loading logic
  };

  const handleLogout = () => {
    pubkey.set(undefined);
    // The userProfile store will automatically update when pubkey changes
  };

  const accountSliders = [
    {
      imageUrl: "https://source.unsplash.com/random/60x60",
      title: "Email Settings",
      description: "Manage your email preferences and notifications",
      onPress: handleSliderPress,
    },
    {
      imageUrl: "https://via.placeholder.com/60",
      title: "Password",
      description: "Change your password and security settings",
      onPress: handleSliderPress,
    },
    {
      imageUrl: "https://via.placeholder.com/60",
      title: "Two-Factor Auth",
      description: "Enable or disable two-factor authentication",
      onPress: handleSliderPress,
    },
  ];

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
    {
      imageUrl: "https://via.placeholder.com/60",
      title: "Sound & Vibration",
      description: "Customize notification sounds and vibration",
      onPress: handleSliderPress,
    },
  ];

  return (
    <>
      <View style={[styles.container, Platform.OS === 'web' && Layout.webContainer]}>
        {Platform.OS === 'web' ? (
          <TouchableOpacity
            style={[
              styles.floatingThemeButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }
            ]}
            onPress={toggleTheme}
          >
            <Feather
              name={isDark ? "sun" : "moon"}
              size={20}
              color={colors.text}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={[
                styles.headerThemeButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }
              ]}
              onPress={toggleTheme}
            >
              <Feather
                name={isDark ? "sun" : "moon"}
                size={20}
                color={colors.text}
              />
            </TouchableOpacity>
          </View>
        )}

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.profileSection}>
            <Text style={styles.sectionTitle}>Profile</Text>
            {currentPubkey ? (
              <>
                <ProfileCard />

                <View style={styles.slideOutContainer}>
                  <SlideOutOptions
                    icon="more-vert"
                    alignment="right"
                    buttons={[
                      {
                        title: "View Profile",
                        onPress: handleButtonPress,
                        icon: "person",
                        color: colors.primary
                      },
                      {
                        title: "Logout",
                        onPress: handleLogout,
                        icon: "log-out",
                        color: "#dc3545"
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
                  <Button
                    title="Login"
                    buttonStyle={styles.loginButton}
                    titleStyle={styles.loginButtonText}
                    containerStyle={styles.loginButtonContainer}
                  />
                </Link>
              </View>
            )}
          </View>

          <View style={styles.sliderSection}>
            <Text style={styles.sectionTitle}>Options</Text>
            <Slider
              imageUrl="https://via.placeholder.com/60"
              title="Account Settings"
              description="Manage your account preferences and security settings"
              onPress={handleSliderPress}
            />
            <Slider
              imageUrl="https://via.placeholder.com/60"
              title="Notifications"
              description="Configure how and when you receive notifications"
              onPress={handleSliderPress}
            />
            <Slider
              imageUrl="https://via.placeholder.com/60"
              title="Privacy"
              description="Control your privacy settings and data sharing preferences"
              onPress={handleSliderPress}
            />
          </View>

          <View style={styles.expandableSection}>
            <ExpandableSlider
              title="Account Management"
              icon="user"
              sliders={accountSliders}
              shouldRotate={false}
            />
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
  loginButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: spacing(6),
    paddingVertical: spacing(3),
    borderRadius: spacing(2),
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  loginButtonContainer: {
    width: 'auto',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing(3),
  },
  headerThemeButton: {
    width: spacing(10),
    height: spacing(10),
    borderRadius: spacing(5),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: spacing(1) },
    shadowRadius: spacing(1),
  },
  floatingThemeButton: {
    position: 'fixed',
    bottom: spacing(5),
    right: spacing(5),
    width: spacing(13),
    height: spacing(13),
    borderRadius: spacing(7),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: spacing(1) },
    shadowRadius: spacing(2),
    zIndex: 1000,
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

