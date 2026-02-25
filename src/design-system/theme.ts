import {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
} from './tokens';

export interface Theme {
  colors: typeof lightThemeColors;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  typography: typeof typography;
  shadows: typeof shadows;
}

const lightThemeColors = {
  ...colors,
  neutral: {
    ...colors.neutral,
    bg: '#FAFAFA',
    card: '#FFFFFF',
    text: '#2C2C2C',
    textSecondary: '#8E8E93',
    textMuted: '#C7C7CC',
  },
};

const darkThemeColors = {
  ...colors,
  neutral: {
    ...colors.neutral,
    white: '#1C1C1E',
    bg: '#1C1C1E',
    card: '#2C2C2E',
    cardHover: '#3A3A3C',
    border: '#38383A',
    borderStrong: '#48484A',
    text: '#F2F2F7',
    textSecondary: '#AEAEB2',
    textMuted: '#636366',
    disabled: '#48484A',
  },
};

export const lightTheme: Theme = {
  colors: lightThemeColors,
  spacing,
  borderRadius,
  typography,
  shadows,
};

export const darkTheme: Theme = {
  colors: darkThemeColors,
  spacing,
  borderRadius,
  typography,
  shadows,
};
