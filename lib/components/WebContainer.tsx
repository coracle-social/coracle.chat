import { Layout } from '@/core/env/Layout';
import { Platform, View, ViewProps } from 'react-native';

interface WebContainerProps extends ViewProps {
  children: React.ReactNode;
}

export function WebContainer({ children, style, ...props }: WebContainerProps) {
  return (
    <View
      style={[
        style,
        Platform.OS === 'web' && Layout.webContainer
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
