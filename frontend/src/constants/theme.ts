const shared = {
  spacing: { xs: 4, s: 8, m: 16, l: 24, xl: 32, xxl: 48 },
  radius: { sm: 8, md: 12, lg: 16, full: 999 },
  typography: { h1: 30, h2: 22, body: 16, small: 13 },
};

export const lightTheme = {
  ...shared,
  dark: false,
  colors: {
    primary: "#4F46E5",
    primaryForeground: "#FFFFFF",
    secondary: "#10B981",
    background: "#FFFFFF",
    surface: "#F9FAFB",
    surfaceHighlight: "#F3F4F6",
    textMain: "#111827",
    textMuted: "#6B7280",
    border: "#E5E7EB",
    error: "#EF4444",
    success: "#10B981",
    warning: "#F59E0B",
    activeTabBg: "#EEF2FF",
    feedbackBg: "#EEF2FF",
  },
};

export const darkTheme = {
  ...shared,
  dark: true,
  colors: {
    primary: "#818CF8",
    primaryForeground: "#FFFFFF",
    secondary: "#34D399",
    background: "#0F172A",
    surface: "#1E293B",
    surfaceHighlight: "#334155",
    textMain: "#F1F5F9",
    textMuted: "#94A3B8",
    border: "#334155",
    error: "#F87171",
    success: "#34D399",
    warning: "#FBBF24",
    activeTabBg: "#1E1B4B",
    feedbackBg: "#1E1B4B",
  },
};

// Mantém compatibilidade com imports existentes
export const theme = lightTheme;

export type Theme = typeof lightTheme;