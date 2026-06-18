export const FIREWORK_COLORS = [
  '#FFD600', '#FF6B35', '#F06292', '#4FC3F7',
  '#66BB6A', '#AB47BC', '#80DEEA', '#EF5350',
  '#AED581', '#7E57C2', '#F48FB1', '#FFCA28',
];

export const Colors = {
  white: '#FFFFFF',
  black: '#000000',
  background: '#F4F7FB',
  surface: '#E9EEF5',

  surfaceDeep: '#E3EAF4',
  surfaceAlt: '#F8FAFD',
  surfaceCard: '#FFFFFF',
  surfaceHighlight: '#EEF3FA',
  surfaceMuted: '#F2F5FA',
  borderSoft: '#D9E2EE',

  btnPrimary: '#FF6B35',
  labelPrimary: '#FFFFFF',
  txtPrimary: '#1F2A37',

  overlayDark: 'rgba(15,23,42,0.45)',
  pokeballRed: '#FF1C1C',

  game: {
    win:  '#4ADE80',
    loss: '#F87171',
  },

  semantic: {
    error:   { bg: '#FEECE8', border: '#F97362', text: '#B42318' },
    success: { bg: '#EAF8EE', border: '#66BB6A', text: '#1F7A3E' },
    warning: { bg: '#FFF8E5', border: '#FFD600', text: '#9A6B00' },
    info:    { bg: '#EAF5FE', border: '#4FC3F7', text: '#175CD3' },
  },

  gray: {
    100: '#F8FAFC',
    500: '#64748B',
    800: '#334155',
  },

  whiteAlpha: {
    '05': 'rgba(15,23,42,0.05)',
    '06': 'rgba(15,23,42,0.06)',
    '07': 'rgba(15,23,42,0.07)',
    '08': 'rgba(15,23,42,0.08)',
    '12': 'rgba(15,23,42,0.12)',
    '30': 'rgba(15,23,42,0.30)',
    '35': 'rgba(15,23,42,0.35)',
    '40': 'rgba(15,23,42,0.40)',
    '45': 'rgba(15,23,42,0.45)',
    '50': 'rgba(15,23,42,0.50)',
    '55': 'rgba(15,23,42,0.55)',
    '65': 'rgba(15,23,42,0.65)',
  },

  primaryAlpha: {
    '18': 'rgba(255,107,53,0.18)',
    '25': 'rgba(255,107,53,0.25)',
    '30': 'rgba(255,107,53,0.30)',
    '60': 'rgba(255,107,53,0.60)',
  },

  types: {
    fogo:     { bg: '#FFF2EC', accent: '#FF6B35', glow: 'rgba(255,107,53,0.24)'  },
    água:     { bg: '#EAF6FF', accent: '#4FC3F7', glow: 'rgba(79,195,247,0.24)'  },
    grama:    { bg: '#ECF8EE', accent: '#66BB6A', glow: 'rgba(102,187,106,0.24)' },
    elétrico: { bg: '#FFF9E8', accent: '#FFD600', glow: 'rgba(255,214,0,0.24)'   },
    psíquico: { bg: '#FFEFF4', accent: '#F06292', glow: 'rgba(240,98,146,0.24)'  },
    gelo:     { bg: '#EAFBFF', accent: '#80DEEA', glow: 'rgba(128,222,234,0.24)' },
    dragão:   { bg: '#F2EEFF', accent: '#7E57C2', glow: 'rgba(126,87,194,0.24)'  },
    trevas:   { bg: '#F1F3F5', accent: '#8D6E63', glow: 'rgba(141,110,99,0.24)'  },
    fada:     { bg: '#FFF0F8', accent: '#F48FB1', glow: 'rgba(244,143,177,0.24)' },
    lutador:  { bg: '#FFF0EE', accent: '#EF5350', glow: 'rgba(239,83,80,0.24)'   },
    veneno:   { bg: '#F7EEFA', accent: '#AB47BC', glow: 'rgba(171,71,188,0.24)'  },
    terra:    { bg: '#FAF4EC', accent: '#D4A373', glow: 'rgba(212,163,115,0.24)' },
    pedra:    { bg: '#F7F3EF', accent: '#BCAAA4', glow: 'rgba(188,170,164,0.24)' },
    inseto:   { bg: '#F4F9EA', accent: '#AED581', glow: 'rgba(174,213,129,0.24)' },
    fantasma: { bg: '#F3F0FB', accent: '#9575CD', glow: 'rgba(149,117,205,0.24)' },
    aço:      { bg: '#EFF4F6', accent: '#90A4AE', glow: 'rgba(144,164,174,0.24)' },
    voador:   { bg: '#EFF7FF', accent: '#81D4FA', glow: 'rgba(129,212,250,0.24)' },
    normal:   { bg: '#F5F6F8', accent: '#BDBDBD', glow: 'rgba(189,189,189,0.24)' },
  } as Record<string, { bg: string; accent: string; glow: string }>,
} as const;

export function getColor(types: string[]): { bg: string; accent: string; glow: string } {
  const primary = types[0] ?? 'normal';
  return Colors.types[primary] ?? Colors.types['normal'];
}