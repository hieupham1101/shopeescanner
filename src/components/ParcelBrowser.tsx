'use client';
import { useEffect, useRef, useState } from 'react';
import { browseParcels } from '../lib/storage';
import { determineOrderStatus } from '../lib/orderStatus';
import type { BrowseFilter, BrowseKind, BrowseResult } from '../types/browse';
import { resultLabels } from './ScanResult';

export default function ParcelBrowser({ kind, initialFilter, onClose }: { kind: BrowseKind; initialFilter: BrowseFilter; onClose: () => void }) {
  const [filter, setFilter] = useState(initialFilter);
  const [query, setQuery] = useState('');
  const [carrier, setCarrier] = useState('');
  const [page, setPage] = useState(0);
  const [data, setData] = useState<BrowseResult>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [refresh, setRefresh] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); heading.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }); }, []);
  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      browseParcels(kind, filter, query, carrier, page).then(result => {
        if (active) { setData(result); setLoading(false); }
      }).catch(() => { if (active) { setError('Không tải được danh sách. Kiểm tra kết nối rồi bấm Làm mới.'); setLoading(false); } });
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [kind, filter, query, carrier, page, refresh]);
  function invalidate() { setLoading(true); setError(''); setData(undefined); setNotice(''); }
  async function copy(code: string) {
    try { await navigator.clipboard.writeText(code); setNotice(`Đã sao chép ${code}`); }
    catch { setNotice('Không sao chép được. Bạn có thể chọn mã trong danh sách để sao chép.'); }
  }
  return <section className="history-panel parcel-browser" aria-busy={loading}>
    <div className="history-heading">
      <div><h2 ref={heading} tabIndex={-1}>{kind === 'orders' ? 'Đơn trong tệp Shopee' : 'Tra cứu lịch sử quét'}</h2>
        <p>{kind === 'orders' ? 'Chưa quét = chưa có lượt quét được chấp nhận; vẫn cần kiểm tra trạng thái trước khi giao.' : 'Mỗi dòng là một lượt quét. Một kiện có thể xuất hiện nhiều lần. Kết quả được ghi tại thời điểm quét.'}</p>
      </div>
      <button className="button secondary" onClick={onClose}>Về quét đơn</button>
    </div>
    <div className="browse-toolbar">
      <label>Tìm đơn<input value={query} placeholder="Mã vận đơn hoặc mã đơn hàng" onChange={event => { invalidate(); setQuery(event.target.value); setPage(0); }} /></label>
      <label>Nhà vận chuyển<input value={carrier} placeholder="Ví dụ: SPX, GHN" onChange={event => { invalidate(); setCarrier(event.target.value); setPage(0); }} /></label>
      <label>Nhóm đơn<select value={filter} onChange={event => { invalidate(); setFilter(event.target.value as BrowseFilter); setPage(0); }}>
        <option value="ALL">Tất cả</option>
        {kind === 'orders' ? <option value="UNSCANNED">Chưa quét thành công</option> : Object.entries(resultLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select></label>
      <button className="button secondary" onClick={() => { invalidate(); setRefresh(refresh + 1); }}>Làm mới</button>
      <button className="button secondary" onClick={() => { invalidate(); setQuery(''); setCarrier(''); setFilter('ALL'); setPage(0); setRefresh(refresh + 1); }}>Bỏ bộ lọc</button>
    </div>
    <p className="browse-feedback" role="status">{loading ? 'Đang tải danh sách…' : error || `${data?.total ?? 0} ${kind === 'orders' ? 'kiện' : 'lượt quét'} phù hợp`}{notice && ` · ${notice}`}</p>
    {!loading && !error && data && <>
      {data.rows.length ? <div className="table-scroll"><table><thead><tr><th>MÃ VẬN ĐƠN / MÃ ĐƠN</th><th>TRẠNG THÁI</th><th>NHÀ VẬN CHUYỂN</th><th>CHI TIẾT</th></tr></thead><tbody>
        {data.rows.map(row => {
          const item = row.order ?? row.scan!;
          const state = row.order ? determineOrderStatus(row.order) : row.scan!.status;
          const label = state === 'AVAILABLE' ? (row.acceptedAt ? 'Đã quét thành công' : 'Chưa quét thành công') : resultLabels[state];
          return <tr key={row.scan?.id ?? item.trackingCode}>
            <td className="mono">{item.trackingCode}<small>{item.orderId || '—'}</small></td>
            <td>{label}{row.scan && <small>{new Date(row.scan.scannedAt).toLocaleString('vi-VN')}</small>}</td>
            <td>{item.carrier || '—'}</td>
            <td><details><summary>Xem chi tiết</summary><div className="parcel-detail">
              {row.order && <><p>Trạng thái trong tệp: {row.order.orderStatus || '—'}</p><p>Lý do hủy: {row.order.cancellationReason || '—'}</p></>}
              {(row.acceptedAt || row.scan?.firstScannedAt) && <p>Quét thành công lần đầu: {new Date(row.acceptedAt || row.scan!.firstScannedAt!).toLocaleString('vi-VN')}</p>}
              {row.scan?.scanCount && <p>Số lượt quét hợp lệ/trùng đã ghi nhận: {row.scan.scanCount}</p>}
              <p>{state === 'CANCELLED' ? 'Giữ lại kiện và kiểm tra lý do hủy.' : state === 'UNKNOWN' ? 'Kiểm tra đúng mã vận đơn và phạm vi tệp đã nhập.' : state === 'DUPLICATE' ? 'Đối chiếu lần quét đầu, tránh giao hai lần.' : state === 'PICKED_UP' ? 'Đơn đã có trạng thái đang giao; kiểm tra lại trước khi bàn giao.' : 'Đối chiếu kiện thực tế và trạng thái hiện tại trước khi giao.'}</p>
              <button className="button secondary" onClick={() => void copy(item.trackingCode)}>Sao chép mã</button>
            </div></details></td>
          </tr>;
        })}
      </tbody></table></div> : <div className="history-empty"><h3>Không có đơn phù hợp</h3><p>Thử đổi mã tìm kiếm hoặc bỏ bộ lọc.</p></div>}
      <div className="pagination">
        <button disabled={page === 0} onClick={() => { invalidate(); setPage(page - 1); }}>Trước</button>
        <span>Trang {page + 1}/{Math.max(1, Math.ceil(data.total / 50))} · 50 dòng/trang</span>
        <button disabled={(page + 1) * 50 >= data.total} onClick={() => { invalidate(); setPage(page + 1); }}>Sau</button>
      </div>
    </>}
  </section>;
}
