import { RelayItem } from '@/components/search/RelayItem';
import ExpandableSlider from '@/lib/components/ExpandableSlider';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import React from 'react';
import { List } from 'react-native-paper';

interface RelaySectionProps {
  title: string;
  icon: "upload" | "download";
  relays: any[];
  label: string;
  onRemove: (url: string) => void;
  onRefresh: () => void;
}

export const RelaySection: React.FC<RelaySectionProps> = ({
  title,
  icon,
  relays,
  label,
  onRemove,
  onRefresh,
}) => {
  const colors = useThemeColors();

  return (
    <ExpandableSlider
      title={title}
      icon={icon}
      label={label}
      showBackground={false}
      customBackgroundColor={colors.surfaceVariant}
    >
      {relays.length === 0 ? (
        <List.Item
          title={`No ${title.toLowerCase()} configured`}
          description={`${title} will appear here once configured`}
          left={props => <List.Icon {...props} icon="wifi-off" color="gray" />}
        />
      ) : (
        relays.map((relay, index) => (
          <RelayItem
            key={index}
            relay={relay}
            isSearchMode={false}
            onRemove={() => {
              onRemove(relay.url);
              onRefresh();
            }}
            onPress={() => console.log(`${title} relay pressed:`, relay.url)}
          />
        ))
      )}
    </ExpandableSlider>
  );
};
