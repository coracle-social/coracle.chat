import { openUrl } from '@/core/commands/urlCommands';
import React from 'react';
import { Text } from 'react-native';

export function ExternalLink(
  props: React.ComponentProps<typeof Text> & { href: string }
) {
  const { href, children, ...restProps } = props;

  const handlePress = async () => {
      await openUrl(href);
  };

  return (
    <Text
      {...restProps}
      onPress={handlePress}
      suppressHighlighting={false}
    >
      {children}
    </Text>
  );
}
