import { requestId as createRequestId } from "./requestId";
import type { Dataset, ImportMetadata } from '../types/order';
import type { Counters, ScanResult, ScanRecord } from '../types/scan';
export interface RemoteState { metadata?: ImportMetadata; counters: Counters; revision: string }
async function request<T>(path = '', body?: unknown): Promise<T> {
  const response = await fetch('/api/pack-check' + path, { method: body ? 'POST' : 'GET', headers: body ? { 'Content-Type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined, cache: 'no-store', signal: AbortSignal.timeout(body && (body as { action?: string }).action === 'scan' ? 10000 : body ? 60000 : 15000) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Database request failed.');
  return data as T;
}
export const getRemoteState = () => request<RemoteState>();
export async function loadData() {
  let state = await getRemoteState();
  if (!state.metadata) {
    const { exportLocalSnapshot } = await import('./localStorage');
    const snapshot = await exportLocalSnapshot().catch(() => null);
    if (snapshot) {
      await request('', { action: 'migrate', requestId: createRequestId(), ...snapshot });
      state = await getRemoteState();
    }
  }
  return state;
}
export const saveDataset = (data: Dataset, clear: boolean) => request<RemoteState>('', { action: 'import', requestId: createRequestId(), data, clear });
export const readHistory = (offset = 0, limit = 20) => request<ScanRecord[]>(`?view=history&offset=${offset}&limit=${limit}`);
export const resetHistory = () => request<RemoteState>('', { action: 'reset', requestId: createRequestId() });
export async function commitScan(trackingCode: string, requestId: string) {
  const body = { action: 'scan', trackingCode, requestId };
  // A lost response can be retried using the same ID without a false duplicate.
  try { return await request<{ record: ScanResult; counters: Counters }>('', body); }
  catch { return request<{ record: ScanResult; counters: Counters }>('', body); }
}

export function browseParcels(kind: import('../types/browse').BrowseKind, filter: import('../types/browse').BrowseFilter, query: string, carrier: string, page: number) {
  const params = new URLSearchParams({ view: 'browse', kind, filter, query, carrier, offset: String(page * 50), limit: '50' });
  return request<import('../types/browse').BrowseResult>('?' + params);
}
