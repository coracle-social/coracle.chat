# Framework

## React Native vs Expo Comparison

| Aspect | React Native | Expo |
|--------|-------------|------|
| **Startup Speed** | Slightly slower to startup, requires tuning for web, android and iOS | Quick implementation, right to iterating and changing |
| **Codebase** | Separate codebase | Shared Codebase for web and mobile |
| **Platform Strategy** | Separate web and mobile development from the start | React-Navigation-web can sync navigation logic across devices even after ejection |
| **Native Modules** | Immediate access to native modules | Once we require native modules, ejecting costs near nothing, we receive full android, iOS, and web implementations |
| **Setup Complexity** | Manage both web and android/iOS signing, manual setup for hot reloading | None besides install |
| **Post-Eject** | N/A | When ejecting, must configure mobile/web as if it was bare React Native, Post-Eject codebase has some Expo client overhead but we maintain access to their tooling |
| **Testing/Tools** | Webpack and metro are default developing tools with hot reload but require setup | Automatic Hot Reloading and OTA testing if we decide on a testflight or app store testing phase without native modules |

## Decision: EXPO → Eject → Bare React Native

### Why Expo First?

**Fast development velocity** across iOS, Android, and Web with a single codebase.

**Unified navigation and UI/UX logic** between platforms (especially important because of the web version):
- React-Native-Web allows for the UI to transfer 
- React-Navigation-Web allows for unified navigation

**No manual configuration** for faster initial iterating

**Easy integration** with tools like Expo Go, OTA updates, and dev builds for fast testing

**Pre-Ejection Goal:** Ideally the UI/UX is in a usable state before ejecting. Even if we need native modules before that point and we eject early we have still gained by accessing Expo tooling while developing.

**Storage solution:** `react-native-async-storage/async-storage` handles localStorage for android/iOS and falls back to IndexedDB (can configure web localStorage as well)

### Ejection Plan (Later Phase)

Native modules are unavoidable but we will work with Expo as long as possible to keep the web and mobile synced while iterating faster. As soon as native modules are required, we eject to Expo's bare workflow. This gives us the exact same format as if we had started developing with bare React Native plus multiple useful Expo tools. This does result in a slightly larger overhead and bundle size but not a big difference.

**Platform Management:**
- Maintain separation between platforms only where needed
- Aided by tools like Platform.OS, file extensions (.native.tsx, .web.tsx), and react-navigation's web support

**Build Tools:**
- Continue using Webpack (for web) and Metro (for native) in parallel
- Carefully maintain shared logic (navigation, state management, local storage) to reduce duplication

### Alternative Framework Notes

**Ionic:** Non-native UI and too far from native performance.

**Solito:** Ideal for attempting a monorepo with Turborepo. While a semi-popular method, the setup and possible interoperable errors are numerous. Adding SSR support is another factor not to use this method. Additionally, React Native has tools like Platform.OS and React-Navigation to reduce duplicate code while handling navigation.

---

# UI/UX

# State

# Testing
