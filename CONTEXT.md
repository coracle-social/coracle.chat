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

## UI Management Framework Options

Two frameworks stand out as good combinations of out the box usability and freedom of design:

### React Native Elements (@rneui)
React Native Elements(@rneui) providing foundational components and styling that are very customizable. Out of the box these components will function properly and have an acceptable look, they will need some tweaking but allow developers to design freely and quickly, setting themes for their project. I have used this framework extensively and the newer versions of it work well in almost all use cases especially across mobile device sizes.

### React Native Paper
Another major framework is React Native Paper which is based on Google's material design. It is quicker to develop a high quality eye catching UI especially on Android. However the theming needs some editing for web views and it restricts the design somewhat. Since it is based on Google's material design, it can look out of place on an iOS app.

## Decision: @rneui + Custom Components

I propose using a combination of @rneui as well as custom react native components such as View, Text, ScrollView etc. Other options such as NativeBase either require more setup or impose a heavier design system which restricts design freedom. Additionally, custom components and most @rneui components are 1 and 2 in terms of multi-platform performance.

**Implementation Strategy:** We'll be starting with React Native Elements (@rneui) and adding custom-built components using shared primitives (View, ScrollView, Text, etc.). We maintain speed early in development while enabling precise control over a unified design. This also feeds into our use of Expo early in the development process.

# State

## Welshman Store Adaptation to React Hooks

We can adapt welshman's stores to react hooks manually. Below is an implementation/tests that has been working as a general adaptor as far as I have tested it. 

**Tests include:**
- Basic set(), get(), update() operations
- Instantiating an eventStore via deriveEvents which tests subscription
- Writable tests with a writableEventStore

### Example Usage

```javascript
const eventStore = deriveEvents(realRepository, {
 filters: [{ kinds: [1] }], // text notes
 throttle: 1000,
})

const { state: events, set, update } = useWelshmanStore<TrustedEvent[]>(eventStore)
```

### Writable Store Implementation

```javascript
function createWritableEventStore() {
 let events: TrustedEvent[] = []
 let listeners: Array<(val: TrustedEvent[]) => void> = []
  return {
   get: () => events,
   set: (newEvents: TrustedEvent[]) => {
     events = newEvents
     listeners.forEach(cb => cb(events))
   },
   update: (fn: (draft: TrustedEvent[]) => void) => {
     fn(events)
     listeners.forEach(cb => cb(events))
   },
   subscribe: (cb: (val: TrustedEvent[]) => void) => {
     listeners.push(cb)
     cb(events)
     return () => {
       listeners = listeners.filter(l => l !== cb)
     }
   }
 }
}

const writableStore = React.useMemo(() => createWritableEventStore(), [])
const { state: writableEvents, set: setWritable, update: updateWritable } = useWelshmanStore<TrustedEvent[]>(writableStore)
```

## Welshman General Implementation

**Key Features:**
- Generic hook to adapt any Welshman store to React state
- Works with any store that has subscribe() and get() methods
- Optional throttling, persistence, and initial value support

```javascript
import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import '../shim/localStorage' //fallback if global shiv fails

/**
* Generic hook to adapt any Welshman store to React state.
* Works with any store that has subscribe() and get() methods.
*
* @param store - A Welshman store with subscribe and get methods
* @param options - Optional configuration
* @returns { state, set, update } - React state and store methods
*/
export function useWelshmanStore<T>(
 store: {
   subscribe: (callback: (value: T) => void) => () => void
   get: () => T
   set?: (value: T) => void
   update?: any
 },
 options?: {
   throttleMs?: number
   persistKey?: string
   initialValue?: T
 }
) {
 const { throttleMs = 0, persistKey, initialValue } = options || {}

 // React state synced to store value
 const [state, setState] = useState<T>(() => {
   if (persistKey) {
     try {
       const lsVal = localStorage?.getItem(persistKey) //(global.localStorage || window.localStorage)?.getItem(persistKey) old method with shiv, fallback?
       if (lsVal) return JSON.parse(lsVal) as T
     } catch {}
   }
   return store.get() || initialValue as T
 })

 const throttlingRef = useRef<number | null>(null)

 //keep a stable reference to the store's subscribe method
 const subscribeRef = useRef(store.subscribe)

 //keep latest subscribe reference
 useEffect(() => {
   subscribeRef.current = store.subscribe
 }, [store.subscribe])

 //Subscribes to the Welshman store and updates React state on change
 //cleans up on unmount
 useEffect(() => {
   const unsubscribe = subscribeRef.current((value: T) => {
     if (throttleMs > 0) {
       if (throttlingRef.current) return
       throttlingRef.current = setTimeout(() => {
         setState(value)
         throttlingRef.current = null
       }, throttleMs)
     } else {
       setState(value)
     }
   })

   return () => {
     unsubscribe()
     if (throttlingRef.current) {
       clearTimeout(throttlingRef.current)
     }
   }
 }, [throttleMs])

 // Persist to localStorage
 useEffect(() => {
   if (persistKey) {
     try {
       localStorage?.setItem(persistKey, JSON.stringify(state)) //(global.localStorage || window.localStorage)?.setItem(persistKey, JSON.stringify(state)) //old shiv method
     } catch {} //silent ignore!
   }
 }, [state, persistKey])

 const set = useCallback((val: T) => {
   if (store.set) store.set(val)
   else console.warn('Store.set not implemented') //not necessarily defined for read only stores
 }, [store.set])

 const update = useCallback((fn: (draft: T) => void) => {
   if (store.update) store.update(fn)
   else console.warn('Store.update not implemented')
 }, [store.update])

 return { state, set, update }
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

**Current Solution:**
- Patching the Welshman/lib/dist/Tools.js file to create a custom storage method
- Changes localStorage depending on device type
- Includes a synchronous wrapper around AsyncStorage because Welshman tooling expects synchronous properties
- **Status:** Working in minimal testing

**Production Requirements:**
- Need to implement: clear(), key(index) and length
- Must actually retrieve data stored from a previous session
- Potential race conditions may exist

**Alternative Options:**
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

### Cross-Platform Storage Implementation

```javascript
// Cross-platform storage implementation
let storage;
if (typeof localStorage !== 'undefined') {
 storage = localStorage;
} else if (typeof global !== 'undefined') {
 // Create a synchronous wrapper around AsyncStorage for mobile
 const asyncStorage = global.AsyncStorage || require('@react-native-async-storage/async-storage').default;
 const cache = new Map();
  storage = {
   getItem: (key) => {
     if (cache.has(key)) return cache.get(key);
     // For now, return null and let the app handle async loading
     return null;
   },
   setItem: (key, value) => {
     cache.set(key, value);
     asyncStorage.setItem(key, value).catch(() => {});
   },
   removeItem: (key) => {
     cache.delete(key);
     asyncStorage.removeItem(key).catch(() => {});
   }
 };
}

export const getJson = (k) => parseJson((storage ? storage.getItem(k) : null) || "");
/**
* Stringifies and stores value in localStorage
* @param k - Storage key
* @param v - Value to store
*/
export const setJson = (k, v) => { if (storage) storage.setItem(k, JSON.stringify(v)); };
/**
* Fetches JSON from URL with options
* @param url - URL to fetch from
* @param opts - Fetch options
* @returns Promise of parsed JSON response
*/
```





# Testing
