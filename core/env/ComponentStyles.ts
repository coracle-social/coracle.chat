import { BorderRadius } from './BorderRadius';
import { Shadows } from './Shadows';
import { spacing } from './Spacing';

export const ComponentStyles = {
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 0,
    ...Shadows.medium,
  },
  cardLarge: {
    borderRadius: BorderRadius.xl,
    borderWidth: 0,
    ...Shadows.large,
  },
  modal: {
    borderRadius: BorderRadius.md,
    padding: spacing(4),
    ...Shadows.modal,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    borderRadius: BorderRadius.sm,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2),
  },
  buttonRound: {
    borderRadius: BorderRadius.round,
    padding: spacing(2),
  },
  input: {
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2),
  },
  popup: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    ...Shadows.popup,
  },
  sidebar: {
    borderRightWidth: 1,
    ...Shadows.sidebar,
  },
  dropdown: {
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    ...Shadows.medium,
  },
  imageContainer: {
    position: 'relative' as const,
    borderRadius: BorderRadius.md,
    overflow: 'hidden' as const,
    ...Shadows.small,
  },
  websitePreview: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: spacing(3),
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    ...Shadows.small,
  },
} as const;
