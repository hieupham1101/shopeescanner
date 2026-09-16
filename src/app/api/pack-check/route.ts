import { z } from 'zod';
import { getState, getHistory, browseParcels, scanTrackingCode, importDataset, clearScanHistory, migrateLocalData, RequestError } from '../../../server/packRepository';
import { normalizeTrackingCode } from '../../../lib/normalization';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
const text = z.string().max(4000);
const order = z.object({ orderId: text, trackingCode: z.string().max(512).transform(normalizeTrackingCode).pipe(z.string().min(1)), orderStatus: text, cancellationReason: text.optional(), carrier: text.optional(), shippingMethod: text.optional(), shipDate: text.optional(), deliveryTime: text.optional(), returnRefundStatus: text.optional() });
const dataset = z.object({ orders: z.array(order).min(1).max(150000), metadata: z.object({ filename: text, importedAt: z.number().finite(), total: z.number().int().nonnegative(), waiting: z.number().int().nonnegative(), shipping: z.number().int().nonnegative(), cancelled: z.number().int().nonnegative(), skipped: z.number().int().nonnegative(), merged: z.number().int().nonnegative() }) });
const record = z.object({ id: z.string().uuid(), trackingCode: z.string().max(512), status: z.enum(['ACCEPTED','DUPLICATE','CANCELLED','PICKED_UP','UNKNOWN']), scannedAt: z.number().int().nonnegative(), orderId: text.optional(), carrier: text.optional(), firstScannedAt: z.number().int().nonnegative().optional(), scanCount: z.number().int().positive().optional() });
const mutation = z.discriminatedUnion('action', [
  z.object({ action: z.literal('scan'), requestId: z.string().uuid(), trackingCode: z.string().min(1).max(512) }),
  z.object({ action: z.literal('import'), requestId: z.string().uuid(), data: dataset, clear: z.boolean() }),
  z.object({ action: z.literal('reset'), requestId: z.string().uuid() }),
  z.object({ action: z.literal('migrate'), requestId: z.string().uuid(), data: dataset, history: z.array(record).max(1000000) }),
]);
function json(data: unknown, status = 200) { return Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } }); }
function failure(error: unknown) {
  if (error instanceof RequestError) return json({ error: error.message }, error.status);
  if (error instanceof z.ZodError || error instanceof SyntaxError) return json({ error: 'Invalid request data.' }, 400);
  console.error('Pack Check database operation failed', error instanceof Error ? error.name : 'UnknownError');
  return json({ error: 'Không kết nối được database. Dừng bàn giao và thử lại khi có mạng.' }, 503);
}
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    if (url.searchParams.get('view') === 'browse') {
      const params = url.searchParams;
      const kind = z.enum(['orders', 'scans']).parse(params.get('kind') ?? 'orders');
      const filter = (kind === 'orders' ? z.enum(['ALL', 'UNSCANNED']) : z.enum(['ALL', 'ACCEPTED', 'DUPLICATE', 'CANCELLED', 'PICKED_UP', 'UNKNOWN'])).parse(params.get('filter') ?? 'ALL');
      const query = z.string().max(512).parse(params.get('query') ?? '').trim();
      const carrier = z.string().max(512).parse(params.get('carrier') ?? '').trim();
      const offset = z.coerce.number().int().min(0).max(10000000).parse(params.get('offset') ?? 0);
      const limit = z.coerce.number().int().min(1).max(100).parse(params.get('limit') ?? 50);
      return json(await browseParcels(kind, filter, query, carrier, offset, limit));
    }
    if (url.searchParams.get('view') === 'history') {
      const offset = z.coerce.number().int().min(0).max(10000000).parse(url.searchParams.get('offset') ?? 0);
      const limit = z.coerce.number().int().min(1).max(100).parse(url.searchParams.get('limit') ?? 20);
      return json(await getHistory(offset, limit));
    }
    return json(await getState());
  } catch (error) { return failure(error); }
}
export async function POST(request: Request) {
  try {
    const origin = request.headers.get('origin');
    if (origin && origin !== new URL(request.url).origin) return json({ error: 'Cross-origin requests are not allowed.' }, 403);
    if (!request.headers.get('content-type')?.includes('application/json')) return json({ error: 'JSON required.' }, 415);
    if (Number(request.headers.get('content-length')) > 100 * 1024 * 1024) return json({ error: 'Import is too large.' }, 413);
    const body = mutation.parse(await request.json());
    if (body.action === 'scan') return json(await scanTrackingCode(body.trackingCode, body.requestId));
    if (body.action === 'import') return json(await importDataset(body.data, body.clear, body.requestId));
    if (body.action === 'reset') return json(await clearScanHistory(body.requestId));
    return json(await migrateLocalData(body.data, body.history, body.requestId));
  } catch (error) { return failure(error); }
}
