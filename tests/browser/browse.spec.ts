import { test, expect } from '@playwright/test';

test('stat cards open filtered lists, search does not scan, and all orders paginate', async ({ page }) => {
  const requests: URL[] = [];
  let writes = 0;
  await page.route('**/api/pack-check**', async route => {
    const request = route.request();
    if (request.method() === 'POST') writes++;
    const url = new URL(request.url());
    if (url.searchParams.get('view') === 'browse') {
      requests.push(url);
      const scan = { id: 'scan-1', trackingCode: 'SPX001', orderId: 'ORDER1', status: url.searchParams.get('filter'), scannedAt: 1000, firstScannedAt: 500, scanCount: 2, carrier: 'SPX' };
      const order = { trackingCode: 'SPX001', orderId: 'ORDER1', orderStatus: 'Chờ giao hàng', carrier: 'SPX' };
      await route.fulfill({ json: { total: url.searchParams.get('query') === 'missing' ? 0 : 51, rows: url.searchParams.get('query') === 'missing' ? [] : [url.searchParams.get('kind') === 'orders' ? { order } : { scan }] } });
    } else if (url.searchParams.get('view') === 'history') await route.fulfill({ json: [] });
    else await route.fulfill({ json: { metadata: {filename:'orders.xlsx',total:110,waiting:43,shipping:55,cancelled:4,skipped:0,merged:0,importedAt:1}, counters:{ACCEPTED:30,DUPLICATE:2,CANCELLED:2,PICKED_UP:0,UNKNOWN:2},revision:'1' } });
  });
  await page.goto('/');
  for (const [label, filter] of [['Được bàn giao','ACCEPTED'],['Đơn trùng','DUPLICATE'],['Đơn huỷ','CANCELLED'],['Đã lấy hàng','PICKED_UP'],['Không tìm thấy','UNKNOWN']]) {
    await page.getByRole('button',{name:new RegExp('^'+label)}).click();
    await expect(page.getByRole('status')).toContainText('51 lượt quét phù hợp');
    expect(requests.at(-1)?.searchParams.get('filter')).toBe(filter);
  }
  await page.getByLabel('Tìm đơn',{exact:true}).fill('missing');
  await page.getByLabel('Tìm đơn',{exact:true}).press('Enter');
  await expect(page.getByText('Không có đơn phù hợp')).toBeVisible();
  expect(writes).toBe(0);
  await page.getByRole('button',{name:'Xem tổng đơn hàng',exact:true}).click();
  await expect(page.getByRole('status')).toContainText('51 kiện phù hợp');
  await page.getByRole('button',{name:'Sau',exact:true}).click();
  await expect(page.getByText('Trang 2/2')).toBeVisible();
  expect(requests.at(-1)?.searchParams.get('offset')).toBe('50');
  await page.getByRole('button',{name:'Xem kiện chưa quét',exact:true}).click();
  await expect(page.getByRole('status')).toContainText('51 kiện phù hợp');
  expect(requests.at(-1)?.searchParams.get('filter')).toBe('UNSCANNED');
  await page.getByText('Xem chi tiết',{exact:true}).click();
  await expect(page.getByText('Trạng thái trong tệp: Chờ giao hàng')).toBeVisible();
  await page.getByRole('button',{name:'Về quét đơn',exact:true}).click();
  await expect(page.getByLabel('Nhập mã thủ công')).toBeVisible();
});
