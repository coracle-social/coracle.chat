import SlideOutOptions from '@/lib/components/SlideOutOptions';
import { useThemeColors } from '@/lib/theme/ThemeContext';
import { View } from '@/lib/theme/Themed';
import { Pool } from '@welshman/net';
import { displayRelayUrl } from '@welshman/util';
import React, { useState } from 'react';
import { Image } from 'react-native';
import { IconButton, List } from 'react-native-paper';

interface RelayItemProps {
  relay: any;
  isSearchMode?: boolean;
  onAddOutbox?: () => void;
  onAddInbox?: () => void;
  onRemove?: () => void;
  onPress?: () => void;
}

export const RelayItem: React.FC<RelayItemProps> = ({
  relay,
  isSearchMode = false,
  onAddOutbox = () => {},
  onAddInbox = () => {},
  onRemove = () => {},
  onPress = () => {}
}) => {
  const colors = useThemeColors();
  const isConnected = Pool.get().has(relay.url);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <View style={{
      marginBottom: 4,
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: isSearchMode ? colors.surfaceVariant : 'transparent'
    }}>
        <List.Item
      title={relay.profile?.name || relay.name || displayRelayUrl(relay.url)}
      description={relay.profile?.description || relay.description || relay.url}
      onPress={onPress}
      style={{ borderRadius: 8, overflow: 'hidden' }}
      left={props =>
        relay.profile?.icon ? (
          <View style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            overflow: 'hidden',
            marginLeft: 8,
            marginRight: 8
          }}>
            <Image
              source={{ uri: relay.profile.icon }}
              style={{ width: 40, height: 40 }}
              resizeMode="cover"
            />
          </View>
        ) : (
          <List.Icon
            {...props}
            icon={isConnected ? "wifi" : "wifi-off"}
            color={isConnected ? colors.primary : "gray"}
          />
        )
      }
        right={props => (
          isSearchMode ? (
            <View>
            <SlideOutOptions
              icon="dots-vertical"
              buttons={[
                {
                  title: 'Outbox',
                  icon: 'upload',
                  onPress: async () => {
                    setIsLoading(true);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    onAddOutbox();
                    setIsLoading(false);
                  },
                  color: colors.primary
                },
                {
                  title: 'Inbox',
                  icon: 'download',
                  onPress: async () => {
                    setIsLoading(true);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    onAddInbox();
                    setIsLoading(false);
                  },
                  color: colors.primary
                }
              ]}
            />

            </View>
          ) : (
            <IconButton
              icon="close"
              iconColor={colors.error}
              onPress={async () => {
                setIsLoading(true);
                await new Promise(resolve => setTimeout(resolve, 1000));
                onRemove();
                setIsLoading(false);
              }}
              size={20}
              disabled={isLoading}
            />
          )
        )}
      />


    </View>
  );
};
