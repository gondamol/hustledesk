import { useState } from 'react';
import { Palette, Sparkles, Image as ImageIcon, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { BrandTheme } from '../types';
import {
  THEME_PRESETS,
  applyThemeToDocument,
  extractColorsFromLogo,
  normalizeTheme,
  suggestThemeAI,
  themeFromLogoColors,
  themeFromPrimary,
} from '../lib/theme';

export function BrandStudio() {
  const { data, updateBusiness } = useApp();
  const [theme, setTheme] = useState<BrandTheme>(() =>
    normalizeTheme(data.business.theme, data.business.brandColor),
  );
  const [prompt, setPrompt] = useState(
    `${data.business.name || 'My business'} — professional invoices for Kenyan clients`,
  );
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [logoColors, setLogoColors] = useState<string[]>([]);

  const preview = (t: BrandTheme) => {
    setTheme(t);
    applyThemeToDocument(t);
  };

  const save = () => {
    updateBusiness({
      theme,
      brandColor: theme.primary,
    });
    setStatus('Brand theme saved. App, invoices, and share pages will use these colours.');
  };

  const runAi = async () => {
    setLoading(true);
    setStatus('');
    try {
      let colors = logoColors;
      if (!colors.length && data.business.logoDataUrl) {
        colors = await extractColorsFromLogo(data.business.logoDataUrl);
        setLogoColors(colors);
      }
      const res = await suggestThemeAI({
        businessName: data.business.name,
        prompt,
        logoColors: colors,
      });
      preview(res.theme);
      setStatus(
        `${res.source === 'ai' ? 'AI' : res.source === 'logo' ? 'Logo' : 'Smart'} theme ready. ${res.message || ''} Click Save to keep it.`,
      );
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Theme suggest failed');
    } finally {
      setLoading(false);
    }
  };

  const fromLogo = async () => {
    if (!data.business.logoDataUrl) {
      setStatus('Upload a logo under Business settings first.');
      return;
    }
    setLoading(true);
    try {
      const colors = await extractColorsFromLogo(data.business.logoDataUrl);
      setLogoColors(colors);
      const t = themeFromLogoColors(colors);
      preview(t);
      setStatus('Theme extracted from your logo. Save to apply permanently.');
    } catch {
      setStatus('Could not read colours from logo.');
    } finally {
      setLoading(false);
    }
  };

  const setField = <K extends keyof BrandTheme>(key: K, value: BrandTheme[K]) => {
    const next = { ...theme, [key]: value };
    if (key === 'primary' && typeof value === 'string') {
      const full = themeFromPrimary(value, { accent: theme.accent, font: theme.font, radius: theme.radius });
      preview(full);
      return;
    }
    preview(next);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>
            <Palette size={28} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Brand studio
          </h1>
          <p>
            Match HustleDesk to your company colours — live preview on buttons, sidebar accents, and
            documents. Optional AI suggests a full palette from your brand story or logo.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={save}>
          <Check size={16} /> Save brand theme
        </button>
      </div>

      {status && <div className="alert alert-info">{status}</div>}

      <div className="grid-2">
        <div className="card">
          <h3>
            <Sparkles size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            AI brand theme
          </h3>
          <p className="muted">
            Describe your brand (industry, vibe, colours you like). Uses Grok/OpenAI if configured on
            Vercel; otherwise a smart offline palette + logo colours.
          </p>
          <div className="field">
            <label>Brand description</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Eco-friendly farm produce supplier in Nakuru — fresh, trustworthy, green…"
              rows={4}
            />
          </div>
          <div className="toolbar" style={{ marginBottom: 0 }}>
            <button type="button" className="btn btn-primary" disabled={loading} onClick={runAi}>
              <Sparkles size={16} /> {loading ? 'Designing…' : 'Generate theme'}
            </button>
            <button type="button" className="btn btn-secondary" disabled={loading} onClick={fromLogo}>
              <ImageIcon size={16} /> From logo colours
            </button>
          </div>
          {logoColors.length > 0 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              {logoColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  title={c}
                  onClick={() => preview(themeFromPrimary(c, { accent: theme.accent }))}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    border: '2px solid var(--line)',
                    background: c,
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3>Live preview</h3>
          <div
            style={{
              borderRadius: 12,
              overflow: 'hidden',
              border: `1px solid ${theme.border}`,
              background: theme.background,
              color: theme.text,
            }}
          >
            <div style={{ background: theme.primary, color: '#fff', padding: '0.85rem 1rem', fontWeight: 700 }}>
              {data.business.name || 'Your Business'} · Invoice
            </div>
            <div style={{ padding: '1rem', background: theme.surface }}>
              <div style={{ fontSize: '0.85rem', color: theme.muted }}>Bill to · Client Name</div>
              <div style={{ fontWeight: 700, margin: '0.35rem 0' }}>Brand design package</div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: `1px solid ${theme.border}`,
                  paddingTop: 8,
                  marginTop: 8,
                }}
              >
                <span style={{ color: theme.muted }}>Total due</span>
                <strong style={{ color: theme.primary }}>KES 45,000.00</strong>
              </div>
              <button
                type="button"
                style={{
                  marginTop: 12,
                  background: theme.primary,
                  color: '#fff',
                  border: 0,
                  borderRadius: theme.radius,
                  padding: '0.55rem 1rem',
                  fontWeight: 600,
                }}
              >
                Pay via M-Pesa
              </button>
              <span
                style={{
                  marginLeft: 8,
                  background: theme.primarySoft,
                  color: theme.primaryDark,
                  borderRadius: 999,
                  padding: '0.2rem 0.55rem',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                Accent {theme.accent}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <h3>Presets</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
          {THEME_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => preview({ ...p.theme })}
              style={{ borderLeft: `4px solid ${p.theme.primary}` }}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <h3>Fine-tune colours</h3>
        <div className="form-grid three" style={{ marginTop: '0.75rem' }}>
          {(
            [
              ['primary', 'Primary'],
              ['primaryDark', 'Primary dark'],
              ['primarySoft', 'Primary soft'],
              ['accent', 'Accent'],
              ['background', 'App background'],
              ['surface', 'Cards'],
              ['text', 'Text'],
              ['muted', 'Muted text'],
              ['border', 'Borders'],
            ] as const
          ).map(([key, label]) => (
            <div className="field" key={key}>
              <label>{label}</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="color"
                  value={theme[key]}
                  onChange={(e) => setField(key, e.target.value)}
                />
                <input
                  value={theme[key]}
                  onChange={(e) => setField(key, e.target.value)}
                  style={{ flex: 1 }}
                />
              </div>
            </div>
          ))}
          <div className="field">
            <label>Font style</label>
            <select
              value={theme.font}
              onChange={(e) => setField('font', e.target.value as BrandTheme['font'])}
            >
              <option value="system">Modern sans</option>
              <option value="rounded">Friendly rounded</option>
              <option value="serif">Classic serif</option>
            </select>
          </div>
          <div className="field">
            <label>Corner radius</label>
            <select value={theme.radius} onChange={(e) => setField('radius', e.target.value)}>
              <option value="8px">Sharp 8px</option>
              <option value="12px">Soft 12px</option>
              <option value="14px">Default 14px</option>
              <option value="18px">Round 18px</option>
            </select>
          </div>
        </div>
        <button type="button" className="btn btn-primary" style={{ marginTop: '0.75rem' }} onClick={save}>
          Save brand theme
        </button>
      </div>
    </div>
  );
}
