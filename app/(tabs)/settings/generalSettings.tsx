import { settingsStyles } from '@/app/(tabs)/settings/styles';
import { useUserPreferences } from '@/lib/hooks/useUserPreferences';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { View } from '@/lib/theme/Themed';
import { ScrollView } from 'react-native';
import { Card, Divider, List, Switch } from 'react-native-paper';

export default function GeneralSettings() {
  const colors = useThemeColors();
  const { postLength, urlPreviews, hideSensitiveContent, togglePostLength, toggleUrlPreviews, toggleHideSensitiveContent } = useUserPreferences();

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={{ backgroundColor: colors.background }}>
      <View style={settingsStyles.profileSection}>
        <Card style={{ marginVertical: 8 }}>
          <Card.Title title="Content Display" subtitle="Configure post and content display options" />
          <Card.Content>
            <List.Section>
              <List.Item
                title="Full posts"
                description="Show complete post content instead of truncated versions"
                left={props => <List.Icon {...props} icon="file-text" />}
                right={() => (
                  <Switch
                    value={postLength === 'full'}
                    onValueChange={togglePostLength}
                    color={colors.primary}
                  />
                )}
              />
              <Divider />
              <List.Item
                title="Show previews"
                description="Display URL previews and link previews"
                left={props => <List.Icon {...props} icon="link" />}
                right={() => (
                  <Switch
                    value={urlPreviews === 'enabled'}
                    onValueChange={toggleUrlPreviews}
                    color={colors.primary}
                  />
                )}
              />
              <Divider />
              <List.Item
                title="Hide sensitive content"
                description="Hide content marked with content warnings (NSFW, Violence, etc.)"
                left={props => <List.Icon {...props} icon="eye-off" />}
                right={() => (
                  <Switch
                    value={hideSensitiveContent === 'enabled'}
                    onValueChange={toggleHideSensitiveContent}
                    color={colors.primary}
                  />
                )}
              />
              <Divider />
            </List.Section>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}
