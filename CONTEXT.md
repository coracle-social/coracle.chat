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

## Note on NIP 55 Signing for Android
Expo can support this with https://github.com/chebizarro/Nostr-Signer-Expo-Module(or the more maintained fork: expo-nip55). This does require native modules but we don't have to fully eject yet. We can expose the Expo Dev client and build a custom development which still uses Expo config and tooling such as OTA updates. OTA updates are especially useful in the initial testing phase so we are not limited by app store approvals. This method slows down development minimally. Note that OTA updates can't update native code or assets or permissions. But common bugs, screen layouts, React Native code etc. can all be updated without an official app store update.


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
- Continue using Webpack (for web) and Metro (for native) in parallel. Webpack is the default for Expo. Other options like Vite can be setup but are semi-difficult and not supported by all dependencies. Metro itself is not an option for Web because it has limited dependency support.
- Carefully maintain shared logic (navigation, state management, local storage) to reduce duplication

### Alternative Framework Notes

**Ionic:** Non-native UI and too far from native performance.

**Solito:** Ideal for attempting a monorepo with Turborepo. While a semi-popular method, the setup and possible interoperable errors are numerous. Adding SSR support is another factor not to use this method. Additionally, React Native has tools like Platform.OS and React-Navigation to reduce duplicate code while handling navigation.

---

# UI/UX

## UI Management Framework Options

Two frameworks stand out as good combinations of out the box usability and freedom of design:

### React Native Elements (@rneui)
React Native Elements(@rneui) providing foundational components and styling that are very customizable. Out of the box these components will function properly and have an acceptable look, they will need some tweaking but allow developers to design freely and quickly, setting themes for their project. I have used this framework extensively and the newer versions of it work well in almost all use cases especially across mobile device sizes.

### React Native Paper
Another major framework is React Native Paper which is based on Google's material design. It is quicker to develop a high quality eye catching UI especially on Android. However the theming needs some editing for web views and it restricts the design somewhat. Since it is based on Google's material design, it can look out of place on an iOS app.

## Animations

Both options don't provide comprehensive animation support. That is typically handled by react-native-reanimated, react-native-animatable, react-native-gesture-handler. RNPaper does come with slide in/out and ripple animations initially which adds a degree of polish but may make future custom animations more difficult to integrate. Since RNPaper does not offer a comprehensive system I would rather have full control.

For quicker and less boilerplate animations we can also use Moti. It is built on top of reanimated and works well with native/web. The performance is acceptable but if we add any complex or non-standard animations we will revert to react-native-reanimated.

## Decision: @rneui + Custom Components

I propose using a combination of @rneui as well as custom react native components such as View, Text, ScrollView etc. Other options such as NativeBase either require more setup or impose a heavier design system which restricts design freedom. Additionally, custom components and most @rneui components are 1 and 2 in terms of multi-platform performance.



**Implementation Strategy:** We'll be starting with React Native Elements (@rneui) and adding custom-built components using shared primitives (View, ScrollView, Text, etc.). We maintain speed early in development while enabling precise control over a unified design. This also feeds into our use of Expo early in the development process.

# State

## Welshman Store Adaptation to React Hooks

We can adapt welshman's stores to react hooks manually. Below is an implementation/tests that has been working as a general.

**Tests included:**
- Basic set(), get(), update() operations
- Instantiating an eventStore via deriveEvents which tests subscription
- Writable tests with a writableEventStore

### Example Usage

```javascript
import { useStore } from './useWelshmanStore';

const [newTestEvents] = useStore<TrustedEvent[]>(testEventsStore || { subscribe: () => () => {} });
 // Debug new useStore
 useEffect(() => {
   console.log('[NEW_USE_STORE] newTestEvents changed:', newTestEvents);
 }, [newTestEvents]);
```


## Welshman General Implementation

**Key Features:**
- Generic hook to adapt any Welshman store to React state
- Works with any store that has subscribe() and get() methods
- Optional throttling, persistence, and initial value support

```javascript
import { useState, useEffect } from 'react'


/**
* @param store - A store with subscribe and optional set methods
* @returns [value, setValue] - Current value and setter function
*/
export function useStore<T>(
 store: {
   subscribe: (callback: (value: T) => void) => () => void
   set?: (value: T) => void
 }
): [T | undefined, ((value: T) => void) | undefined] {
 const [value, setValue] = useState<T | undefined>(undefined)


 useEffect(() => {
   const unsubscribe = store.subscribe(setValue)
   return unsubscribe
 }, [store.subscribe])


 return [value, store.set]
}

```

## Cross-Platform Storage Challenges

### LocalStorage Issue

**Problem:** LocalStorage is only available on web and is synchronous while common React Native module react-native-async-storage is asynchronous.

**Initial Approach (Failed):**
- Attempted a shiv which would load first and define a 'global.localStorage'
- Would handle logic for using mobile storage when localStorage was called
- **Why it failed:** Metro bundler follows a dependency graph which does not include the shiv
- Trying a global polyfill also failed

**Second Approach:**
- Patching the Welshman/lib/dist/Tools.js file to create a custom storage method
- Changes localStorage depending on device type
- Includes a synchronous wrapper around AsyncStorage because Welshman tooling expects synchronous properties
- **Status: Rejected** Working in minimal testing but was not platform agnostic, relied on editing direct dependencies

**Final Approach:**
- Remove Dependency on localStorage
- Update synced store to take a configuration object with key, async get, and async set options
- Replace synced with a plain writable in welshman/app
- Is now platform agnostic, and the platform is responsible for dependency injection

**Changes to Welshman**
- These will be handled via https://github.com/coracle-social/welshman/issues/28 for localStorage

**Alternative Storage Types:**
- **react-native-mmkv:** Synchronous and slightly faster but requires ejection
- **indexedDB:** More involved and in-depth change, but generally following the same format as the localStorage patch to Welshman

### Mobile Encrypted Storage

**Available Options:**
1. **expo-secure-store** **Recommended**
   - Smaller bundle size
   - Sufficient for small amounts of secure data
   - No need to edit Welshman

2. **react-native-encrypted-storage**
   - More robust but larger overhead
   - May be needed depending on MLS implementation

**Decision:** We can store this data directly, no need to edit Welshman.






# Testing

**UI TESTING**
  - The combination of @rneui and Expo's accelerated testing provides a good basis for making consistent designs/layouts on mobile/web. Once a few screens are made well on web and mobile, we can copy their general format to prevent UI errors and maintain consistency.
  - The only UI test I plan on implementing is shown below. It is a basic overflow test that can optionally use onlayout so that it reloads once async data is loaded to the child view.
  - note:
    - import { SafeAreaView } from 'react-native-safe-area-context' to prevent overflow, wrapper on the entire content


```javascript
import React from 'react';
import { View, Dimensions, ViewProps } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OverflowDebuggerProps extends ViewProps {
  children: React.ReactNode;
}

export const OverflowDebugger: React.FC<OverflowDebuggerProps> = ({
  children,
  ...rest
}) => {
  const onLayout = (event: any) => {
    const { width, height, x, y } = event.nativeEvent.layout;

    if (__DEV__) {
      if (x + width > SCREEN_WIDTH || y + height > SCREEN_HEIGHT) {
        console.warn(
          `[OverflowDebugger] ⚠️ Overflow detected! ` +
            `Position: (${x.toFixed(1)}, ${y.toFixed(1)}), ` +
            `Size: (${width.toFixed(1)} x ${height.toFixed(1)}), ` +
            `Screen: (${SCREEN_WIDTH} x ${SCREEN_HEIGHT})`
        );
      }
    }
  };

  return (
    <View onLayout={onLayout} {...rest}>
      {children}
    </View>
  );
};

```

  - Then you can wrap any component or the base screen for testing. Lightweight and adds no dependencies.
  - Something that is especially useful while creating a screen from scratch. Minimal overhead so I will keep it even after that

**TIMELINE**
No testing until at least a 1-2 months of development or multiple pages completed so I get a good basis for not only querying and handling data, but also the format and organization I will use.

Fake data is never productive, always test with real data.

Eventually integrate CI tests on each commit focusing mainly on unit tests. Favoring unit tests to force my functions to be data independent.

Note on early development: NIP07 is easy on web, mobile signing is more involved. So I will initially test on mobile with NIP01 signing so I don't make any redundant mock to test the UI or functionality on mobile.




**Note on Routing**
Routing is well defined in React Native with two main options:

1. **Manual control**(I have used this before, it works intuitively but a lot of boiler plate)
    - utilizes  @react-navigation/native react-native-screens, @react-navigation/native-stack for mobile and @react-navigation/web for web
    - Most screen navigation is handled by these so android back button works automatically
    - For dialogs and popups, either define them as modal screens which will work with android
    - or if you define them as components(convenient), then you can manually intercept with the backhandler to disappear the component
    - You can always customize per screen with back handler, conditionally popping or replacing screens. Full Control
    - Screens are only registered if conditions are met
    - Straightforward to do deep nesting, async checks and complex navigation.


2. **Expo-router**
    - Expo-router automatically handles linking via a folder based system. This syncs mobile and web really well for low and medium complexity tasks(fastest implementation).
    - However it could be difficult if we have some complex navigation/view stacking
    - Has no support for custom middleware or serving.
    - All routes are statically registered based on file structure, so instead of "hiding" a route, you redirect after it renders or block UI conditionally.
    - dynamic route generation can be difficult, manual setup required
    - manual setup to restore nav state
    - file based routing can be messy with conditional nav and redirects for authentication
    - Nearly everything that react-navigation can do is possible via expo-router but the above mentioned tasks might be more awkward than with react-navigation
    - still works post ejection

Lightly Recommending Expo Router



