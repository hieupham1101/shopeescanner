# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: browse.spec.ts >> stat cards open filtered lists, search does not scan, and all orders paginate
- Location: tests/browser/browse.spec.ts:3:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /^Được bàn giao/ })

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - link "SHOPEE PACK CHECKFinal check before handover" [ref=e4] [cursor=pointer]:
      - /url: /
    - generic [ref=e12]:
      - generic [ref=e13]: Local workspace
      - button "Help" [ref=e18]
      - button "Settings" [ref=e22]
  - main [ref=e26]:
    - generic [ref=e27]:
      - generic [ref=e28]:
        - generic [ref=e29]: DISPATCH CONTROL
        - heading "Every parcel. Double checked." [level=1] [ref=e30]
        - paragraph [ref=e31]: One scan. A clear answer. Confident handovers.
      - generic [ref=e32]: Set up your stationRestoring local workspace…
    - generic [ref=e33]:
      - generic [ref=e38]:
        - generic [ref=e39]: Connect your Shopee order file
        - paragraph [ref=e40]: Import an Excel export to check order status and catch duplicate parcels.
      - button "Import Shopee ExcelF4" [disabled] [ref=e41]
    - generic [ref=e45]:
      - generic [ref=e46]:
        - text: Total orders
        - strong [ref=e47]: "0"
        - text: In current Shopee file
      - generic [ref=e48]:
        - generic [ref=e49]: Accepted
        - strong [ref=e50]: "0"
        - text: Cleared for handover
      - generic [ref=e51]:
        - generic [ref=e52]: Duplicate
        - strong [ref=e53]: "0"
        - text: Parcels stopped
      - generic [ref=e54]:
        - generic [ref=e55]: Cancelled
        - strong [ref=e56]: "0"
        - text: Parcels stopped
      - generic [ref=e57]:
        - generic [ref=e58]: Already picked up
        - strong [ref=e59]: "0"
        - text: Parcels stopped
      - generic [ref=e60]:
        - generic [ref=e61]: Not found
        - strong [ref=e62]: "0"
        - text: Parcels stopped
    - generic [ref=e63]:
      - generic [ref=e64]:
        - button "Scanning station" [ref=e65]
        - button "Scan history 0" [ref=e69]
      - generic [ref=e74]: Sound on
    - generic [ref=e79]:
      - generic [ref=e80]:
        - generic [ref=e81]:
          - generic [ref=e82]:
            - generic [ref=e83]: SCANNING STATION
            - generic [ref=e89]: AWAITING IMPORT
          - generic [ref=e90]:
            - generic [ref=e98]:
              - heading "Your final check. Every parcel." [level=2] [ref=e99]
              - paragraph [ref=e100]: Import your Shopee orders to start checking shipping labels.
            - generic [ref=e101]: USB scanner ready • No click needed between scans
          - generic [ref=e110]:
            - generic [ref=e111]: ↵ Scan. Listen. Hand over.
            - button "Use camera" [disabled] [ref=e112]
        - generic [ref=e116]:
          - generic [ref=e117]: Manual entry F2
          - generic [ref=e118]:
            - textbox "Manual entry F2" [disabled] [ref=e119]:
              - /placeholder: Enter tracking code manually
            - button "Check parcel" [disabled] [ref=e120]
      - complementary [ref=e123]:
        - generic [ref=e124]: LISTEN. THEN HAND OVER.
        - generic [ref=e133]:
          - text: ONE SHORT BEEP
          - heading "The parcel can go." [level=3] [ref=e134]
          - paragraph [ref=e135]: Order verified. First scan.Ready for the carrier.
        - generic [ref=e141]:
          - text: TWO WARNING BEEPS
          - heading "Stop the parcel." [level=3] [ref=e142]
          - paragraph [ref=e143]: Duplicate, cancelled, picked up,or not in your order file.
        - paragraph [ref=e147]: Keep your hands on the parcels.USB scanners work automatically. No need to click between scans.
        - button "Test scanner sounds" [ref=e148]
    - generic [ref=e155]:
      - generic [ref=e156]:
        - generic [ref=e157]:
          - heading "Recent scansLatest 20" [level=2] [ref=e158]
          - paragraph [ref=e159]: Every check recorded, including parcels stopped.
        - button "View all history" [ref=e160]
      - table [ref=e164]:
        - rowgroup [ref=e165]:
          - row [ref=e166]:
            - columnheader "TIME" [ref=e167]
            - columnheader "TRACKING CODE" [ref=e168]
            - columnheader "RESULT" [ref=e169]
            - columnheader "CARRIER" [ref=e170]
        - rowgroup
      - generic [ref=e171]:
        - heading "Your checks will appear here" [level=3] [ref=e177]
        - paragraph [ref=e178]: Import your order file and scan your first parcel.
    - generic [ref=e179]:
      - generic [ref=e180]: Local-first. Private by design. No account needed.
      - generic [ref=e184]: SUCCESS BEEP = GO ERROR BEEP = STOP
      - generic [ref=e185]: PACK CHECK v1.0
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('stat cards open filtered lists, search does not scan, and all orders paginate', async ({ page }) => {
  4  |   const requests: URL[] = [];
  5  |   let writes = 0;
  6  |   await page.route('**/api/pack-check**', async route => {
  7  |     const request = route.request();
  8  |     if (request.method() === 'POST') writes++;
  9  |     const url = new URL(request.url());
  10 |     if (url.searchParams.get('view') === 'browse') {
  11 |       requests.push(url);
  12 |       const scan = { id: 'scan-1', trackingCode: 'SPX001', orderId: 'ORDER1', status: url.searchParams.get('filter'), scannedAt: 1000, firstScannedAt: 500, scanCount: 2, carrier: 'SPX' };
  13 |       const order = { trackingCode: 'SPX001', orderId: 'ORDER1', orderStatus: 'Chờ giao hàng', carrier: 'SPX' };
  14 |       await route.fulfill({ json: { total: url.searchParams.get('query') === 'missing' ? 0 : 51, rows: url.searchParams.get('query') === 'missing' ? [] : [url.searchParams.get('kind') === 'orders' ? { order } : { scan }] } });
  15 |     } else if (url.searchParams.get('view') === 'history') await route.fulfill({ json: [] });
  16 |     else await route.fulfill({ json: { metadata: {filename:'orders.xlsx',total:110,waiting:43,shipping:55,cancelled:4,skipped:0,merged:0,importedAt:1}, counters:{ACCEPTED:30,DUPLICATE:2,CANCELLED:2,PICKED_UP:0,UNKNOWN:2},revision:'1' } });
  17 |   });
  18 |   await page.goto('/');
  19 |   for (const [label, filter] of [['Được bàn giao','ACCEPTED'],['Đơn trùng','DUPLICATE'],['Đơn huỷ','CANCELLED'],['Đã lấy hàng','PICKED_UP'],['Không tìm thấy','UNKNOWN']]) {
> 20 |     await page.getByRole('button',{name:new RegExp('^'+label)}).click();
     |                                                                 ^ Error: locator.click: Test timeout of 30000ms exceeded.
  21 |     await expect(page.getByRole('status')).toContainText('51 lượt quét phù hợp');
  22 |     expect(requests.at(-1)?.searchParams.get('filter')).toBe(filter);
  23 |   }
  24 |   await page.getByLabel('Tìm đơn',{exact:true}).fill('missing');
  25 |   await page.getByLabel('Tìm đơn',{exact:true}).press('Enter');
  26 |   await expect(page.getByText('Không có đơn phù hợp')).toBeVisible();
  27 |   expect(writes).toBe(0);
  28 |   await page.getByRole('button',{name:'Xem tổng đơn hàng',exact:true}).click();
  29 |   await expect(page.getByRole('status')).toContainText('51 kiện phù hợp');
  30 |   await page.getByRole('button',{name:'Sau',exact:true}).click();
  31 |   await expect(page.getByText('Trang 2/2')).toBeVisible();
  32 |   expect(requests.at(-1)?.searchParams.get('offset')).toBe('50');
  33 |   await page.getByRole('button',{name:'Xem kiện chưa quét',exact:true}).click();
  34 |   await expect(page.getByRole('status')).toContainText('51 kiện phù hợp');
  35 |   expect(requests.at(-1)?.searchParams.get('filter')).toBe('UNSCANNED');
  36 |   await page.getByText('Xem chi tiết',{exact:true}).click();
  37 |   await expect(page.getByText('Trạng thái trong tệp: Chờ giao hàng')).toBeVisible();
  38 |   await page.getByRole('button',{name:'Về quét đơn',exact:true}).click();
  39 |   await expect(page.getByLabel('Nhập mã thủ công')).toBeVisible();
  40 | });
  41 | 
```