import { createClient, type Session, type SupabaseClient, type User } from '@supabase/supabase-js';
import { config, isCloudEnabled } from './config';
import type { AppData } from '../types';

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isCloudEnabled()) return null;
  if (!client) {
    client = createClient(config.supabaseUrl!, config.supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return client;
}

export async function cloudSignUp(email: string, password: string, meta?: { businessName?: string; owner?: string; phone?: string }) {
  const sb = getSupabase();
  if (!sb) throw new Error('Cloud auth not configured');
  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: {
      data: meta || {},
    },
  });
  if (error) throw error;
  return data;
}

export async function cloudSignIn(email: string, password: string) {
  const sb = getSupabase();
  if (!sb) throw new Error('Cloud auth not configured');
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function cloudSignOut() {
  const sb = getSupabase();
  if (!sb) return;
  await sb.auth.signOut();
}

export async function cloudGetSession(): Promise<Session | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  return data.session;
}

export async function cloudGetUser(): Promise<User | null> {
  const session = await cloudGetSession();
  return session?.user ?? null;
}

/** Strip session before cloud storage */
export function workspacePayload(data: AppData): AppData {
  return {
    ...data,
    session: { loggedIn: true },
    business: {
      ...data.business,
      // never store plaintext password in cloud
      accountPassword: '',
    },
  };
}

export async function cloudLoadWorkspace(userId: string): Promise<AppData | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from('workspaces')
    .select('data')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  if (!data?.data || Object.keys(data.data as object).length === 0) return null;
  return data.data as AppData;
}

export async function cloudSaveWorkspace(userId: string, appData: AppData): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const payload = workspacePayload(appData);
  const { error } = await sb.from('workspaces').upsert({
    user_id: userId,
    data: payload,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function cloudGetSubscription(userId: string): Promise<{ plan: string; status: string } | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from('subscriptions')
    .select('plan, status')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) return null;
  return data;
}
