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
  Smartphone,
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
type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};
const number = (n: number) => n.toLocaleString("vi-VN");
export default function PackCheck() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);
  useEffect(() => {
    const display = window.matchMedia("(display-mode: standalone)");
    const update = () => setInstalled(display.matches || !!(navigator as Navigator & { standalone?: boolean }).standalone);
    const capture = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const complete = () => { setInstalled(true); setInstallPrompt(null); setDialog(null); };
    update();
    display.addEventListener("change", update);
    window.addEventListener("beforeinstallprompt", capture);
    window.addEventListener("appinstalled", complete);
    return () => {
      display.removeEventListener("change", update);
      window.removeEventListener("beforeinstallprompt", capture);
      window.removeEventListener("appinstalled", complete);
    };
  }, []);
  async function installApp() {
    if (!installPrompt) return;
    setInstalling(true);
    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      setInstallPrompt(null);
      if (choice.outcome === "accepted") setDialog(null);
    } catch {
      setInstallPrompt(null);
    } finally {
      setInstalling(false);
    }
  }
  const [metadata, setMetadata] = useState<ImportMetadata>();
  const [counters, setCounters] = useState<Counters>(emptyCounters);
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const [ready, setReady] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [dialog, setDialog] = useState<
    "settings" | "import" | "reset" | "help" | "install" | null
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
        : "Không phát được âm thanh. Mở cài đặt để thử lại.",
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
          "Không kết nối được cơ sở dữ liệu. Kiểm tra mạng rồi tải lại trang.",
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
            "Chưa thiết lập được ứng dụng trên thiết bị. Giữ kết nối mạng và tải lại trang.",
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
              .catch(() => setError("Không làm mới được lịch sử."));
          const ok = saved.result.status === "ACCEPTED";
          void audio.playResult(saved.result.status).catch(audioError);
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
            "DỪNG BÀN GIAO — chưa xác nhận lưu trên cơ sở dữ liệu. Kiểm tra kết nối rồi tải lại trước khi quét tiếp.",
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
      .catch(() => setError("Không tải được lịch sử quét."));
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
        "Chưa xác nhận nhập tệp vào cơ sở dữ liệu. Kiểm tra kết nối và tải lại để xem dữ liệu đã lưu.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function importFile(file: File) {
    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      setError("Vui lòng chọn tệp Excel .xlsx xuất từ Shopee.");
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
              "Không đọc được Excel. Kiểm tra tệp xuất từ Shopee.",
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
      setError(e instanceof Error ? e.message : "Không nhập được tệp này.");
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
      setError("Không lưu được cài đặt âm thanh trên thiết bị này.");
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
      setError("Không xoá được lịch sử. Vui lòng thử lại.");
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
            SHOPEE <b>KIỂM ĐƠN</b>
            <small>Kiểm tra trước khi bàn giao</small>
          </span>
        </a>
        <div className="top-actions">
          <span className="local-badge">
            <LockKeyhole size={13} /> Dữ liệu dùng chung
          </span>
          <button
            className="icon-button"
            aria-label="Hướng dẫn"
            onClick={() => setDialog("help")}
          >
            <CircleHelp size={19} />
          </button>
          <button
            aria-label="Cài đặt"
            className="settings-button"
            onClick={() => setDialog("settings")}
          >
            <Settings2 size={17} />
            <span>Cài đặt</span>
          </button>
        </div>
      </header>
      <main>
        <div className="page-heading">
          <div>
            <div className="eyebrow">KIỂM TRA BÀN GIAO</div>
            <h1>
              Kiểm đúng đơn. Giao đúng kiện<span>.</span>
            </h1>
            <p>Quét mã vận đơn, kiểm tra kết quả, yên tâm bàn giao.</p>
          </div>
          <div className="station-status">
            <i /> {metadata ? "Sẵn sàng quét" : "Nhập tệp để bắt đầu"}
            <small>
              {ready
                ? "Đồng bộ máy tính và điện thoại"
                : "Đang kết nối dữ liệu…"}
            </small>
          </div>
        </div>
        {!installed && (
          <section className="install-banner">
            <Smartphone size={22} aria-hidden="true" />
            <div><strong>Mở nhanh từ màn hình chính</strong><p>Thêm Kiểm đơn vào điện thoại để mở và quét đơn thuận tiện hơn.</p></div>
            <button className="button secondary" onClick={() => setDialog("install")}>Thêm vào màn hình chính</button>
          </section>
        )}
        {checking && <div className="error-banner" aria-live="polite">ĐANG XÁC NHẬN VỚI MÁY CHỦ — CHƯA BÀN GIAO</div>}
        {error && (
          <div className="error-banner" role="alert">
            {error}
            <button aria-label="Đóng thông báo" onClick={() => setError("")}>
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
              {metadata?.filename || "Chọn tệp đơn hàng Shopee"}{" "}
              {metadata && <span className="data-badge">ĐÃ NHẬP DỮ LIỆU</span>}
            </div>
            <p>
              {metadata
                ? `${number(metadata.total)} kiện · Nhập lúc ${new Date(metadata.importedAt).toLocaleString("vi-VN")} · ${metadata.skipped} dòng thiếu mã vận đơn · ${metadata.merged} dòng trùng đã gộp`
                : "Nhập tệp Excel để kiểm tra trạng thái đơn và phát hiện kiện trùng."}
            </p>
          </div>
          <button
            className="button primary"
            disabled={busy || !ready}
            onClick={() => fileInput.current?.click()}
          >
            <Upload size={16} />
            {busy
              ? "Đang nhập…"
              : metadata
                ? "Đổi tệp Shopee"
                : "Nhập Excel Shopee"}
            <span className="button-key">F4</span>
          </button>
        </section>
        {metadata && (
          <div className="import-summary">
            <span>TRONG TỆP</span>
            <b>
              {number(metadata.waiting)} <small>chờ giao hàng</small>
            </b>
            <b>
              {number(metadata.shipping)} <small>đang giao hàng</small>
            </b>
            <b>
              {number(metadata.cancelled)} <small>đã huỷ</small>
            </b>
          </div>
        )}
        <div className="stats-grid">
          <div className="stat">
            <span>Tổng đơn hàng</span>
            <strong>{number(metadata?.total ?? 0)}</strong>
            <small>Trong tệp Shopee hiện tại</small>
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
                    ACCEPTED: "Được bàn giao",
                    DUPLICATE: "Đơn trùng",
                    CANCELLED: "Đơn huỷ",
                    PICKED_UP: "Đã lấy hàng",
                    UNKNOWN: "Không tìm thấy",
                  }[status]
                }
              </span>
              <strong>{number(counters[status])}</strong>
              <small>
                {status === "ACCEPTED"
                  ? "Đủ điều kiện bàn giao"
                  : "Kiện cần giữ lại"}
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
              <Box size={16} /> Quét đơn hàng
            </button>
            <button
              className={view === "history" ? "active" : ""}
              onClick={() => {
                setView("history");
                setPage(0);
              }}
            >
              <History size={16} /> Lịch sử quét{" "}
              <span>{number(totalScans)}</span>
            </button>
          </div>
          <span>
            {sound ? <Volume2 size={14} /> : <VolumeX size={14} />} Âm thanh{" "}
            {sound ? "bật" : "tắt"}
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
                  Nhập mã thủ công <kbd>F2</kbd>
                </label>
                <div>
                  <input
                    id="manual"
                    ref={manualInput}
                    value={manual}
                    onChange={(e) => setManual(e.target.value)}
                    placeholder="Nhập mã vận đơn"
                    autoComplete="off"
                    spellCheck={false}
                    disabled={!metadata || busy}
                  />
                  <button
                    className="button secondary"
                    disabled={!metadata || busy || !manual.trim()}
                  >
                    Kiểm tra <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            </div>
            <aside className="guide-panel">
              <div className="panel-heading">
                <span>
                  <ShieldCheck size={17} /> NGHE KẾT QUẢ RỒI BÀN GIAO
                </span>
              </div>
              <div className="sound-guide success-guide">
                <div className="guide-icon">
                  <Check size={25} />
                </div>
                <div>
                  <span>ÂM BÁO “CÓ”</span>
                  <h3>Có thể bàn giao.</h3>
                  <p>
                    Đơn hợp lệ. Quét lần đầu.
                    <br />
                    Sẵn sàng giao cho bên vận chuyển.
                  </p>
                </div>
              </div>
              <div className="sound-guide stop-guide">
                <div className="guide-icon">
                  <X size={24} />
                </div>
                <div>
                  <span>ÂM BÁO GIỮ LẠI</span>
                  <h3>Giữ lại kiện hàng.</h3>
                  <p>
                    Đơn trùng, đã huỷ, đã lấy hàng
                    <br />
                    hoặc không có trong tệp đơn hàng.
                  </p>
                </div>
              </div>
              <div className="guide-tip">
                <Zap size={19} />
                <p>
                  <b>Quét liên tục, không cần bấm chuột. </b>Máy quét USB tự nhập mã sau mỗi lần quét.
                </p>
              </div>
              <button
                className="audio-test-link"
                onClick={() => setDialog("settings")}
              >
                <Volume2 size={15} /> Thử âm thanh máy quét{" "}
                <ArrowRight size={15} />
              </button>
            </aside>
          </div>
        )}
        <section className="history-panel">
          <div className="history-heading">
            <div>
              <h2>
                {view === "history" ? "Toàn bộ lịch sử quét" : "Lượt quét gần đây"}
                <span>
                  {view === "history" ? number(totalScans) : "20 lượt gần nhất"}
                </span>
              </h2>
              <p>Lưu mọi lượt kiểm tra, kể cả kiện bị giữ lại.</p>
            </div>
            {view === "station" ? (
              <button
                onClick={() => {
                  setView("history");
                  setPage(0);
                }}
              >
                Xem toàn bộ <ArrowRight size={15} />
              </button>
            ) : (
              <button
                className="danger-text"
                onClick={() => setDialog("reset")}
              >
                Xoá lịch sử quét
              </button>
            )}
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>THỜI GIAN</th>
                  <th>MÃ VẬN ĐƠN</th>
                  <th>KẾT QUẢ</th>
                  <th>ĐƠN VỊ VẬN CHUYỂN</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {new Date(item.scannedAt).toLocaleTimeString("vi-VN")}
                      <small>
                        {view === "history" &&
                          new Date(item.scannedAt).toLocaleDateString("vi-VN")}
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
              <h3>Lịch sử quét sẽ xuất hiện ở đây</h3>
              <p>Nhập tệp đơn hàng và quét kiện đầu tiên.</p>
            </div>
          )}
          {view === "history" && (
            <div className="pagination">
              <button disabled={!page} onClick={() => setPage(page - 1)}>
                <ChevronLeft size={17} /> Trước
              </button>
              <span>Trang {page + 1} · 50 lượt mỗi trang</span>
              <button
                disabled={(page + 1) * 50 >= totalScans}
                onClick={() => setPage(page + 1)}
              >
                Sau <ChevronRight size={17} />
              </button>
            </div>
          )}
        </section>
        <footer>
          <span>
            <ShieldCheck size={14} /> Dữ liệu đồng bộ giữa các thiết bị. Cần kết nối mạng để kiểm tra đơn.
          </span>
          <span>
            “CÓ” = BÀN GIAO <i /> ÂM CẢNH BÁO = GIỮ LẠI
          </span>
          <span>
            KIỂM ĐƠN <b>v1.0</b>
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
                ? "Cài đặt âm thanh"
                : dialog === "import"
                  ? "Nhập tệp Shopee"
                  : dialog === "reset"
                    ? "Xoá lịch sử quét"
                    : dialog === "install" ? "Thêm vào màn hình chính" : "Hướng dẫn quét"
            }
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close icon-button"
              disabled={busy}
              aria-label="Đóng hộp thoại"
              onClick={() => {
                setDialog(null);
                setPending(undefined);
              }}
            >
              <X size={20} />
            </button>
            {dialog === "install" && (
              <>
                <div className="modal-icon"><Smartphone /></div>
                <h2>Thêm vào màn hình chính</h2>
                <p>Mở Kiểm đơn từ biểu tượng trên điện thoại. Cần kết nối mạng để đồng bộ và kiểm tra đơn.</p>
                {installPrompt && (
                  <button className="button primary" disabled={installing} onClick={() => void installApp()}>
                    {installing ? "Đang mở yêu cầu cài đặt…" : "Cài ứng dụng"}
                  </button>
                )}
                <ol className="help-list">
                  <li><b>iPhone / iPad</b><p>Mở trang này bằng Safari → nhấn Chia sẻ → Thêm vào Màn hình chính → Thêm. Bật “Mở dưới dạng ứng dụng web” nếu có.</p></li>
                  <li><b>Android</b><p>Mở trang này bằng Chrome → nhấn menu ⋮ → Thêm vào màn hình chính hoặc Cài đặt ứng dụng → xác nhận.</p></li>
                </ol>
                <p className="small-note">Nếu không thấy tuỳ chọn, hãy mở liên kết bằng Safari hoặc Chrome thay vì trình duyệt trong Zalo/Facebook. Trang cần sử dụng HTTPS để cài ứng dụng.</p>
              </>
            )}
            {dialog === "settings" && (
              <>
                <div className="modal-icon">
                  <Volume2 />
                </div>
                <h2>Âm thanh máy quét</h2>
                <p>Nghe âm báo để biết kết quả kiểm tra.</p>
                <label className="setting-row">
                  Âm báo kết quả
                  <button
                    className={`toggle ${sound ? "on" : ""}`}
                    role="switch"
                    aria-checked={sound}
                    onClick={() => saveAudio(!sound, volume)}
                  >
                    {sound ? "BẬT" : "TẮT"}
                  </button>
                </label>
                <label className="volume-label" htmlFor="volume">
                  Âm lượng <b>{volume}%</b>
                </label>
                <input
                  id="volume"
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => saveAudio(sound, Number(e.target.value))}
                />
                <div className="test-buttons" style={{ flexWrap: "wrap" }}>
                  {(["ACCEPTED", "UNKNOWN", "CANCELLED", "DUPLICATE"] as const).map(status => (
                    <button key={status} className="button secondary" disabled={!sound}
                      onClick={() => void audio.playResult(status).catch(audioError)}>
                      Thử: {{ ACCEPTED: "Có", UNKNOWN: "Không có", CANCELLED: "Đơn huỷ", DUPLICATE: "Đơn trùng" }[status]}
                    </button>
                  ))}
                  <button
                    className="button secondary"
                    disabled={!sound}
                    onClick={() => void audio.playError().catch(audioError)}
                  >
                    Thử âm cảnh báo
                  </button>
                </div>
                <p className="small-note">
                  Cài đặt được lưu trên thiết bị này. Nhấn F8 để bật/tắt âm thanh.
                </p>
              </>
            )}
            {dialog === "import" && pending && (
              <>
                <div className="modal-icon">
                  <FileSpreadsheet />
                </div>
                <h2>Sử dụng tệp đơn hàng này?</h2>
                <p>
                  {pending.metadata.filename}
                  <br />
                  {number(pending.metadata.total)} kiện hàng được tìm thấy.
                </p>
                <button
                  disabled={busy}
                  className="import-choice"
                  onClick={() => void commitImport(pending, false)}
                >
                  <History />
                  <span>
                    <b>Giữ lịch sử quét hiện có</b>
                    <small>
                      Kiện đã được chấp nhận vẫn được đánh dấu trùng khi quét lại, kể cả trong tệp mới.
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
                    <b>Xoá lịch sử và bắt đầu lại</b>
                    <small>
                      Xoá vĩnh viễn lịch sử và bộ đếm. Kiện đã được chấp nhận có thể được chấp nhận lại.
                    </small>
                  </span>
                  <ArrowRight />
                </button>
              </>
            )}
            {dialog === "reset" && (
              <>
                <h2>Xoá lịch sử quét?</h2>
                <p>
                  Thao tác này xoá vĩnh viễn mọi lượt quét, mã đã chấp nhận và bộ đếm trên tất cả thiết bị. Kiện đã được chấp nhận có thể được chấp nhận lại. Tệp đơn hàng đã nhập vẫn được giữ.
                </p>
                <button
                  className="button danger"
                  disabled={busy}
                  onClick={() => void clearHistory()}
                >
                  {busy ? "Đang xoá…" : "Xoá lịch sử và bắt đầu lại"}
                </button>
              </>
            )}
            {dialog === "help" && (
              <>
                <h2>Bắt đầu với ba bước</h2>
                <ol className="help-list">
                  <li>
                    <b>Nhập tệp Excel Shopee.</b>
                    <p>
                      Ứng dụng tự nhận diện tên cột tiếng Việt trong tệp Shopee.
                    </p>
                  </li>
                  <li>
                    <b>Quét mã trên nhãn vận chuyển.</b>
                    <p>
                      Dùng máy quét USB có phím Enter cuối mã, camera sau hoặc nhập mã thủ công (F2).
                    </p>
                  </li>
                  <li>
                    <b>Nghe âm báo kết quả.</b>
                    <p>
                      “Có”: bàn giao. “Không có”, “Đơn huỷ”, “Đơn trùng” hoặc hai tiếng bíp (đã lấy hàng): giữ lại và kiểm tra.
                    </p>
                  </li>
                </ol>
                <p className="small-note">
                  Camera và tính năng thêm vào màn hình chính cần kết nối HTTPS (hoặc localhost). Dữ liệu được đồng bộ giữa các thiết bị qua máy chủ. Hãy nhập tệp Shopee mới nhất vì trạng thái đơn được đọc từ tệp đã nhập.
                </p>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
