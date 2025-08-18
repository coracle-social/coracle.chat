import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

export const openUrl = async (url: string): Promise<void> => {
    if (Platform.OS === 'web') {
      // On web, open in new tab with security attributes
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      // On mobile, open in in-app browser
      await WebBrowser.openBrowserAsync(url);
    }
};
