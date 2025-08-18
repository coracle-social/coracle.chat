import { useTheme } from '@/lib/theme/ThemeContext';

export interface ShimmerConfig {
  duration: number;
  shimmerWidthPercent: number;
  location: number[];
  shimmerColors: string[];
  shimmerStyle: { borderRadius: number };
}

export const useShimmerConfig = (): ShimmerConfig => {
  const { isDark } = useTheme();

  return {
    duration: 1200,
    shimmerWidthPercent: 2.0,
    location: [0.0, 0.1, 0.3, 0.5, 0.7, 0.9, 1.0],
    shimmerColors: isDark
      ? ['#2e2e2e', '#3c3c3c', '#2e2e2e', '#3c3c3c', '#2e2e2e', '#3c3c3c', '#2e2e2e'] // Dark shimmer
      : ['#e0e0e0', '#f0f0f0', '#e0e0e0', '#f0f0f0', '#e0e0e0', '#f0f0f0', '#e0e0e0'], // Light shimmer
    shimmerStyle: { borderRadius: 4 },
  };
};

// Default shimmer config for components that don't need theme awareness
export const defaultShimmerConfig: Omit<ShimmerConfig, 'shimmerColors'> = {
  duration: 1200,
  shimmerWidthPercent: 2.0,
  location: [0.0, 0.1, 0.3, 0.5, 0.7, 0.9, 1.0],
  shimmerStyle: { borderRadius: 4 },
};
