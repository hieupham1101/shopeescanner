import { BrowserMultiFormatReader } from "@zxing/browser";
type NativeDetector = {
  detect(video: HTMLVideoElement): Promise<{ rawValue: string }[]>;
};
type DetectorConstructor = {
  new (options: { formats: string[] }): NativeDetector;
  getSupportedFormats(): Promise<string[]>;
};
export async function startCamera(
  video: HTMLVideoElement,
  onCode: (code: string) => void,
  onError: (message: string) => void,
): Promise<() => void> {
  const Detector = (
    window as unknown as { BarcodeDetector?: DetectorConstructor }
  ).BarcodeDetector;
  if (Detector) {
    try {
      const formats = await Detector.getSupportedFormats();
      if (!formats.includes("qr_code") || !formats.includes("code_128"))
        throw new Error("Use fallback");
      const detector = new Detector({ formats });
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      video.srcObject = stream;
      try {
        await video.play();
      } catch (error) {
        stream.getTracks().forEach((t) => t.stop());
        throw error;
      }
      let stopped = false,
        timer: ReturnType<typeof setTimeout>;
      const loop = async () => {
        if (stopped) return;
        try {
          for (const code of await detector.detect(video))
            if (!stopped) onCode(code.rawValue);
        } catch {
          if (!stopped)
            onError(
              "Camera decoding interrupted. Restart the camera or use USB/manual input.",
            );
        }
        if (!stopped) timer = setTimeout(loop, 100);
      };
      void loop();
      return () => {
        stopped = true;
        clearTimeout(timer);
        stream.getTracks().forEach((t) => t.stop());
        video.srcObject = null;
      };
    } catch (error) {
      if (error instanceof DOMException && error.name === "NotAllowedError")
        throw error;
    }
  }
  const reader = new BrowserMultiFormatReader();
  const controls = await reader.decodeFromConstraints(
    { video: { facingMode: { ideal: "environment" } }, audio: false },
    video,
    (result) => {
      if (result) onCode(result.getText());
    },
  );
  return () => {
    controls.stop();
    video.srcObject = null;
  };
}
