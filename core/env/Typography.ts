export const Typography = {
  // Font sizes
  xs: { fontSize: 10 },
  sm: { fontSize: 12 },
  md: { fontSize: 14 },
  lg: { fontSize: 16 },
  xl: { fontSize: 18 },
  xxl: { fontSize: 20 },
  xxxl: { fontSize: 24 },
  huge: { fontSize: 32 },
  massive: { fontSize: 48 },

  // Font weights
  normal: { fontWeight: '400' as const },
  medium: { fontWeight: '500' as const },
  semibold: { fontWeight: '600' as const },
  bold: { fontWeight: '700' as const },

  // Common text combinations
  body: { fontSize: 14, lineHeight: 20 },
  bodyLarge: { fontSize: 16, lineHeight: 24 },
  caption: { fontSize: 12, lineHeight: 16 },
  title: { fontSize: 18, fontWeight: '600' as const },
  titleLarge: { fontSize: 24, fontWeight: '700' as const },
  titleHuge: { fontSize: 48, fontWeight: 'bold' as const },
  button: { fontSize: 16, fontWeight: '600' as const },
  input: { fontSize: 16 },
  label: { fontSize: 14, fontWeight: '500' as const },
  helper: { fontSize: 12, fontStyle: 'italic' as const },

  // Platform-adaptive header style
  header: {
    fontSize: 20, // Mobile header size
    fontWeight: '400' as const,
  },

  // Text alignment
  center: { textAlign: 'center' as const },
  left: { textAlign: 'left' as const },
  right: { textAlign: 'right' as const },
} as const;

export type TypographyType = keyof typeof Typography;
