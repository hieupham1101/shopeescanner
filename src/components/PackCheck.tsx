"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Box,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  FileSpreadsheet,
  History,
  LockKeyhole,
  PackageCheck,
  Settings2,
  ShieldCheck,
  Upload,
  Volume2,
  VolumeX,
  X,
  Zap,
} from "lucide-react";
import Scanner from "./Scanner";
import ScanResult, { resultLabels } from "./ScanResult";
import type { Dataset, ImportMetadata } from "../types/order";
import {
  emptyCounters,
  type Counters,
  type ScanRecord,
  type ScanResult as Result,
  type ScanSource,
} from "../types/scan";
import {
  loadData,
  getRemoteState,
  readHistory,
  resetHistory,
  saveDataset,
} from "../lib/storage";
import { ScanProcessor } from "../lib/scanProcessor";
import { attachKeyboardScanner } from "../lib/keyboardScanner";
import * as audio from "../lib/scannerAudio";
const number = (n: number) => n.toLocaleString();
export default function PackCheck() {
  const [metadata, setMetadata] = useState<ImportMetadata>();
  const [counters, setCounters] = useState<Counters>(emptyCounters);
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const [ready, setReady] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [dialog, setDialog] = useState<
    "settings" | "import" | "reset" | "help" | null
  >(null);
  const [pending, setPending] = useState<Dataset>();
  const [sound, setSound] = useState(true),
    [volume, setVolume] = useState(65);
  const [view, setView] = useState<"station" | "history">("station"),
    [page, setPage] = useState(0);
  const [manual, setManual] = useState("");
  const [checking, setChecking] = useState(false);
  const processor = useRef<ScanProcessor | undefined>(undefined);
  const storageFailed = useRef(false);
  const blocked = useRef(true),
    fileInput = useRef<HTMLInputElement>(null),
    manualInput = useRef<HTMLInputElement>(null);
  const resultTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const audioError = (e: unknown) =>
    setError(
      e instanceof Error
        ? e.message
        : "Sound unavailable. Open settings and test audio.",
    );
  useEffect(() => {
    let active = true;
    loadData()
      .then(async (data) => {
        if (!active) return;
        setMetadata(data.metadata);
        setCounters(data.counters);
        processor.current = new ScanProcessor(undefined, () => { setResult(null); setChecking(true); });
        setHistory(await readHistory());
        setReady(true);
        blocked.current = false;
      })
      .catch(() =>
        setError(
          "Không kết nối được database. Kiểm tra mạng rồi tải lại trang.",
        ),
      );
    try {
      const saved = JSON.parse(
        localStorage.getItem("pack-check-audio") || "{}",
      );
      const enabled = saved.enabled !== false;
      const level =
        typeof saved.volume === "number"
          ? Math.max(0, Math.min(100, saved.volume))
          : 65;
      setSound(enabled);
      setVolume(level);
      audio.setEnabled(enabled);
      audio.setVolume(level / 100);
    } catch {
      /* Defaults remain enabled. */
    }
    const unlock = () => {
      void audio.initializeAudio().catch(audioError);
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production")
      navigator.serviceWorker
        .register("/sw.js")
        .catch(() =>
          setError(
            "Offline setup failed. Keep this page online and reload to retry.",
          ),
        );
    return () => {
      active = false;
      clearTimeout(resultTimer.current);
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);
  const processScan = useCallback(
    (code: string, source: ScanSource = "manual") => {
      if (
        storageFailed.current ||
        blocked.current ||
        !processor.current ||
        !metadata
      )
        return;
      void processor.current
        .processScan(code, source)
        .then((saved) => {
          if (!saved) return;
          setChecking(false);
          setCounters(saved.counters);
          setResult(saved.result);
          if (view === "station")
            setHistory((previous) => [saved.result, ...previous].slice(0, 20));
          else
            void readHistory(page * 50, 50)
              .then(setHistory)
              .catch(() => setError("Could not refresh history."));
          const ok = saved.result.status === "ACCEPTED";
          void (ok ? audio.playSuccess() : audio.playError()).catch(audioError);
          try {
            navigator.vibrate?.(ok ? 35 : [100, 70, 100]);
          } catch {
            /* Optional haptics. */
          }
          clearTimeout(resultTimer.current);
          resultTimer.current = setTimeout(
            () => setResult(null),
            ok ? 1800 : 2800,
          );
        })
        .catch(() => {
          setChecking(false);
          storageFailed.current = true;
          blocked.current = true;
          setResult(null);
          setError(
            "DỪNG BÀN GIAO — chưa xác nhận lưu trên database. Kiểm tra kết nối rồi tải lại trước khi quét tiếp.",
          );
          void audio.playError().catch(audioError);
        });
    },
    [metadata, view, page],
  );
  useEffect(
    () => attachKeyboardScanner((code) => processScan(code, "usb")),
    [processScan],
  );
  useEffect(() => {
    const shortcuts = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (!busy) {
          setDialog(null);
          setPending(undefined);
        }
        setResult(null);
      }
      if (e.key === "F2") {
        e.preventDefault();
        manualInput.current?.focus();
      }
      if (e.key === "F4") {
        e.preventDefault();
        if (!busy) fileInput.current?.click();
      }
      if (e.key === "F8") {
        e.preventDefault();
        setSound((value) => {
          audio.setEnabled(!value);
          try {
            localStorage.setItem(
              "pack-check-audio",
              JSON.stringify({ enabled: !value, volume }),
            );
          } catch {
            /* Runtime setting still applies. */
          }
          return !value;
        });
      }
    };
    window.addEventListener("keydown", shortcuts);
    return () => window.removeEventListener("keydown", shortcuts);
  }, [busy, volume]);
  useEffect(() => {
    blocked.current = !ready || busy || !!dialog;
  }, [ready, busy, dialog]);
  useEffect(() => {
    if (!dialog) return;
    const previous = document.activeElement as HTMLElement | null;
    const panel = document.querySelector<HTMLElement>('[role="dialog"]');
    const focusables = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'button:not(:disabled),input:not(:disabled),[tabindex="0"]',
        ) ?? [],
      );
    focusables()[0]?.focus();
    const trap = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const elements = focusables(),
        first = elements[0],
        last = elements[elements.length - 1];
      if (!first) {
        event.preventDefault();
        return;
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      document.removeEventListener("keydown", trap);
      previous?.focus();
    };
  }, [dialog]);
  useEffect(() => {
    void readHistory(
      view === "history" ? page * 50 : 0,
      view === "history" ? 50 : 20,
    )
      .then(setHistory)
      .catch(() => setError("Could not load scan history."));
  }, [view, page]);
  useEffect(() => {
    if (!ready) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const refresh = async () => {
      try {
        if (!busy && !dialog && document.visibilityState === 'visible') {
          await processor.current?.idle();
          const state = await getRemoteState();
          const rows = await readHistory(view === 'history' ? page * 50 : 0, view === 'history' ? 50 : 20);
          if (!stopped) { setMetadata(state.metadata); setCounters(state.counters); setHistory(rows); }
        }
      } catch { /* Scans independently require a committed server response. */ }
      if (!stopped) timer = setTimeout(refresh, 3000);
    };
    timer = setTimeout(refresh, 3000);
    return () => { stopped = true; clearTimeout(timer); };
  }, [ready, busy, dialog, view, page]);
  async function commitImport(data: Dataset, clear: boolean) {
    blocked.current = true;
    setBusy(true);
    setError("");
    try {
      await processor.current?.idle();
      const savedState = await saveDataset(data, clear);
      processor.current = new ScanProcessor(undefined, () => { setResult(null); setChecking(true); });
      setMetadata(savedState.metadata);
      setCounters(savedState.counters);
      setHistory(await readHistory());
      setPage(0);
      setView("station");
      setResult(null);
      setPending(undefined);
      setDialog(null);
      void navigator.storage?.persist?.();
    } catch {
      setError(
        "Chưa xác nhận nhập file vào database. Kiểm tra kết nối và tải lại để xem dữ liệu đã lưu.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function importFile(file: File) {
    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      setError("Choose a Shopee .xlsx Excel export.");
      return;
    }
    setBusy(true);
    blocked.current = true;
    setError("");
    try {
      const buffer = await file.arrayBuffer();
      const data = await new Promise<Dataset>((resolve, reject) => {
        const worker = new Worker(
          new URL("../workers/import.worker.ts", import.meta.url),
        );
        worker.onmessage = (event) => {
          worker.terminate();
          if (event.data.error) reject(new Error(event.data.error));
          else resolve(event.data.data);
        };
        worker.onerror = () => {
          worker.terminate();
          reject(
            new Error(
              "Excel parsing failed. Check that the file is a valid Shopee export.",
            ),
          );
        };
        worker.postMessage({ buffer, filename: file.name }, [buffer]);
      });
      if (metadata || Object.values(counters).some(Boolean)) {
        setPending(data);
        setDialog("import");
      } else await commitImport(data, false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to import this file.");
    } finally {
      setBusy(false);
    }
  }
  function saveAudio(enabled: boolean, level: number) {
    setSound(enabled);
    setVolume(level);
    audio.setEnabled(enabled);
    audio.setVolume(level / 100);
    try {
      localStorage.setItem(
        "pack-check-audio",
        JSON.stringify({ enabled, volume: level }),
      );
    } catch {
      setError("Audio settings could not be saved on this device.");
    }
  }
  async function clearHistory() {
    setBusy(true);
    blocked.current = true;
    try {
      await processor.current?.idle();
      await resetHistory();
      setCounters(emptyCounters());
      setHistory([]);
      setResult(null);
      setPage(0);
      setDialog(null);
    } catch {
      setError("Could not reset history. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  const totalScans = Object.values(counters).reduce((a, b) => a + b, 0);
  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/">
          <span className="brand-symbol">
            <PackageCheck size={24} />
          </span>
          <span>
            SHOPEE <b>PACK CHECK</b>
            <small>Final check before handover</small>
          </span>
        </a>
        <div className="top-actions">
          <span className="local-badge">
            <LockKeyhole size={13} /> Shared database
          </span>
          <button
            className="icon-button"
            aria-label="Help"
            onClick={() => setDialog("help")}
          >
            <CircleHelp size={19} />
          </button>
          <button
            aria-label="Settings"
            className="settings-button"
            onClick={() => setDialog("settings")}
          >
            <Settings2 size={17} />
            <span>Settings</span>
          </button>
        </div>
      </header>
      <main>
        <div className="page-heading">
          <div>
            <div className="eyebrow">DISPATCH CONTROL</div>
            <h1>
              Every parcel. Double checked<span>.</span>
            </h1>
            <p>One scan. A clear answer. Confident handovers.</p>
          </div>
          <div className="station-status">
            <i /> {metadata ? "Station ready" : "Set up your station"}
            <small>
              {ready
                ? "Đồng bộ máy tính và điện thoại"
                : "Connecting to database…"}
            </small>
          </div>
        </div>
        {checking && <div className="error-banner" aria-live="polite">ĐANG XÁC NHẬN VỚI DATABASE — CHƯA BÀN GIAO</div>}
        {error && (
          <div className="error-banner" role="alert">
            {error}
            <button aria-label="Dismiss message" onClick={() => setError("")}>
              <X size={17} />
            </button>
          </div>
        )}
        <input
          ref={fileInput}
          type="file"
          accept=".xlsx"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) void importFile(file);
          }}
        />
        <section className="file-bar">
          <div className="file-icon">
            <FileSpreadsheet size={24} />
          </div>
          <div className="file-detail">
            <div className="file-title">
              {metadata?.filename || "Connect your Shopee order file"}{" "}
              {metadata && <span className="data-badge">DATA LOADED</span>}
            </div>
            <p>
              {metadata
                ? `${number(metadata.total)} parcels · Imported ${new Date(metadata.importedAt).toLocaleString()} · ${metadata.skipped} rows without tracking · ${metadata.merged} repeated rows merged`
                : "Import an Excel export to check order status and catch duplicate parcels."}
            </p>
          </div>
          <button
            className="button primary"
            disabled={busy || !ready}
            onClick={() => fileInput.current?.click()}
          >
            <Upload size={16} />
            {busy
              ? "Importing…"
              : metadata
                ? "Change Shopee File"
                : "Import Shopee Excel"}
            <span className="button-key">F4</span>
          </button>
        </section>
        {metadata && (
          <div className="import-summary">
            <span>IN YOUR FILE</span>
            <b>
              {number(metadata.waiting)} <small>waiting to ship</small>
            </b>
            <b>
              {number(metadata.shipping)} <small>shipping / in delivery</small>
            </b>
            <b>
              {number(metadata.cancelled)} <small>cancelled</small>
            </b>
          </div>
        )}
        <div className="stats-grid">
          <div className="stat">
            <span>Total orders</span>
            <strong>{number(metadata?.total ?? 0)}</strong>
            <small>In current Shopee file</small>
          </div>
          {(
            [
              "ACCEPTED",
              "DUPLICATE",
              "CANCELLED",
              "PICKED_UP",
              "UNKNOWN",
            ] as const
          ).map((status) => (
            <div className={`stat stat-${status}`} key={status}>
              <span>
                <i />
                {
                  {
                    ACCEPTED: "Accepted",
                    DUPLICATE: "Duplicate",
                    CANCELLED: "Cancelled",
                    PICKED_UP: "Already picked up",
                    UNKNOWN: "Not found",
                  }[status]
                }
              </span>
              <strong>{number(counters[status])}</strong>
              <small>
                {status === "ACCEPTED"
                  ? "Cleared for handover"
                  : "Parcels stopped"}
              </small>
            </div>
          ))}
        </div>
        <div className="workspace-tabs">
          <div>
            <button
              className={view === "station" ? "active" : ""}
              onClick={() => {
                setView("station");
                setPage(0);
              }}
            >
              <Box size={16} /> Scanning station
            </button>
            <button
              className={view === "history" ? "active" : ""}
              onClick={() => {
                setView("history");
                setPage(0);
              }}
            >
              <History size={16} /> Scan history{" "}
              <span>{number(totalScans)}</span>
            </button>
          </div>
          <span>
            {sound ? <Volume2 size={14} /> : <VolumeX size={14} />} Sound{" "}
            {sound ? "on" : "off"}
          </span>
        </div>
        {view === "station" && (
          <div className="station-grid">
            <div>
              <Scanner
                enabled={!!metadata && ready && !busy && !dialog}
                onScan={(code) => processScan(code, "camera")}
              />
              <form
                className="manual-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  processScan(manual);
                  setManual("");
                  manualInput.current?.focus();
                }}
              >
                <label htmlFor="manual">
                  Manual entry <kbd>F2</kbd>
                </label>
                <div>
                  <input
                    id="manual"
                    ref={manualInput}
                    value={manual}
                    onChange={(e) => setManual(e.target.value)}
                    placeholder="Enter tracking code manually"
                    autoComplete="off"
                    spellCheck={false}
                    disabled={!metadata || busy}
                  />
                  <button
                    className="button secondary"
                    disabled={!metadata || busy || !manual.trim()}
                  >
                    Check parcel <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            </div>
            <aside className="guide-panel">
              <div className="panel-heading">
                <span>
                  <ShieldCheck size={17} /> LISTEN. THEN HAND OVER.
                </span>
              </div>
              <div className="sound-guide success-guide">
                <div className="guide-icon">
                  <Check size={25} />
                </div>
                <div>
                  <span>ONE SHORT BEEP</span>
                  <h3>The parcel can go.</h3>
                  <p>
                    Order verified. First scan.
                    <br />
                    Ready for the carrier.
                  </p>
                </div>
              </div>
              <div className="sound-guide stop-guide">
                <div className="guide-icon">
                  <X size={24} />
                </div>
                <div>
                  <span>TWO WARNING BEEPS</span>
                  <h3>Stop the parcel.</h3>
                  <p>
                    Duplicate, cancelled, picked up,
                    <br />
                    or not in your order file.
                  </p>
                </div>
              </div>
              <div className="guide-tip">
                <Zap size={19} />
                <p>
                  <b>Keep your hands on the parcels.</b>USB scanners work
                  automatically. No need to click between scans.
                </p>
              </div>
              <button
                className="audio-test-link"
                onClick={() => setDialog("settings")}
              >
                <Volume2 size={15} /> Test scanner sounds{" "}
                <ArrowRight size={15} />
              </button>
            </aside>
          </div>
        )}
        <section className="history-panel">
          <div className="history-heading">
            <div>
              <h2>
                {view === "history" ? "Complete scan history" : "Recent scans"}
                <span>
                  {view === "history" ? number(totalScans) : "Latest 20"}
                </span>
              </h2>
              <p>Every check recorded, including parcels stopped.</p>
            </div>
            {view === "station" ? (
              <button
                onClick={() => {
                  setView("history");
                  setPage(0);
                }}
              >
                View all history <ArrowRight size={15} />
              </button>
            ) : (
              <button
                className="danger-text"
                onClick={() => setDialog("reset")}
              >
                Reset scan history
              </button>
            )}
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>TIME</th>
                  <th>TRACKING CODE</th>
                  <th>RESULT</th>
                  <th>CARRIER</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {new Date(item.scannedAt).toLocaleTimeString("en-GB")}
                      <small>
                        {view === "history" &&
                          new Date(item.scannedAt).toLocaleDateString()}
                      </small>
                    </td>
                    <td className="mono">{item.trackingCode}</td>
                    <td>
                      <span className={`result-pill pill-${item.status}`}>
                        <i />
                        {resultLabels[item.status]}
                      </span>
                    </td>
                    <td>{item.carrier || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!history.length && (
            <div className="history-empty">
              <div>
                <History size={23} />
              </div>
              <h3>Your checks will appear here</h3>
              <p>Import your order file and scan your first parcel.</p>
            </div>
          )}
          {view === "history" && (
            <div className="pagination">
              <button disabled={!page} onClick={() => setPage(page - 1)}>
                <ChevronLeft size={17} /> Previous
              </button>
              <span>Page {page + 1} · 50 per page</span>
              <button
                disabled={(page + 1) * 50 >= totalScans}
                onClick={() => setPage(page + 1)}
              >
                Next <ChevronRight size={17} />
              </button>
            </div>
          )}
        </section>
        <footer>
          <span>
            <ShieldCheck size={14} /> Local-first. Private by design. No account
            needed.
          </span>
          <span>
            SUCCESS BEEP = GO <i /> ERROR BEEP = STOP
          </span>
          <span>
            PACK CHECK <b>v1.0</b>
          </span>
        </footer>
      </main>
      {result && <ScanResult result={result} dismiss={() => setResult(null)} />}
      {dialog && (
        <div
          className="modal-backdrop"
          onClick={() => {
            if (!busy) {
              setDialog(null);
              setPending(undefined);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label={
              dialog === "settings"
                ? "Sound settings"
                : dialog === "import"
                  ? "Import Shopee file"
                  : dialog === "reset"
                    ? "Reset scan history"
                    : "How to scan"
            }
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close icon-button"
              disabled={busy}
              aria-label="Close dialog"
              onClick={() => {
                setDialog(null);
                setPending(undefined);
              }}
            >
              <X size={20} />
            </button>
            {dialog === "settings" && (
              <>
                <div className="modal-icon">
                  <Volume2 />
                </div>
                <h2>Scanner sound</h2>
                <p>Hear the decision before you look at the screen.</p>
                <label className="setting-row">
                  Sound feedback
                  <button
                    className={`toggle ${sound ? "on" : ""}`}
                    role="switch"
                    aria-checked={sound}
                    onClick={() => saveAudio(!sound, volume)}
                  >
                    {sound ? "ON" : "OFF"}
                  </button>
                </label>
                <label className="volume-label" htmlFor="volume">
                  Volume <b>{volume}%</b>
                </label>
                <input
                  id="volume"
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => saveAudio(sound, Number(e.target.value))}
                />
                <div className="test-buttons">
                  <button
                    className="button secondary"
                    disabled={!sound}
                    onClick={() => void audio.playSuccess().catch(audioError)}
                  >
                    Test OK Sound
                  </button>
                  <button
                    className="button secondary"
                    disabled={!sound}
                    onClick={() => void audio.playError().catch(audioError)}
                  >
                    Test Error Sound
                  </button>
                </div>
                <p className="small-note">
                  Settings are saved on this device. F8 toggles sound.
                </p>
              </>
            )}
            {dialog === "import" && pending && (
              <>
                <div className="modal-icon">
                  <FileSpreadsheet />
                </div>
                <h2>Start with this order file?</h2>
                <p>
                  {pending.metadata.filename}
                  <br />
                  {number(pending.metadata.total)} parcels found.
                </p>
                <button
                  disabled={busy}
                  className="import-choice"
                  onClick={() => void commitImport(pending, false)}
                >
                  <History />
                  <span>
                    <b>Keep existing scan history</b>
                    <small>
                      Previously accepted parcels remain duplicates, even in
                      this new file.
                    </small>
                  </span>
                  <ArrowRight />
                </button>
                <button
                  disabled={busy}
                  className="import-choice"
                  onClick={() => void commitImport(pending, true)}
                >
                  <Upload />
                  <span>
                    <b>Clear history and start fresh</b>
                    <small>
                      Permanently delete all scans and counters. Previously
                      accepted parcels can pass again.
                    </small>
                  </span>
                  <ArrowRight />
                </button>
              </>
            )}
            {dialog === "reset" && (
              <>
                <h2>Reset scan history?</h2>
                <p>
                  This permanently deletes all scan attempts, accepted tracking
                  codes, and counters. Previously accepted parcels can be
                  accepted again. Your imported order file stays available.
                </p>
                <button
                  className="button danger"
                  disabled={busy}
                  onClick={() => void clearHistory()}
                >
                  {busy ? "Resetting…" : "Delete history and start fresh"}
                </button>
              </>
            )}
            {dialog === "help" && (
              <>
                <h2>Ready in three steps</h2>
                <ol className="help-list">
                  <li>
                    <b>Import your Shopee Excel.</b>
                    <p>
                      Standard Vietnamese headers are detected automatically.
                    </p>
                  </li>
                  <li>
                    <b>Scan a shipping label.</b>
                    <p>
                      Use a USB scanner ending with Enter, the rear camera, or
                      manual entry (F2).
                    </p>
                  </li>
                  <li>
                    <b>Listen for the result.</b>
                    <p>
                      One bright beep: hand over. Two low beeps: stop and
                      inspect.
                    </p>
                  </li>
                </ol>
                <p className="small-note">
                  Camera and PWA features need HTTPS or localhost. Data belongs
                  to this browser and device. Keep Shopee exports current; order
                  status is read from your imported file.
                </p>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
