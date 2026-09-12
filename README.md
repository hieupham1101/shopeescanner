# Shopee Pack Check

A local-first parcel checking terminal. Import a Shopee `.xlsx` export, scan a shipping label, and listen: one high beep means hand over; two low beeps mean stop. No account, database server, or API credentials are required.

## Start

Use **Node.js 24 or newer** (`nvm use` reads the included `.nvmrc`).

```sh
npm ci
npm run dev
```

Open http://localhost:3000. For production and offline/PWA support:

```sh
npm run build
npm start
```

The build generates a versioned service worker cache containing the app, camera decoder, Excel worker, and static assets. Load the production app online once and allow offline setup to finish. Chrome's install menu can then install the app. Android camera and installation require an HTTPS origin; plain HTTP LAN addresses do not qualify. Localhost works on the host computer.

## Use

1. Import a fresh Shopee order export. Standard Vietnamese headers are located automatically, including reordered columns and report rows before the header.
2. Configure the USB scanner as a keyboard wedge with an **Enter suffix**. Scan anywhere outside a settings dialog. The manual input also works with a USB scanner when focused.
3. Use **Use camera** for rear-camera QR/barcode scanning, or enter a tracking code manually.
4. Green / one bright beep means accepted. Every other result means stop. Scan the next parcel immediately; the result overlay does not block the next scan.

F2 focuses manual input; F4 opens import; F8 toggles sound; Escape dismisses results/dialogs. Test both sounds in Settings before a session. Volume and sound preferences persist locally.

Replacing a file offers **keep history** or **clear history and start fresh**. History → Reset scan history requires confirmation. Resetting allows previously accepted tracking codes to be accepted again.

## Rules and data

The central pipeline normalizes tracking codes and uses a `Map` lookup. Priority: UNKNOWN → CANCELLED → PICKED_UP → DUPLICATE → ACCEPTED.

- `Đã hủy` or a meaningful cancellation reason stops a parcel.
- `Đang giao` is the pickup indicator. Shipping date alone is not.
- Only previously accepted codes become business duplicates. Failed attempts remain in history without entering accepted state.
- Camera detections of the same code are ignored until it has been absent for at least 1.5 seconds. USB/manual scans never use this camera filter.
- A single IndexedDB transaction saves accepted state, scan history, and counters before returning a result and playing a tone. Concurrent checks cannot both accept the same parcel.
- Missing optional columns are tolerated. A missing tracking-code column is an import error.
- Repeated tracking codes from product-line rows merge into one parcel, with cancellation taking priority over pickup and availability. Import summary counts are unique parcels; skipped and merged rows are shown.
- Text and Excel number formats preserve leading zeros. Digits or zeros already discarded by Excel cannot be recovered; export tracking codes as text or with the appropriate number format.
- Imported status is a snapshot, not a live Shopee/carrier query. Keep exports current.

Data stays in IndexedDB for this browser profile and origin. Clearing site data, using a different port/origin/device, or deleting the browser profile does not preserve the same workspace. Persistent storage is requested when supported. No records or Excel contents are sent to a server.

## Code layout

- `src/lib/shopeeParser.ts` and `src/workers/import.worker.ts`: worker-based Excel parsing.
- `src/lib/normalization.ts`, `orderStatus.ts`, `scanProcessor.ts`: centralized business rules.
- `src/lib/storage.ts`: transactional IndexedDB and paginated history.
- `src/lib/scannerAudio.ts`, `keyboardScanner.ts`, `cameraScanner.ts`: hardware feedback/input adapters.
- `src/components/PackCheck.tsx`: workspace state and orchestration.
- `src/components/Scanner.tsx`, `ScanResult.tsx`: scanning terminal and full-screen feedback.
- `scripts/build-sw.mjs`: production offline asset cache generation.

## Verification

```sh
npm test
npm run lint
npm run typecheck
npm run build
npm start -- --port 3100
# In a second terminal, with Google Chrome installed:
npm run test:browser
```

The unit/integration suite covers all five statuses, priority after earlier acceptance, concurrent duplicate prevention, camera debounce, reload persistence, reset/keep imports, header detection, formatted tracking codes, audio wave patterns/resume, and a generated 50,000-order workbook. Browser tests cover real Excel worker import, keyboard input, manual input, history controls, offline reload, responsive layout, permission denial, sound controls, and actual ZXing decoding from a synthetic QR video stream.

Before live handover, verify your physical USB scanner's Enter suffix, speaker audibility, and camera focus/permissions on the actual device, and import an actual Shopee export. Automated tests use representative generated exports and simulated scanner input/video; they do not certify physical hardware.
