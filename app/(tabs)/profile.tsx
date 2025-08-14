import { settingsStyles } from '@/app/(tabs)/settings/styles';
import ExpandableSlider from '@/lib/components/ExpandableSlider';
import { OptionButton } from '@/lib/components/OptionButton';
import ProfileCard from '@/lib/components/ProfileCard';
import ProfileSwitcher from '@/lib/components/ProfileSwitcher';
import Slider from '@/lib/components/Slider';
import { useStore } from '@/lib/stores/useWelshmanStore2';
import { useTheme, useThemeColors } from '@/lib/theme/ThemeContext';
import { Text, View } from '@/lib/theme/Themed';
import { pubkey } from '@welshman/app';
import { Link, router } from 'expo-router';
import { ScrollView } from 'react-native';

export default function ProfileTab() {
  const [currentPubkey] = useStore(pubkey);
  const colors = useThemeColors();
  const { toggleTheme } = useTheme();

  const handleLogout = () => {
    router.push('/modal');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ maxWidth: 800, alignSelf: 'center', width: '100%' }}
      >
        <View style={settingsStyles.profileSection}>
          <Text style={settingsStyles.sectionTitle}>Profile</Text>
          {currentPubkey ? (
            <>
              <ProfileCard />
            </>
          ) : (
            <View style={[
              settingsStyles.loginContainer,
              {
                backgroundColor: colors.surfaceVariant,
                borderColor: colors.border,
              }
            ]}>
              <Text style={[settingsStyles.loginText, { color: colors.placeholder }]}>Sign in to access your profile and settings</Text>
              <Link href="/modal" asChild>
                <OptionButton
                  title="Login"
                  icon="log-in"
                  variant="primary"
                  size="medium"
                />
              </Link>
            </View>
          )}
        </View>

        <View>
          <ExpandableSlider
            title="Alerts"
            icon="bell"
          >
            <Slider
              imageUrl="https://via.placeholder.com/60"
              title="Push Notifications"
              description="Configure push notification preferences"
              onPress={() => console.log("Push notifications pressed")}
            />
            <Slider
              imageUrl="https://via.placeholder.com/60"
              title="Email Notifications"
              description="Manage email notification settings"
              onPress={() => console.log("Email notifications pressed")}
            />
          </ExpandableSlider>
        </View>

        <View>
          <ExpandableSlider
            title="Account Settings"
            icon="settings"
          >
            <Slider
              imageUrl="log-out"
              title="Logout"
              description="Sign out of your account"
              onPress={handleLogout}
            />
            <Slider
              imageUrl="moon"
              title="Theme Toggle"
              description="Switch between light and dark mode"
              onPress={toggleTheme}
            />
            <Slider
              imageUrl="trash-2"
              title="Delete Profile"
              description="Permanently delete your account (not implemented)"
              onPress={() => console.log("Delete profile pressed - not implemented")}
            />
          </ExpandableSlider>
        </View>
      </ScrollView>
      <ProfileSwitcher />
    </View>
  );
}
