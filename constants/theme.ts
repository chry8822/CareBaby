export const colors = {
  bg: {
    primary: '#FEFCF9',
    elevated: '#FFFFFF',
  },
  activity: {
    nursing: '#D4849A',
    sleep: '#7BA7A0',
    diaper: '#D4A95A',
    growth: '#9B8EC4',
  },
  text: {
    primary: '#1A1A1A',
    secondary: '#6B6B6B',
  },
  accent: '#D4849A',
  border: '#F0EDE8',
  error: '#E05C5C',
  success: '#5CAE8A',
  white: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.4)',
  // 토스트 전용 색상 (접근성 대비비 AA 기준 충족)
  toast: {
    success: '#2F855A',
    error: '#E53E3E',
    info: '#2B6CB0',
  },
  // 홈 AI 인사이트 카드 배경
  insightBg: '#FDF2F5',
} as const;

export const typography = {
  display: {
    fontSize: 26,
    fontWeight: '700' as const,
    lineHeight: 34,
  },
  h2: {
    fontSize: 18,
    fontWeight: '700' as const,
    lineHeight: 24,
  },
  bodyRegular: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  bodySemiBold: {
    fontSize: 15,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
} as const;

export const spacing = {
  screenPadding: 20,
  sectionGap: 28,
  cardPadding: 20,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
} as const;

export const borderRadius = {
  card: 20,
  base: 12,
  sm: 8,
  full: 9999,
} as const;

export const layout = {
  tabBarHeight: 84,
} as const;

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;

const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  layout,
  shadows,
};

export default theme;
