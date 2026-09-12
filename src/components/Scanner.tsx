"use client";
import { useEffect, useRef, useState } from "react";
import { Camera, ScanLine, Usb, CameraOff } from "lucide-react";
import { startCamera } from "../lib/cameraScanner";
export default function Scanner({
  enabled,
  onScan,
}: {
  enabled: boolean;
  onScan: (code: string) => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const callback = useRef(onScan);
  callback.current = onScan;
  const [active, setActive] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    if (!active || !enabled || !video.current) return;
    let disposed = false,
      stop: (() => void) | undefined;
    startCamera(video.current, (code) => callback.current(code), setError)
      .then((cleanup) => {
        if (disposed) cleanup();
        else stop = cleanup;
      })
      .catch(() => {
        setError(
          "Không mở được camera. Cho phép truy cập camera trên kết nối HTTPS, hoặc dùng máy quét USB hay nhập mã thủ công.",
        );
        setActive(false);
      });
    return () => {
      disposed = true;
      stop?.();
    };
  }, [active, enabled]);
  return (
    <section className="scanner-panel">
      <div className="panel-heading">
        <span>
          <ScanLine size={17} /> QUÉT ĐƠN HÀNG
        </span>
        <span className="live-label">
          <i /> {enabled ? "SẴN SÀNG QUÉT" : "CHƯA SẴN SÀNG"}
        </span>
      </div>
      <div className="scan-stage">
        <video
          ref={video}
          muted
          playsInline
          className={active ? "camera-video" : "camera-video hidden"}
        />
        <div className="scan-reticle">
          <span />
          <span />
          <span />
          <span />
          {!active && <ScanLine size={58} strokeWidth={1.2} />}
          <div className="scan-beam" />
        </div>
        {!active && (
          <div className="scan-instruction">
            <h2>
              {enabled
                ? "Sẵn sàng quét kiện tiếp theo"
                : "Kiểm tra từng kiện trước khi giao"}
            </h2>
            <p>
              {enabled
                ? "Quét mã QR hoặc mã vạch vận đơn trên nhãn vận chuyển."
                : "Nhập đơn hàng Shopee để bắt đầu kiểm tra vận đơn."}
            </p>
          </div>
        )}
        <div className="scanner-mode">
          <Usb size={15} /> Hỗ trợ máy quét USB <span>•</span> Quét liên tục không cần bấm chuột
        </div>
      </div>
      <div className="scanner-bottom">
        <span>
          <span className="keycap">↵</span> Quét mã. Nghe kết quả. Bàn giao.
        </span>
        <button
          className="button secondary"
          disabled={!enabled}
          onClick={() => {
            setError("");
            setActive(!active);
          }}
        >
          {active ? <CameraOff size={16} /> : <Camera size={16} />}{" "}
          {active ? "Tắt camera" : "Mở camera"}
        </button>
      </div>
      {error && <p className="inline-error">{error}</p>}
    </section>
  );
}
