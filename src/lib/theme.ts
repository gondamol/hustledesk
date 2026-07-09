import type { BrandTheme } from '../types';

export const DEFAULT_THEME: BrandTheme = {
  primary: '#0f766e',
  primaryDark: '#0a5c56',
  primarySoft: '#ccfbf1',
  accent: '#f59e0b',
  background: '#f4f7f6',
  surface: '#ffffff',
  text: '#0f1f1c',
  muted: '#5b6e69',
  border: '#d7e3df',
  font: 'system',
  radius: '14px',
};

export const THEME_PRESETS: { id: string; name: string; theme: BrandTheme }[] = [
  { id: 'teal', name: 'Coast Teal', theme: { ...DEFAULT_THEME } },
  {
    id: 'navy',
    name: 'Nairobi Navy',
    theme: {
      primary: '#1e3a8a',
      primaryDark: '#1e40af',
      primarySoft: '#dbeafe',
      accent: '#f59e0b',
      background: '#f1f5f9',
      surface: '#ffffff',
      text: '#0f172a',
      muted: '#64748b',
      border: '#e2e8f0',
      font: 'system',
      radius: '12px',
    },
  },
  {
    id: 'forest',
    name: 'Safari Green',
    theme: {
      primary: '#166534',
      primaryDark: '#14532d',
      primarySoft: '#dcfce7',
      accent: '#ca8a04',
      background: '#f7fef9',
      surface: '#ffffff',
      text: '#14532d',
      muted: '#4d7c5a',
      border: '#ccebd6',
      font: 'system',
      radius: '14px',
    },
  },
  {
    id: 'berry',
    name: 'Berry Bold',
    theme: {
      primary: '#9f1239',
      primaryDark: '#881337',
      primarySoft: '#ffe4e6',
      accent: '#ea580c',
      background: '#fff7f8',
      surface: '#ffffff',
      text: '#4c0519',
      muted: '#9f6b7a',
      border: '#fecdd3',
      font: 'system',
      radius: '16px',
    },
  },
  {
    id: 'sunset',
    name: 'Mombasa Sunset',
    theme: {
      primary: '#c2410c',
      primaryDark: '#9a3412',
      primarySoft: '#ffedd5',
      accent: '#0891b2',
      background: '#fff7ed',
      surface: '#ffffff',
      text: '#431407',
      muted: '#9a6b4f',
      border: '#fed7aa',
      font: 'system',
      radius: '14px',
    },
  },
  {
    id: 'slate',
    name: 'Modern Slate',
    theme: {
      primary: '#334155',
      primaryDark: '#1e293b',
      primarySoft: '#e2e8f0',
      accent: '#0ea5e9',
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#0f172a',
      muted: '#64748b',
      border: '#e2e8f0',
      font: 'system',
      radius: '10px',
    },
  },
];

function clamp(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const h = hex.replace('#', '').trim();
  if (h.length === 3) {
    return {
      r: parseInt(h[0] + h[0], 16),
      g: parseInt(h[1] + h[1], 16),
      b: parseInt(h[2] + h[2], 16),
    };
  }
  if (h.length !== 6) return null;
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

export function rgbToHex(r: number, g: number, b: number) {
  return (
    '#' +
    [r, g, b]
      .map((x) => clamp(x).toString(16).padStart(2, '0'))
      .join('')
  );
}

export function darken(hex: string, amount = 0.18): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return rgbToHex(rgb.r * (1 - amount), rgb.g * (1 - amount), rgb.b * (1 - amount));
}

export function lighten(hex: string, amount = 0.85): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return rgbToHex(
    rgb.r + (255 - rgb.r) * amount,
    rgb.g + (255 - rgb.g) * amount,
    rgb.b + (255 - rgb.b) * amount,
  );
}

export function themeFromPrimary(primary: string, partial?: Partial<BrandTheme>): BrandTheme {
  return {
    ...DEFAULT_THEME,
    ...partial,
    primary,
    primaryDark: partial?.primaryDark || darken(primary, 0.22),
    primarySoft: partial?.primarySoft || lighten(primary, 0.88),
  };
}

export function normalizeTheme(t?: Partial<BrandTheme> | null, brandColor?: string): BrandTheme {
  const base = brandColor ? themeFromPrimary(brandColor) : DEFAULT_THEME;
  return { ...base, ...t, primary: t?.primary || brandColor || base.primary };
}

export function applyThemeToDocument(theme: BrandTheme) {
  const root = document.documentElement;
  root.style.setProperty('--brand', theme.primary);
  root.style.setProperty('--brand-dark', theme.primaryDark || darken(theme.primary));
  root.style.setProperty('--brand-soft', theme.primarySoft || lighten(theme.primary));
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--bg', theme.background);
  root.style.setProperty('--surface', theme.surface);
  root.style.setProperty('--surface-2', theme.primarySoft || lighten(theme.primary));
  root.style.setProperty('--ink', theme.text);
  root.style.setProperty('--muted', theme.muted);
  root.style.setProperty('--line', theme.border);
  root.style.setProperty('--radius', theme.radius || '14px');
  const font =
    theme.font === 'serif'
      ? 'Georgia, "Times New Roman", serif'
      : theme.font === 'rounded'
        ? '"Trebuchet MS", "Segoe UI", system-ui, sans-serif'
        : '"Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
  root.style.setProperty('--font', font);
  document.body.style.background = theme.background;
  document.body.style.color = theme.text;
}

export function clearThemeFromDocument() {
  const keys = [
    '--brand',
    '--brand-dark',
    '--brand-soft',
    '--accent',
    '--bg',
    '--surface',
    '--surface-2',
    '--ink',
    '--muted',
    '--line',
    '--radius',
    '--font',
  ];
  keys.forEach((k) => document.documentElement.style.removeProperty(k));
  document.body.style.background = '';
  document.body.style.color = '';
}

/** Extract dominant colors from logo (client-side, no AI key) */
export async function extractColorsFromLogo(dataUrl: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const size = 64;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve([]);
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);
        const buckets = new Map<string, number>();
        for (let i = 0; i < data.length; i += 4) {
          const a = data[i + 3];
          if (a < 128) continue;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // skip near-white / near-black
          if (r > 245 && g > 245 && b > 245) continue;
          if (r < 12 && g < 12 && b < 12) continue;
          const key = `${Math.round(r / 24) * 24},${Math.round(g / 24) * 24},${Math.round(b / 24) * 24}`;
          buckets.set(key, (buckets.get(key) || 0) + 1);
        }
        const sorted = [...buckets.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
        const colors = sorted.map(([k]) => {
          const [r, g, b] = k.split(',').map(Number);
          return rgbToHex(r, g, b);
        });
        resolve(colors);
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error('Could not load logo'));
    img.src = dataUrl;
  });
}

export function themeFromLogoColors(colors: string[]): BrandTheme {
  const primary = colors[0] || DEFAULT_THEME.primary;
  const accent = colors[1] || colors[0] || DEFAULT_THEME.accent;
  return themeFromPrimary(primary, {
    accent,
    background: lighten(primary, 0.94),
    border: lighten(primary, 0.75),
    muted: darken(primary, 0.35),
  });
}

/**
 * Offline “AI-ish” brand palette from a short description.
 * Uses keyword heuristics so theming works without API keys.
 */
export function suggestThemeFromPromptLocal(prompt: string, businessName = ''): BrandTheme {
  const t = `${prompt} ${businessName}`.toLowerCase();
  if (/bank|fintech|finance|insurance|law|legal|consult/.test(t))
    return THEME_PRESETS.find((p) => p.id === 'navy')!.theme;
  if (/farm|agri|green|eco|health|clinic|hospital|organic/.test(t))
    return THEME_PRESETS.find((p) => p.id === 'forest')!.theme;
  if (/beauty|fashion|salon|spa|flower|wedding|women/.test(t))
    return THEME_PRESETS.find((p) => p.id === 'berry')!.theme;
  if (/food|restaurant|cafe|hotel|travel|tourism|safari/.test(t))
    return THEME_PRESETS.find((p) => p.id === 'sunset')!.theme;
  if (/tech|software|saas|startup|digital|media/.test(t))
    return THEME_PRESETS.find((p) => p.id === 'slate')!.theme;
  if (/build|construction|hardware|garage|auto|logistics/.test(t))
    return themeFromPrimary('#b45309', { accent: '#0f766e' });
  // hash name for stable unique-ish color
  let h = 0;
  for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0;
  const hue = h % 360;
  const primary = hslToHex(hue, 55, 35);
  return themeFromPrimary(primary, { accent: hslToHex((hue + 40) % 360, 70, 50) });
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return rgbToHex(255 * f(0), 255 * f(8), 255 * f(4));
}

/** Call server AI if configured; falls back to local heuristic */
export async function suggestThemeAI(params: {
  businessName: string;
  industry?: string;
  prompt: string;
  logoColors?: string[];
}): Promise<{ theme: BrandTheme; source: 'ai' | 'local' | 'logo'; message?: string }> {
  try {
    const res = await fetch('/api/theme/suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.theme?.primary) {
        return {
          theme: normalizeTheme(data.theme),
          source: data.source || 'ai',
          message: data.message,
        };
      }
    }
  } catch {
    /* fall through */
  }

  if (params.logoColors?.length) {
    return {
      theme: themeFromLogoColors(params.logoColors),
      source: 'logo',
      message: 'Palette built from your logo colours (offline).',
    };
  }

  return {
    theme: suggestThemeFromPromptLocal(params.prompt || params.industry || '', params.businessName),
    source: 'local',
    message: 'Smart local palette (connect AI key on Vercel for Grok/OpenAI suggestions).',
  };
}
