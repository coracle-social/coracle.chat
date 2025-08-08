import { spacing } from '@/core/env/Spacing';
import { ThemeToggleMobile } from '@/lib/components/ThemeToggle';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { View } from '@/lib/theme/Themed';
import { Redirect, router } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Card, List } from 'react-native-paper';

export default function SettingsIndex() {
  const colors = useThemeColors();
  // Redirect to general settings on web
  if (Platform.OS === 'web') {
    //redirect component because I was getting a root nav undefined if users typed in url like website.com/settings
    return <Redirect href="/settings/generalSettings" />;
  }

  const settingsCategories: Array<{
    title: string;
    description: string;
    icon: string;
    route: '/settings/generalSettings' | '/settings/profile' | '/settings/relays' | '/settings/usage';
  }> = [
    {
      title: 'General Settings',
      description: 'Configure content display and app preferences',
      icon: 'cog',
      route: '/settings/generalSettings',
    },
    {
      title: 'Profile Settings',
      description: 'Manage your profile and account settings',
      icon: 'account',
      route: '/settings/profile',
    },
    {
      title: 'Relay Settings',
      description: 'Configure relay connections and preferences',
      icon: 'wifi',
      route: '/settings/relays',
    },
    {
      title: 'Usage Statistics',
      description: 'View usage statistics and analytics',
      icon: 'chart-box',
      route: '/settings/usage',
    },
  ];

  const handleSettingsPress = (route: '/settings/generalSettings' | '/settings/profile' | '/settings/relays' | '/settings/usage') => {
    router.push(route);
  };

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.content}>
          {settingsCategories.map((category, index) => (
            <Pressable
              key={index}
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: colors.surface,
                  marginBottom: spacing(2),
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                  opacity: pressed ? 0.9 : 1,
                }
              ]}
              onPress={() => handleSettingsPress(category.route)}
              android_ripple={{
                color: colors.primary,
                borderless: false,
                radius: 12 // Match the card's borderRadius
              }}
            >
              <Card.Content style={styles.cardContent}>
                <List.Item
                  title={category.title}
                  description={category.description}
                  left={props => (
                    <List.Icon
                      {...props}
                      icon={category.icon}
                      color={colors.primary}
                    />
                  )}
                  right={props => (
                    <List.Icon
                      {...props}
                      icon="chevron-right"
                      color={colors.placeholder}
                    />
                  )}
                  titleStyle={[styles.listTitle, { color: colors.text }]}
                  descriptionStyle={[styles.listDescription, { color: colors.placeholder }]}
                  style={styles.listItem}
                />
              </Card.Content>
            </Pressable>
          ))}
        </View>
      </ScrollView>

     <ThemeToggleMobile />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing(4),
    paddingTop: spacing(4),
    paddingBottom: spacing(2),
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: spacing(1),
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  content: {
    paddingHorizontal: spacing(4),
    paddingBottom: spacing(4),
  },
  card: {
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardContent: {
    padding: 0,
  },
  listItem: {
    paddingVertical: spacing(1),
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  listDescription: {
    fontSize: 14,
    marginTop: spacing(0.5),
  },
});
