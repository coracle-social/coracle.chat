import { router } from 'expo-router';

export enum TabRoutes {
  DASHBOARD = 'dashboard',
  SPACES = 'spaces',
  MESSAGES = 'messages',
  SEARCH = 'search',
  PROFILE = 'profile',
  SETTINGS = 'settings',
}

export const navigateToTab = (tab: TabRoutes) => {
  router.navigate(`/(tabs)/${tab}`);
};
