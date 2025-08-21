import { BorderRadius } from '@/core/env/BorderRadius';
import { CommonStyles } from '@/core/env/CommonStyles';
import { ComponentStyles } from '@/core/env/ComponentStyles';
import { LayoutPresets } from '@/core/env/LayoutPresets';
import { Shadows } from '@/core/env/Shadows';
import { Typography } from '@/core/env/Typography';

export const composeStyles = (...styles: any[]) => {
  return styles.filter(Boolean);
};

export const withShadow = (shadowType: keyof typeof Shadows) => {
  return Shadows[shadowType];
};

export const withBorderRadius = (radius: keyof typeof BorderRadius) => {
  return { borderRadius: BorderRadius[radius] };
};

export const withComponentStyle = (styleType: keyof typeof ComponentStyles) => {
  return ComponentStyles[styleType];
};

export const withLayout = (layoutType: keyof typeof LayoutPresets) => {
  return LayoutPresets[layoutType];
};

export const withTypography = (typographyType: keyof typeof Typography) => {
  return Typography[typographyType];
};

export const withCommonStyle = (commonStyleType: keyof typeof CommonStyles) => {
  return CommonStyles[commonStyleType];
};

export const withPadding = (horizontal?: number, vertical?: number) => {
  return {
    paddingHorizontal: horizontal,
    paddingVertical: vertical,
  };
};

export const withMargin = (horizontal?: number, vertical?: number) => {
  return {
    marginHorizontal: horizontal,
    marginVertical: vertical,
  };
};

export const withFlex = (flex: number = 1) => {
  return { flex };
};

export const withPosition = (position: 'absolute' | 'relative' = 'relative') => {
  return { position };
};

// Quick text style helpers
export const text = {
  xs: Typography.xs,
  sm: Typography.sm,
  md: Typography.md,
  lg: Typography.lg,
  xl: Typography.xl,
  xxl: Typography.xxl,
  xxxl: Typography.xxxl,
  huge: Typography.huge,
  massive: Typography.massive,
  body: Typography.body,
  bodyLarge: Typography.bodyLarge,
  caption: Typography.caption,
  title: Typography.title,
  titleLarge: Typography.titleLarge,
  titleHuge: Typography.titleHuge,
  button: Typography.button,
  input: Typography.input,
  label: Typography.label,
  helper: Typography.helper,
  center: Typography.center,
  left: Typography.left,
  right: Typography.right,
  normal: Typography.normal,
  medium: Typography.medium,
  semibold: Typography.semibold,
  bold: Typography.bold,
};

// Quick layout helpers
export const layout = {
  center: LayoutPresets.center,
  row: LayoutPresets.row,
  rowStart: LayoutPresets.rowStart,
  spaceBetween: LayoutPresets.spaceBetween,
  spaceAround: LayoutPresets.spaceAround,
  flex1: LayoutPresets.flex1,
  absoluteCenter: LayoutPresets.absoluteCenter,
  absoluteFill: LayoutPresets.absoluteFill,
};

// Quick common style helpers
export const common = {
  flexCenter: CommonStyles.flexCenter,
  flexRow: CommonStyles.flexRow,
  flexRowStart: CommonStyles.flexRowStart,
  flexRowBetween: CommonStyles.flexRowBetween,
  card: CommonStyles.card,
  cardCompact: CommonStyles.cardCompact,
  button: CommonStyles.button,
  buttonRound: CommonStyles.buttonRound,
  input: CommonStyles.input,
  textCenter: CommonStyles.textCenter,
  textBold: CommonStyles.textBold,
  textTitle: CommonStyles.textTitle,
  textBody: CommonStyles.textBody,
  textCaption: CommonStyles.textCaption,
  marginBottom: CommonStyles.marginBottom,
  marginBottomLarge: CommonStyles.marginBottomLarge,
  padding: CommonStyles.padding,
  paddingHorizontal: CommonStyles.paddingHorizontal,
  paddingVertical: CommonStyles.paddingVertical,
  overlay: CommonStyles.overlay,
  iconContainer: CommonStyles.iconContainer,
  iconContainerSmall: CommonStyles.iconContainerSmall,
  loadingContainer: CommonStyles.loadingContainer,
  errorContainer: CommonStyles.errorContainer,
  listItem: CommonStyles.listItem,
  modal: CommonStyles.modal,
  modalHeader: CommonStyles.modalHeader,
};
