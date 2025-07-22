import { router } from 'expo-router';

export const ROUTES = {
  TABS: {
    DASHBOARD: '/(tabs)/dashboard',
    EXPLORE: '/(tabs)/explore',
    SPACES: '/(tabs)/spaces',
    MESSAGES: '/(tabs)/messages',
    SEARCH: '/(tabs)/search',
    SETTINGS: '/(tabs)/settings',
  },
  MODAL: {
    LOGIN: '/modal',
  },
  INDEX: '/',
  NOT_FOUND: '/+not-found',
} as const;

export type RoutePath =
  | typeof ROUTES.TABS[keyof typeof ROUTES.TABS]
  | typeof ROUTES.MODAL[keyof typeof ROUTES.MODAL]
  | typeof ROUTES.INDEX
  | typeof ROUTES.NOT_FOUND;

export const navigate = {
  toDashboard: () => router.navigate(ROUTES.TABS.DASHBOARD),
  toExplore: () => router.navigate(ROUTES.TABS.EXPLORE),
  toSpaces: () => router.navigate(ROUTES.TABS.SPACES),
  toMessages: () => router.navigate(ROUTES.TABS.MESSAGES),
  toSearch: () => router.navigate(ROUTES.TABS.SEARCH),
  toSettings: () => router.navigate(ROUTES.TABS.SETTINGS),

  toLogin: () => router.navigate(ROUTES.MODAL.LOGIN),

  toIndex: () => router.navigate(ROUTES.INDEX),
  toNotFound: () => router.navigate(ROUTES.NOT_FOUND),

  to: (path: RoutePath) => router.navigate(path),

  back: () => router.back(),

  replace: (path: RoutePath) => router.replace(path),

  push: (path: RoutePath) => router.push(path),
};

export enum TabRoutes {
  DASHBOARD = 'dashboard',
  EXPLORE = 'explore',
  SPACES = 'spaces',
  MESSAGES = 'messages',
  SEARCH = 'search',
  SETTINGS = 'settings',
}

export const getTabRoute = (tab: TabRoutes): RoutePath => {
  const tabRoutes = {
    [TabRoutes.DASHBOARD]: ROUTES.TABS.DASHBOARD,
    [TabRoutes.EXPLORE]: ROUTES.TABS.EXPLORE,
    [TabRoutes.SPACES]: ROUTES.TABS.SPACES,
    [TabRoutes.MESSAGES]: ROUTES.TABS.MESSAGES,
    [TabRoutes.SEARCH]: ROUTES.TABS.SEARCH,
    [TabRoutes.SETTINGS]: ROUTES.TABS.SETTINGS,
  };
  return tabRoutes[tab];
};

export const navigateToTab = (tab: TabRoutes) => {
  router.navigate(getTabRoute(tab));
};