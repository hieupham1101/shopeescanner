'use client';
import { useState } from 'react';
import type { ImportComparison } from '../lib/importComparison';

export default function ImportReview({ report }: { report: ImportComparison }) {
  const [filter, setFilter] = useState('ALL');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const cancelled = report.issues.filter(item => item.kind === 'CANCELLED').length;
  const rows = report.issues.filter(item => (filter === 'ALL' || item.kind === filter) &&
    `${item.trackingCode} ${item.orderId ?? ''} ${item.carrier ?? ''}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const pages = Math.max(1, Math.ceil(rows.length / 20));
  return <section className="import-review" aria-label="Đối chiếu lần nhập gần nhất">
    <h2>Đối chiếu lần nhập gần nhất</h2>
    <p>So với {report.previousFilename} · {new Date(report.comparedAt).toLocaleString('vi-VN')}</p>
    <div className="review-counts">
      <strong>{cancelled} kiện đã quét đang bị hủy</strong>
      <strong>{report.issues.length - cancelled} kiện đã quét thiếu trong tệp</strong>
      <span>{report.newlyAvailable} kiện mới đủ điều kiện, chưa quét</span>
    </div>
    <p>Đây là đối chiếu tại thời điểm nhập, không phải trạng thái trực tiếp trên Shopee. Kiện thiếu có thể do phạm vi xuất dữ liệu thay đổi.</p>
    {report.historyCleared && <p>Lần nhập này đã xóa lịch sử quét. Báo cáo vẫn giữ các cảnh báo từ trước khi xóa.</p>}
    {report.issues.length > 0 ? <details>
      <summary>Danh sách cần xử lý ({report.issues.length})</summary>
      <div className="review-controls">
        <input aria-label="Tìm kiện cần xử lý" placeholder="Tìm mã vận đơn, mã đơn, nhà vận chuyển" value={query} onChange={event => { setQuery(event.target.value); setPage(0); }} />
        <select aria-label="Lọc cảnh báo" value={filter} onChange={event => { setFilter(event.target.value); setPage(0); }}>
          <option value="ALL">Tất cả cảnh báo</option>
          <option value="CANCELLED">Đã quét đang bị hủy</option>
          <option value="MISSING">Thiếu trong tệp mới</option>
        </select>
      </div>
      <ul className="review-list">{rows.slice(page * 20, page * 20 + 20).map(item => <li key={item.trackingCode}>
        <strong>{item.trackingCode}</strong>
        <span>{item.orderId || 'Không có mã đơn'} · {item.carrier || 'Chưa rõ nhà vận chuyển'}</span>
        <span>Quét lần đầu: {new Date(item.firstScannedAt).toLocaleString('vi-VN')}</span>
        <b>{item.kind === 'CANCELLED' ? 'Tìm kiện và giữ lại; kiểm tra trạng thái hủy trước khi bàn giao.' : 'Kiểm tra phạm vi file xuất và tra lại đơn trước khi bàn giao.'}</b>
        <span>Trước: {item.previousStatus || 'Không có trong tệp trước'} → Hiện tại: {item.currentStatus || 'Không có trong tệp mới'}</span>
      </li>)}</ul>
      {!rows.length && <p>Không có kiện phù hợp bộ lọc.</p>}
      <div className="review-controls">
        <button className="button secondary" disabled={page === 0} onClick={() => setPage(page - 1)}>Trước</button>
        <span>Trang {page + 1}/{pages} · {rows.length} kiện</span>
        <button className="button secondary" disabled={page + 1 >= pages} onClick={() => setPage(page + 1)}>Sau</button>
      </div>
    </details> : <p>Không có kiện đã quét cần xử lý theo hai kiểm tra trên.</p>}
  </section>;
}
