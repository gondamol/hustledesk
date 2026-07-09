/** Feature flags from env — safe on client (VITE_ only) */

export const config = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string | undefined,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined,
  appUrl: (import.meta.env.VITE_PUBLIC_APP_URL as string | undefined) || (typeof window !== 'undefined' ? window.location.origin : ''),
  proPriceKes: 799,
};

export function isCloudEnabled(): boolean {
  return !!(config.supabaseUrl && config.supabaseAnonKey);
}

export async function fetchApiHealth(): Promise<{
  ok: boolean;
  features: { supabase: boolean; mpesa: boolean; email: boolean };
} | null> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
