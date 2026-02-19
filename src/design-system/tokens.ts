/**
 * CareBaby 디자인 시스템 — Quiet Joy
 */

export const palette = {
  bg: {
    primary: '#FEFCF9',
    secondary: '#F7F4F0',
    elevated: '#FFFFFF',
    dim: 'rgba(0,0,0,0.3)',
  },
  activity: {
    nursing: { main: '#D4849A', light: '#F9EEF1' },
    bottle: { main: '#C9889E', light: '#F7ECF0' },
    sleep: { main: '#7BA7A0', light: '#EDF5F3' },
    diaper: { main: '#D4A95A', light: '#FBF5EA' },
    growth: { main: '#9B8EC4', light: '#F2F0F8' },
    health: { main: '#6FA8C9', light: '#EDF4F8' },
    milestone: { main: '#D4896A', light: '#FBF1EC' },
    bath: { main: '#7DBCB3', light: '#EEF7F5' },
  },
  text: {
    primary: '#1A1A1A',
    secondary: '#6B6B6B',
    tertiary: '#A0A0A0',
    inverse: '#FFFFFF',
  },
  accent: '#D4849A',
  success: '#7BA7A0',
  warning: '#D4A95A',
  error: '#C45C5C',
  border: '#EEEAE5',
  divider: '#F3F0EB',
} as const;

export const typo = {
  greeting: { size: 26, weight: '700' as const, lineHeight: 32 },
  title: { size: 20, weight: '700' as const, lineHeight: 26 },
  subtitle: { size: 18, weight: '700' as const, lineHeight: 24 },
  body: { size: 15, weight: '400' as const, lineHeight: 21 },
  caption: { size: 13, weight: '400' as const, lineHeight: 18 },
  tiny: { size: 11, weight: '500' as const, lineHeight: 14 },
} as const;

export const spacing = {
  screenPadding: 20,
  cardPadding: 20,
  sectionGap: 32,
  cardGap: 16,
  itemGap: 8,
  // legacy aliases
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const radius = {
  card: 20,
  button: 14,
  chip: 24,
  circle: 9999,
} as const;

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
} as const;

export const cardLevels = {
  level1: {
    backgroundColor: palette.bg.elevated,
    borderWidth: 1,
    borderColor: palette.border,
  },
  level2: {
    backgroundColor: palette.bg.elevated,
    ...shadow.card,
  },
  level3: {
    backgroundColor: palette.accent,
    ...shadow.card,
  },
} as const;

// ---- Compatibility exports for existing code ----
export const colors = {
  brand: {
    primary: palette.accent,
    primaryLight: palette.activity.nursing.light,
    primarySoft: palette.bg.primary,
    secondary: palette.success,
    secondaryLight: palette.activity.sleep.light,
    accent: palette.activity.growth.main,
    accentLight: palette.activity.growth.light,
    warm: palette.warning,
    warmLight: palette.activity.diaper.light,
  },
  activity: {
    feeding: palette.activity.nursing.main,
    sleep: palette.activity.sleep.main,
    diaper: palette.activity.diaper.main,
    growth: palette.activity.growth.main,
    health: palette.activity.health.main,
    milestone: palette.activity.milestone.main,
    bath: palette.activity.bath.main,
  },
  neutral: {
    white: palette.bg.elevated,
    bg: palette.bg.primary,
    card: palette.bg.elevated,
    cardHover: palette.bg.secondary,
    border: palette.border,
    borderStrong: '#E5E0D9',
    text: palette.text.primary,
    textSecondary: palette.text.secondary,
    textMuted: palette.text.tertiary,
    disabled: '#E7E3DD',
  },
  semantic: {
    success: palette.success,
    warning: palette.warning,
    error: palette.error,
    errorLight: '#FBECEC',
    info: palette.activity.health.main,
  },
  chart: {
    feeding: palette.activity.nursing.main,
    sleep: palette.activity.sleep.main,
    diaper: palette.activity.diaper.main,
    background: palette.bg.secondary,
  },
} as const;

export const typography = {
  display: { size: typo.greeting.size, weight: '700' as const, lineHeight: typo.greeting.lineHeight, letterSpacing: 0 },
  h1: { size: 24, weight: '700' as const, lineHeight: 30, letterSpacing: 0 },
  h2: { size: typo.title.size, weight: '700' as const, lineHeight: typo.title.lineHeight, letterSpacing: 0 },
  h3: { size: typo.subtitle.size, weight: '600' as const, lineHeight: typo.subtitle.lineHeight, letterSpacing: 0 },
  body: { size: typo.body.size, weight: '400' as const, lineHeight: typo.body.lineHeight, letterSpacing: 0 },
  bodyBold: { size: typo.body.size, weight: '600' as const, lineHeight: typo.body.lineHeight, letterSpacing: 0 },
  caption: { size: typo.caption.size, weight: '400' as const, lineHeight: typo.caption.lineHeight, letterSpacing: 0 },
  label: { size: typo.tiny.size, weight: '500' as const, lineHeight: typo.tiny.lineHeight, letterSpacing: 0 },
} as const;

export const borderRadius = {
  sm: 14,
  md: 16,
  lg: radius.card,
  button: radius.button,
  xl: 24,
  full: radius.circle,
} as const;

export const shadows = shadow;
export const chart = colors.chart;

export const fontSize = {
  xs: typo.tiny.size,
  sm: typo.caption.size,
  md: typo.body.size,
  lg: typo.subtitle.size,
  xl: typo.title.size,
  xxl: 24,
  display: typo.greeting.size,
} as const;
