import type { ScanResultStatus } from "../types/scan";
let context: AudioContext | undefined;
let enabled = true;
let volume = 0.65;
let generation = 0;
const playing = new Set<AudioScheduledSourceNode>();
const buffers = new Map<string, Promise<AudioBuffer>>();
const files = {
  ACCEPTED: "/audio/accepted.mp3",
  UNKNOWN: "/audio/unknown.mp3",
  CANCELLED: "/audio/cancelled.mp3",
  DUPLICATE: "/audio/duplicate.mp3",
} as const;
function stopPlaying() {
  generation++;
  for (const source of playing) source.stop();
  playing.clear();
}
function track(source: AudioScheduledSourceNode, gain: GainNode) {
  playing.add(source);
  source.onended = () => {
    playing.delete(source);
    source.disconnect();
    gain.disconnect();
  };
}
async function loadClip(path: string, ctx: AudioContext) {
  let pending = buffers.get(path);
  if (!pending) {
    pending = fetch(path)
      .then(response => {
        if (!response.ok) throw new Error("Không tải được âm báo. Kiểm tra kết nối và thử lại.");
        return response.arrayBuffer();
      })
      .then(bytes => ctx.decodeAudioData(bytes))
      .catch(error => { buffers.delete(path); throw error; });
    buffers.set(path, pending);
  }
  return pending;
}
export function setVolume(value: number) {
  volume = Math.max(0, Math.min(1, value));
}
export function setEnabled(value: boolean) {
  enabled = value;
  if (!enabled) stopPlaying();
}
export async function initializeAudio() {
  context ??= new AudioContext();
  if (context.state === "suspended") await context.resume();
  if (context.state !== "running")
    throw new Error("Âm thanh đang tạm dừng. Nhấn Thử: Có để bật.");
}
async function play(error: boolean) {
  if (!enabled) return;
  stopPlaying();
  const current = generation;
  await initializeAudio();
  if (!enabled || current !== generation) return;
  const ctx = context!;
  for (let i = 0; i < (error ? 2 : 1); i++) {
    const start = ctx.currentTime + i * 0.23;
    const duration = error ? 0.15 : 0.105;
    const oscillator = ctx.createOscillator(),
      gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = error ? 460 : 1240;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume * 0.4, start + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    track(oscillator, gain);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.01);

  }
}
export async function playResult(status: ScanResultStatus) {
  if (status === "PICKED_UP") return playError();
  if (!enabled) return;
  stopPlaying();
  const current = generation;
  await initializeAudio();
  const ctx = context!;
  const buffer = await loadClip(files[status], ctx);
  // A later scan or mute action supersedes a clip still loading.
  if (!enabled || current !== generation) return;
  const source = ctx.createBufferSource();
  const gain = ctx.createGain();
  source.buffer = buffer;
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  source.connect(gain);
  gain.connect(ctx.destination);
  track(source, gain);
  source.start();
}
export const playSuccess = () => playResult("ACCEPTED");
export const playError = () => play(true);
