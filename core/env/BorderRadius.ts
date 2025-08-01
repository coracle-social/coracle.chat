export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 50, // for circular elements
} as const;

export type BorderRadiusType = keyof typeof BorderRadius;
