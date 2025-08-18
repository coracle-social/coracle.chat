const tintColorLight = '#f16742';
const tintColorDark = '#f16742';

// Theme palette definitions - using palette2 as the main theme
const defaultPalette = {
  light: {
    text: '#0e1d47',
    background: '#f5f5f5', // Light gray background
    tint: '#f16742',
    tabIconDefault: '#f6b50c',
    tabIconSelected: '#f16742',
    // RNEUI compatible colors
    primary: '#f16742',
    secondary: '#5b9ec3',
    success: '#2f7b7b',
    warning: '#f6b50c',
    error: '#f16742',
    info: '#5b9ec3',
    // Additional UI colors
    surface: '#ffffff',
    surfaceVariant: '#f8f9fa',
    border: '#05174d',
    divider: '#2f7b7b',
    disabled: '#f6b50c',
    placeholder: '#f6b50c',
    // Interactive button colors
    interactiveIcon: '#0e1d47',
    interactiveBorder: '#05174d',
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
    inactiveIcon: '#f6b50c',
    sidebarBorder: '#05174d',
    activeTabBackground: '#f16742',
    inactiveTabText: '#f6b50c',
    activeTabText: '#ffffff', //ffffce for that yellow
    buttonBorder: '#05174d',
  },
  dark: {
    text: '#ffffce',
    background: '#2a2a2a', // Dark gray background
    tint: '#f16742',
    tabIconDefault: '#f6b50c',
    tabIconSelected: '#f16742',
    // RNEUI compatible colors
    primary: '#f16742',
    secondary: '#5b9ec3',
    success: '#2f7b7b',
    warning: '#f6b50c',
    error: '#f16742',
    info: '#5b9ec3',
    // Additional UI colors
    surface: '#3a3a3a',
    surfaceVariant: '#404040',
    border: '#05174d',
    divider: '#2f7b7b',
    disabled: '#f6b50c',
    placeholder: '#f6b50c',
    // Interactive button colors
    interactiveIcon: '#ffffce',
    interactiveBorder: '#05174d',
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
    inactiveIcon: '#f6b50c',
    sidebarBorder: '#05174d',
    activeTabBackground: '#f16742',
    inactiveTabText: '#f6b50c',
    activeTabText: '#ffffce',
    buttonBorder: '#05174d',
  },
};

// Export the default palette (palette2 colors)
export default defaultPalette;

// Export all palettes for theme switching (only default now)
export const colorPalettes = {
  default: defaultPalette,
};
