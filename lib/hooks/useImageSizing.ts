import { imageSizingStore } from '@/core/state/image-sizing-store';
import { useStore } from '@/stores/useWelshmanStore2';

export const useImageSizing = () => {
  const [state] = useStore(imageSizingStore);

  if (!state) {
    return {
      currentStrategy: imageSizingStore.getCurrentStrategy(),
      availableStrategies: [],
      setStrategy: imageSizingStore.setStrategy,
      cycleToNextStrategy: imageSizingStore.cycleToNextStrategy,
      getCurrentStrategy: imageSizingStore.getCurrentStrategy
    };
  }

  return {
    ...state,
    setStrategy: imageSizingStore.setStrategy,
    cycleToNextStrategy: imageSizingStore.cycleToNextStrategy,
    getCurrentStrategy: imageSizingStore.getCurrentStrategy
  };
};
