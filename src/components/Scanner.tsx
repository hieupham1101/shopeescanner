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
          "Camera unavailable. Allow camera access over HTTPS, or use a USB scanner or manual entry.",
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
          <ScanLine size={17} /> SCANNING STATION
        </span>
        <span className="live-label">
          <i /> {enabled ? "READY FOR SCAN" : "AWAITING IMPORT"}
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
                ? "Ready for the next parcel"
                : "Your final check. Every parcel."}
            </h2>
            <p>
              {enabled
                ? "Scan the tracking QR code or barcode on the shipping label."
                : "Import your Shopee orders to start checking shipping labels."}
            </p>
          </div>
        )}
        <div className="scanner-mode">
          <Usb size={15} /> USB scanner ready <span>•</span> No click needed
          between scans
        </div>
      </div>
      <div className="scanner-bottom">
        <span>
          <span className="keycap">↵</span> Scan. Listen. Hand over.
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
          {active ? "Stop camera" : "Use camera"}
        </button>
      </div>
      {error && <p className="inline-error">{error}</p>}
    </section>
  );
}
