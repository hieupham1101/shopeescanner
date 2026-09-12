let context: AudioContext | undefined;
let enabled = true;
let volume = 0.65;
export function setVolume(value: number) {
  volume = Math.max(0, Math.min(1, value));
}
export function setEnabled(value: boolean) {
  enabled = value;
}
export async function initializeAudio() {
  context ??= new AudioContext();
  if (context.state === "suspended") await context.resume();
  if (context.state !== "running")
    throw new Error("Sound is paused. Click Test OK Sound to enable audio.");
}
async function play(error: boolean) {
  if (!enabled) return;
  await initializeAudio();
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
    oscillator.start(start);
    oscillator.stop(start + duration + 0.01);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
  }
}
export const playSuccess = () => play(false);
export const playError = () => play(true);
