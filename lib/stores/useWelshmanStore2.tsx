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
