import type { AppData, BusinessProfile, WorkspaceSnapshot } from '../types';
import { defaultBusiness } from './storage';
import { uid } from './format';

export function snapshotFromData(data: AppData, id?: string, name?: string): WorkspaceSnapshot {
  return {
    id: id || data.activeWorkspaceId || uid('ws'),
    name: name || data.business.name || 'Business',
    business: data.business,
    clients: data.clients,
    invoices: data.invoices,
    quotes: data.quotes,
    catalog: data.catalog,
    expenses: data.expenses,
    receipts: data.receipts,
    recurring: data.recurring || [],
    reminders: data.reminders || [],
    updatedAt: new Date().toISOString(),
  };
}

export function applySnapshot(data: AppData, snap: WorkspaceSnapshot): AppData {
  return {
    ...data,
    business: snap.business,
    clients: snap.clients,
    invoices: snap.invoices,
    quotes: snap.quotes,
    catalog: snap.catalog,
    expenses: snap.expenses,
    receipts: snap.receipts,
    recurring: snap.recurring || [],
    reminders: snap.reminders || [],
    activeWorkspaceId: snap.id,
  };
}

export function ensureWorkspaces(data: AppData): AppData {
  const recurring = data.recurring || [];
  const reminders = data.reminders || [];
  const leads = data.leads || [];
  let workspaces = data.workspaces || [];
  let activeWorkspaceId = data.activeWorkspaceId;

  if (!workspaces.length) {
    const id = uid('ws');
    activeWorkspaceId = id;
    workspaces = [
      snapshotFromData(
        { ...data, recurring, reminders, activeWorkspaceId: id },
        id,
        data.business.name || 'Primary business',
      ),
    ];
  }
  if (!activeWorkspaceId) activeWorkspaceId = workspaces[0].id;

  return {
    ...data,
    recurring,
    reminders,
    leads,
    workspaces,
    activeWorkspaceId,
  };
}

export function emptyBusinessProfile(name: string, accountEmail: string): BusinessProfile {
  return {
    ...defaultBusiness(),
    name,
    accountEmail,
    email: accountEmail,
    onboardingDone: true,
  };
}

export function emptyWorkspaceData(name: string, accountEmail: string): WorkspaceSnapshot {
  const id = uid('ws');
  return {
    id,
    name,
    business: emptyBusinessProfile(name, accountEmail),
    clients: [],
    invoices: [],
    quotes: [],
    catalog: [],
    expenses: [],
    receipts: [],
    recurring: [],
    reminders: [],
    updatedAt: new Date().toISOString(),
  };
}
