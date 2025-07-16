# Theme System Documentation

This directory contains the theme system for Coracle
chat

## File Structure

```
components/theme/
├── README.md                 # This file
├── ThemeContext.tsx         # Core theme context and provider
├── Themed.tsx              # Themed component wrappers
└── RNEUIThemeProvider.tsx  # React Native Elements UI theme integration
```

## How the Theme Files Interact

### 1. ThemeContext.tsx

**Purpose**: Manages theme state, user preferences, and provides the theme context to the entire app.

**Key Features**:
- **Theme Modes**: Supports `light`, `dark`, and `system` modes
- **Persistent Storage**: Saves user preferences to AsyncStorage
- **System Integration**: Automatically follows system theme when in 'system' mode
- **Context Provider**: Provides theme state to all child components

**Exports**:
- `ThemeProvider`: Wraps the app and provides theme context
- `useTheme()`: Hook to access theme state in components

**Usage**:
```tsx
import { useTheme } from '@/components/theme/ThemeContext';

function MyComponent() {
  const { isDark, themeMode, toggleTheme } = useTheme();
  // Use theme state...
}
```

### 2. Themed.tsx - Component Wrappers

**Purpose**: Provides themed versions of basic React Native components that automatically adapt to the current theme.

**Key Features**:
- **Themed Components**: `Text` and `View` components that automatically use theme colors
- **Color Override**: Allows custom light/dark colors via props
- **useThemeColor Hook**: Utility hook for getting theme-appropriate colors

**Exports**:
- `Text`: Themed text component
- `View`: Themed view component
- `useThemeColor()`: Hook for getting theme colors

**Usage**:
```tsx
import { Text, View, useThemeColor } from '@/components/theme/Themed';

function MyComponent() {
  const backgroundColor = useThemeColor('background');

  return (
    <View style={{ backgroundColor }}>
      <Text>This text automatically adapts to theme</Text>
    </View>
  );
}
```

### 3. RNEUIThemeProvider.tsx - UI Library Integration

**Purpose**: Integrates the app's theme system with React Native Elements UI library.

**Key Features**:
- **RNE Integration**: Creates RNE theme from app's color scheme
- **Automatic Sync**: Updates RNE theme when app theme changes
- **Color Mapping**: Maps app colors to RNE theme colors

**Usage**:
```tsx
import { RNEUIThemeWrapper } from '@/components/theme/RNEUIThemeProvider';

// Wrap RNE components with this provider
<RNEUIThemeWrapper>
  <Button title="RNE Button" />
</RNEUIThemeWrapper>
```

## Theme Flow

```
1. App Starts
   ↓
2. ThemeContext loads saved preference from AsyncStorage
   ↓
3. ThemeContext determines current theme (light/dark/system)
   ↓
4. ThemeContext provides theme state to all components
   ↓
5. Themed components automatically use appropriate colors
   ↓
6. RNEUIThemeProvider syncs with RNE components
```

## Integration with Colors.ts

The theme system integrates with `@/constants/Colors.ts` which defines the color palette:

```tsx
// Colors.ts structure
export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: '#2f95dc',
    // ... other colors
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: '#fff',
    // ... other colors
  }
};
```

## Usage Examples

### Basic Theme Usage
```tsx
import { useTheme } from '@/components/theme/ThemeContext';

function Header() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <View style={{ backgroundColor: isDark ? '#000' : '#fff' }}>
      <Button onPress={toggleTheme} title="Toggle Theme" />
    </View>
  );
}
```

### Using Themed Components
```tsx
import { Text, View } from '@/components/theme/Themed';

function Card() {
  return (
    <View style={{ padding: 16, borderRadius: 8 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
        This card automatically adapts to theme
      </Text>
    </View>
  );
}
```

### Custom Theme Colors
```tsx
import { Text } from '@/components/theme/Themed';

function CustomText() {
  return (
    <Text
      lightColor="#ff0000"  // Red in light mode
      darkColor="#00ff00"   // Green in dark mode
    >
      Custom colored text
    </Text>
  );
}
```

## Best Practices

1. **Use Themed Components**: Prefer `Text` and `View` from `Themed.tsx` over basic React Native components
2. **Access Theme State**: Use `useTheme()` hook to access theme state in components
3. **Color Consistency**: Use colors from `Colors.ts` for consistency
4. **Custom Colors**: Override theme colors only when necessary using `lightColor`/`darkColor` props
5. **RNE Integration**: Wrap RNE components with `RNEUIThemeWrapper` for proper theming
