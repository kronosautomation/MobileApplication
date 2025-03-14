import { StyleSheet } from 'react-native';
import theme from './theme';

// Global styles that can be used across the app
export const globalStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  contentContainer: {
    flexGrow: 1,
    padding: theme.spacing.md,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Card styles
  card: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  cardTitle: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  cardContent: {
    marginVertical: theme.spacing.sm,
  },
  cardFooter: {
    marginTop: theme.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },

  // Text styles
  title: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.xxl,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  bodyText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  caption: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },

  // Form styles
  formGroup: {
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.neutral.lighter,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  inputFocused: {
    borderColor: theme.colors.primary.main,
  },
  inputError: {
    borderColor: theme.colors.error.main,
  },
  errorText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.error.main,
    marginTop: theme.spacing.xs,
  },

  // Button styles
  buttonPrimary: {
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: {
    backgroundColor: theme.colors.secondary.main,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary.main,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.primary.contrast,
  },
  buttonTextOutline: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.primary.main,
  },
  buttonDisabled: {
    opacity: 0.6,
  },

  // List styles
  listItem: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral.lightest,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.neutral.lightest,
    marginVertical: theme.spacing.sm,
  },

  // Spacing helpers
  marginTop: {
    marginTop: theme.spacing.md,
  },
  marginBottom: {
    marginBottom: theme.spacing.md,
  },
  marginVertical: {
    marginVertical: theme.spacing.md,
  },
  marginHorizontal: {
    marginHorizontal: theme.spacing.md,
  },
  paddingTop: {
    paddingTop: theme.spacing.md,
  },
  paddingBottom: {
    paddingBottom: theme.spacing.md,
  },
  paddingVertical: {
    paddingVertical: theme.spacing.md,
  },
  paddingHorizontal: {
    paddingHorizontal: theme.spacing.md,
  },
});

export { theme };
export default globalStyles;
