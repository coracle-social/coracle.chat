import { StyleSheet, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { Text, View } from '@/components/theme/Themed';
import { Button } from '@rneui/themed';
import { Link } from 'expo-router';
import ProfileCard from '@/components/profile/profileCard';
import Slider from '@/components/generalUI/Slider';
import ExpandableSlider from '@/components/profile/ExpandableSlider';
import SlideOutOptions from '@/components/generalUI/SlideOutOptions';
import { useTheme } from '@/components/theme/ThemeContext';
import Colors from '@/constants/Colors';
import Feather from '@expo/vector-icons/Feather';
import { pubkey, deriveProfile } from '@welshman/app';
import { useStore } from '@/stores/useWelshmanStore2';

interface Profile {
  name?: string;
  display_name?: string;
  about?: string;
  picture?: string;
}

export default function SettingsScreen() {
  const [currentPubkey] = useStore(pubkey);
  const [profileStore, setProfileStore] = useState<any>(null);
  const [loadedProfile] = useStore<Profile>(profileStore || { subscribe: () => () => {} });
  const { isDark, toggleTheme } = useTheme();
  const colorScheme = isDark ? 'dark' : 'light';
  const colors = Colors[colorScheme];

  //debugging only
  useEffect(() => {
    console.log('Loaded profile changed:', loadedProfile);
  }, [loadedProfile]);

  const handleButtonPress = () => {
    console.log('Profile button pressed');
    //This will ventually view profile as a foreign user
  };

  const handleAboutChange = (text: string) => {
    //If needed for future
  };

  const handleSliderPress = () => {
    console.log('Slider pressed');
    //In case we need loading logic
  };

  const loadUserProfile = (pubkey: string) => {
    console.log('Loading profile for pubkey:', pubkey);
    try {
      const store = deriveProfile(pubkey);
      console.log('Profile store created:', store);
      setProfileStore(store);
    } catch (error) {
      console.error('Error creating profile store:', error);
    }
  };

  const handleLogout = () => {
    pubkey.set(undefined);
    setProfileStore(null);
  };

  // Set up profile store when pubkey changes
  useEffect(() => {
    if (currentPubkey) {
      console.log('Current pubkey changed, loading profile:', currentPubkey);
      loadUserProfile(currentPubkey);
    } else {
      setProfileStore(null);
    }
  }, [currentPubkey]);

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
      <View style={[styles.container, Platform.OS === 'web' && styles.webContainer]}>
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
                <ProfileCard
                  avatarUrl={loadedProfile?.picture || "https://via.placeholder.com/90"}
                  buttonTitle=""
                  aboutText={loadedProfile?.about || "No description yet."}
                  name={loadedProfile?.name || loadedProfile?.display_name}
                  pubkey={currentPubkey}
                  onButtonPress={handleButtonPress}
                  onAboutChange={handleAboutChange}
                />
                
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
    padding: 16,
  },
  webContainer: {
    maxWidth: 950,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  profileSection: {
    marginBottom: 30,
  },
  sliderSection: {
    marginBottom: 30,
  },
  expandableSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  loginContainer: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  loginText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
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
    marginBottom: 10,
  },
  headerThemeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center', 
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  floatingThemeButton: {
    position: 'fixed',
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    zIndex: 1000,
  },
  slideOutContainer: {
    marginTop: 16,
    marginHorizontal: 16,
  },
});

