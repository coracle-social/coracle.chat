import { postLengthStore } from '@/core/state/post-length-store';
import { useStore } from '@/stores/useWelshmanStore2';

export const usePostLength = () => {
  const [state] = useStore(postLengthStore);

  if (!state) {
    return {
      currentMode: postLengthStore.getCurrentMode(),
      availableModes: [],
      setMode: postLengthStore.setMode,
      cycleToNextMode: postLengthStore.cycleToNextMode,
      getCurrentMode: postLengthStore.getCurrentMode
    };
  }

  return {
    ...state,
    setMode: postLengthStore.setMode,
    cycleToNextMode: postLengthStore.cycleToNextMode,
    getCurrentMode: postLengthStore.getCurrentMode
  };
};
