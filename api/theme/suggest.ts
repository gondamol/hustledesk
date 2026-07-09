import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleOptions, setCors } from '../_lib/cors.js';

/**
 * POST /api/theme/suggest
 * Uses xAI (Grok) or OpenAI if keys present; else returns heuristic palette.
 * Body: { businessName, industry?, prompt, logoColors? }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return handleOptions(res);
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = req.body || {};
  const businessName = String(body.businessName || 'Business');
  const industry = String(body.industry || '');
  const prompt = String(body.prompt || '');
  const logoColors = Array.isArray(body.logoColors) ? body.logoColors.slice(0, 6) : [];

  const xaiKey = process.env.XAI_API_KEY || process.env.GROK_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  const system = `You are a brand designer for African SMEs. Return ONLY valid JSON (no markdown) with this shape:
{"primary":"#RRGGBB","primaryDark":"#RRGGBB","primarySoft":"#RRGGBB","accent":"#RRGGBB","background":"#RRGGBB","surface":"#FFFFFF","text":"#RRGGBB","muted":"#RRGGBB","border":"#RRGGBB","font":"system"|"serif"|"rounded","radius":"12px","rationale":"one sentence"}
Choose accessible contrast (text on background, white buttons on primary). Prefer professional colours for invoices.`;

  const userMsg = `Business: ${businessName}
Industry: ${industry || 'general SME'}
Brand description: ${prompt || 'professional Kenyan small business'}
Logo colours (if any): ${logoColors.join(', ') || 'none'}
Design a cohesive invoice/app theme.`;

  try {
    if (xaiKey) {
      const theme = await callChatCompletions({
        url: 'https://api.x.ai/v1/chat/completions',
        key: xaiKey,
        model: process.env.XAI_MODEL || 'grok-2-latest',
        system,
        userMsg,
      });
      if (theme) {
        return res.status(200).json({
          theme,
          source: 'ai',
          provider: 'xai',
          message: theme.rationale || 'Generated with Grok',
        });
      }
    }

    if (openaiKey) {
      const theme = await callChatCompletions({
        url: 'https://api.openai.com/v1/chat/completions',
        key: openaiKey,
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        system,
        userMsg,
      });
      if (theme) {
        return res.status(200).json({
          theme,
          source: 'ai',
          provider: 'openai',
          message: theme.rationale || 'Generated with OpenAI',
        });
      }
    }
  } catch (e) {
    // fall through to local
    console.warn('theme AI failed', e);
  }

  // Offline heuristic (same spirit as client local)
  const theme = localHeuristic(prompt || industry, businessName, logoColors);
  return res.status(200).json({
    theme,
    source: logoColors.length ? 'logo' : 'local',
    message: xaiKey || openaiKey
      ? 'AI call failed — used smart fallback palette.'
      : 'No XAI_API_KEY / OPENAI_API_KEY — used smart local palette. Add a key on Vercel for real AI themes.',
  });
}

async function callChatCompletions(opts: {
  url: string;
  key: string;
  model: string;
  system: string;
  userMsg: string;
}) {
  const res = await fetch(opts.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${opts.key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: opts.model,
      temperature: 0.6,
      messages: [
        { role: 'system', content: opts.system },
        { role: 'user', content: opts.userMsg },
      ],
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`LLM ${res.status}: ${t.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content || '';
  return parseThemeJson(content);
}

function parseThemeJson(content: string): Record<string, string> | null {
  try {
    const cleaned = content.replace(/```json|```/g, '').trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start < 0 || end < 0) return null;
    const obj = JSON.parse(cleaned.slice(start, end + 1)) as Record<string, string>;
    if (!obj.primary || !/^#?[0-9a-fA-F]{6}$/.test(obj.primary.replace('#', '').length === 6 ? obj.primary : `#${obj.primary}`)) {
      // soft check
    }
    const hex = (v: string, fb: string) => {
      if (!v) return fb;
      const h = v.startsWith('#') ? v : `#${v}`;
      return /^#[0-9a-fA-F]{6}$/.test(h) ? h : fb;
    };
    return {
      primary: hex(obj.primary, '#0f766e'),
      primaryDark: hex(obj.primaryDark, '#0a5c56'),
      primarySoft: hex(obj.primarySoft, '#ccfbf1'),
      accent: hex(obj.accent, '#f59e0b'),
      background: hex(obj.background, '#f4f7f6'),
      surface: hex(obj.surface, '#ffffff'),
      text: hex(obj.text, '#0f1f1c'),
      muted: hex(obj.muted, '#5b6e69'),
      border: hex(obj.border, '#d7e3df'),
      font: ['system', 'serif', 'rounded'].includes(obj.font) ? obj.font : 'system',
      radius: obj.radius || '14px',
      rationale: obj.rationale || '',
    };
  } catch {
    return null;
  }
}

function localHeuristic(prompt: string, name: string, logoColors: string[]) {
  if (logoColors[0]) {
    const p = logoColors[0];
    return {
      primary: p,
      primaryDark: p,
      primarySoft: '#f0fdfa',
      accent: logoColors[1] || '#f59e0b',
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#0f172a',
      muted: '#64748b',
      border: '#e2e8f0',
      font: 'system',
      radius: '14px',
    };
  }
  const t = `${prompt} ${name}`.toLowerCase();
  if (/bank|finance|law/.test(t))
    return {
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
    };
  if (/farm|health|green/.test(t))
    return {
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
    };
  return {
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
}
