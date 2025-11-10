// src/theme/index.ts
export const colors = {
  bg: '#F5FBF7',
  card: '#FFFFFF',
  outline: '#E3E8EC',
  text: '#163C2F',
  subtext: '#5B6B65',
  primary: '#2FBE83',
  onPrimary: '#FFFFFF',   // <-- THÊM KEY NÀY
  danger: '#F04438',
};

export const lightColors = {
  bg: '#F6FAF7',
  bgSoft: '#F1F6F3',     // <-- thêm
  card: '#FFFFFF',
  outline: '#E5E7EB',
  text: '#0B3B2E',
  subtext: '#5B6B64',
  primary: '#22C55E',
  onPrimary: '#FFFFFF',
};

export const darkColors = {
  bg: '#08110D',
  bgSoft: '#0B1410',     // <-- thêm
  card: '#0F1A14',
  outline: '#1F2B25',
  text: '#E6F3EC',
  subtext: '#92A39B',
  primary: '#22C55E',
  onPrimary: '#06270F',
}

export const spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32,
};

export const radius = {
  sm: 6, md: 10, lg: 14, xl: 18,
};

export type AppColors = typeof lightColors;