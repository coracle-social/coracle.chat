const tintColorLight = '#7161FF';
const tintColorDark = '#7161FF';

// Theme palette definitions - using palette2 as the main theme
const defaultPalette = {
  light: {
    text: '#0e1d47',
    background: '#f5f5f5', // Light gray background
    tint: '#7161FF',
    tabIconDefault: '#f6b50c',
    tabIconSelected: '#7161FF',
    // RNEUI compatible colors
    primary: '#7161FF',
    secondary: '#f16742',
    success: '#2f7b7b',
    warning: '#f6b50c',
    error: '#7161FF',
    info: '#f16742',
    // Additional UI colors
    surface: '#ffffff',
    surfaceVariant: '#f8f9fa',
    border: '#05174d',
    divider: '#2f7b7b',
    disabled: '#f16742',
    placeholder: '#f16742',
    // Interactive button colors
    interactiveIcon: '#0e1d47',
    interactiveBorder: '#05174d',
    // Tab icons
    tabIcons: {
      dashboard: 'Home Smile',
      spaces: 'Settings Minimalistic',
      messages: 'Letter',
      search: 'Magnifier',
      profile: 'User Rounded',
      settings: 'Settings',
    },
    // Additional UI colors for components
    inactiveIcon: '#f16742',
    sidebarBorder: '#05174d',
    activeTabBackground: '#7161FF',
    inactiveTabText: '#f16742',
    activeTabText: '#ffffff', //ffffce for that yellow
    buttonBorder: '#05174d',
  },
  dark: {
    text: '#ffffce',
    background: '#272523', // Dark gray background
    tint: '#7161FF',
    tabIconDefault: '#f6b50c',
    tabIconSelected: '#7161FF',
    // RNEUI compatible colors
    primary: '#7161FF',
    secondary: '#f16742',
    success: '#2f7b7b',
    warning: '#f6b50c',
    error: '#7161FF',
    info: '#f16742',
    // Additional UI colors
    surface: '#2D2C2A',
    surfaceVariant: '#404040',
    surfaceDark: '#1E1A13',
    border: '#05174d',
    divider: '#2f7b7b',
    disabled: '#f16742',
    placeholder: '#f16742',
    // Interactive button colors
    interactiveIcon: '#ffffce',
    interactiveBorder: '#05174d',
    // Tab icons
    tabIcons: {
      dashboard: 'Home Smile',
      spaces: 'Settings Minimalistic',
      messages: 'Letter',
      search: 'Magnifier',
      profile: 'User Rounded',
      settings: 'Settings',
    },
    // Additional UI colors for components
    inactiveIcon: '#f16742',
    sidebarBorder: '#05174d',
    activeTabBackground: '#7161FF',
    secondarySidebarBackground: '#1E1A13',
    inactiveTabText: '#f16742',
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
