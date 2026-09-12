import { requestId as createRequestId } from "./requestId";
import type { ScanSource } from '../types/scan';
import { normalizeTrackingCode } from './normalization';
import { commitScan } from './storage';
export class CameraDebounce {
  private last = new Map<string, number>();
  ignore(code: string, now = Date.now()) {
    const previous = this.last.get(code); this.last.set(code, now);
    if (this.last.size > 100) for (const [key, time] of this.last) if (now - time > 1500) this.last.delete(key);
    return previous !== undefined && now - previous < 1500;
  }
}
export class ScanProcessor {
  private debounce = new CameraDebounce();
  private queue: Promise<unknown> = Promise.resolve();
  private failed = false;
  constructor(private submit = commitScan, private onStart?: () => void) {}
  processScan(rawCode: string, source: ScanSource = 'manual') {
    const trackingCode = normalizeTrackingCode(rawCode);
    if (!trackingCode || (source === 'camera' && this.debounce.ignore(trackingCode))) return Promise.resolve(null);
    const requestId = createRequestId();
    const job = this.queue.then(async () => {
      if (this.failed) throw new Error('Database connection interrupted. Reload before scanning.');
      this.onStart?.();
      const saved = await this.submit(trackingCode, requestId);
      return { result: saved.record, counters: saved.counters };
    });
    this.queue = job.catch(() => { this.failed = true; });
    return job;
  }
  async idle() { await this.queue; }
}
