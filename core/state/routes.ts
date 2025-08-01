import { router } from 'expo-router';

export enum TabRoutes {
  DASHBOARD = 'dashboard',
  EXPLORE = 'explore',
  SPACES = 'spaces',
  MESSAGES = 'messages',
  SEARCH = 'search',
  SETTINGS = 'settings',
}

export const navigateToTab = (tab: TabRoutes) => {
  router.navigate(`/(tabs)/${tab}`);
};
