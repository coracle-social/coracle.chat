import { BorderRadius } from './BorderRadius';
import { Shadows } from './Shadows';
import { spacing } from './Spacing';
import { Typography } from './Typography';

export const CommonStyles = {
  // Common container patterns
  flexCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flexRowStart: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  flexRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Common card patterns
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 0,
    ...Shadows.medium,
    padding: spacing(3),
  },
  cardCompact: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: spacing(2),
  },

  // Common button patterns
  button: {
    borderRadius: BorderRadius.sm,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonRound: {
    borderRadius: BorderRadius.round,
    padding: spacing(2),
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Common input patterns
  input: {
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2),
    ...Typography.input,
  },

  // Common text patterns
  textCenter: {
    ...Typography.center,
  },
  textBold: {
    ...Typography.semibold,
  },
  textTitle: {
    ...Typography.title,
  },
  textBody: {
    ...Typography.body,
  },
  textCaption: {
    ...Typography.caption,
  },

  // Common spacing patterns
  marginBottom: {
    marginBottom: spacing(2),
  },
  marginBottomLarge: {
    marginBottom: spacing(4),
  },
  padding: {
    padding: spacing(3),
  },
  paddingHorizontal: {
    paddingHorizontal: spacing(3),
  },
  paddingVertical: {
    paddingVertical: spacing(2),
  },

  // Common overlay patterns
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Common icon patterns
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerSmall: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Common loading/error states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing(4),
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing(4),
  },

  // Common list patterns
  listItem: {
    paddingVertical: spacing(2),
    paddingHorizontal: spacing(3),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },

  // Common modal patterns
  modal: {
    borderRadius: BorderRadius.md,
    padding: spacing(4),
    ...Shadows.modal,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing(3),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
} as const;
