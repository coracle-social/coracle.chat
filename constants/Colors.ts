const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
    // RNEUI compatible colors
    primary: '#2f95dc',
    secondary: '#6c757d',
    success: '#28a745',
    warning: '#ffc107',
    error: '#dc3545',
    info: '#17a2b8',
    // Additional UI colors
    surface: '#ffffff',
    surfaceVariant: '#f8f9fa',
    border: '#e9ecef',
    divider: '#dee2e6',
    disabled: '#6c757d',
    placeholder: '#adb5bd',
    // Tab icons
    tabIcons: {
      dashboard: 'Home Smile',
      explore: 'compass',
      spaces: 'Settings Minimalistic',
      messages: 'Letter',
      search: 'Magnifier',
      settings: 'Settings',
    },
    // Additional UI colors for components
    inactiveIcon: '#666',
    sidebarBorder: '#e0e0e0',
    activeTabBackground: '#e0e0e0',
    inactiveTabText: '#666',
    activeTabText: '#007AFF',
    buttonBorder: '#e0e0e0',
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
    // RNEUI compatible colors
    primary: '#4dabf7',
    secondary: '#adb5bd',
    success: '#51cf66',
    warning: '#ffd43b',
    error: '#ff6b6b',
    info: '#74c0fc',
    // Additional UI colors
    surface: '#1a1a1a',
    surfaceVariant: '#2d2d2d',
    border: '#404040',
    divider: '#333333',
    disabled: '#6c757d',
    placeholder: '#6c757d',
    // Tab icons
    tabIcons: {
      dashboard: 'Home Smile',
      explore: 'compass',
      spaces: 'Settings Minimalistic',
      messages: 'Letter',
      search: 'Magnifier',
      settings: 'Settings',
    },
    // Additional UI colors for components
    inactiveIcon: '#999',
    sidebarBorder: '#404040',
    activeTabBackground: '#404040',
    inactiveTabText: '#999',
    activeTabText: '#4dabf7',
    buttonBorder: '#404040',
  },
};
