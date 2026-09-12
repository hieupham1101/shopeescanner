import { afterEach, expect, it, vi } from "vitest";

afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); });
function setup() {
  const played: string[] = [];
  const frequencies: number[] = [];
  const levels: number[] = [];
  let stopped = 0;
  class MockAudioContext {
    state = "suspended";
    currentTime = 0;
    destination = {};
    async resume() { this.state = "running"; }
    async decodeAudioData(bytes: ArrayBuffer) { return { path: new TextDecoder().decode(bytes) }; }
    createBufferSource() {
      const source = {
        buffer: { path: "" }, connect() {}, disconnect() {}, onended: null,
        start() { played.push(source.buffer.path); },
        stop() { stopped++; },
      };
      return source;
    }
    createOscillator() {
      const source = {
        type: "", frequency: { value: 0 }, connect() {}, disconnect() {}, onended: null,
        start() { frequencies.push(source.frequency.value); }, stop() {},
      };
      return source;
    }
    createGain() {
      return {
        gain: {
          setValueAtTime(value: number) { levels.push(value); },
          linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {},
        },
        connect() {}, disconnect() {},
      };
    }
  }
  vi.stubGlobal("AudioContext", MockAudioContext);
  const fetcher = vi.fn(async (path: string) => ({
    ok: true, arrayBuffer: async () => new TextEncoder().encode(path).buffer,
  }));
  vi.stubGlobal("fetch", fetcher);
  return { played, frequencies, levels, fetcher, stopped: () => stopped };
}

it("plays each supplied clip, caches it, applies volume and keeps pickup warning", async () => {
  const mock = setup();
  const audio = await import("../src/lib/scannerAudio");
  audio.setVolume(0.3);
  for (const status of ["ACCEPTED", "UNKNOWN", "CANCELLED", "DUPLICATE"] as const) await audio.playResult(status);
  expect(mock.played).toEqual(["/audio/accepted.mp3", "/audio/unknown.mp3", "/audio/cancelled.mp3", "/audio/duplicate.mp3"]);
  expect(mock.levels).toEqual([0.3, 0.3, 0.3, 0.3]);
  await audio.playSuccess();
  expect(mock.fetcher).toHaveBeenCalledTimes(4);
  expect(mock.stopped()).toBe(4);
  await audio.playResult("PICKED_UP");
  expect(mock.frequencies).toEqual([460, 460]);
  audio.setEnabled(false);
  await audio.playResult("UNKNOWN");
  expect(mock.played).toHaveLength(5);
});

it("does not play an older scan when its clip loads after the next scan", async () => {
  const mock = setup();
  let release!: () => void;
  mock.fetcher.mockImplementationOnce(async (path: string) => {
    await new Promise<void>(resolve => { release = resolve; });
    return { ok: true, arrayBuffer: async () => new TextEncoder().encode(path).buffer };
  });
  const audio = await import("../src/lib/scannerAudio");
  const first = audio.playResult("ACCEPTED");
  await vi.waitFor(() => expect(release).toBeTypeOf("function"));
  await audio.playResult("DUPLICATE");
  release();
  await first;
  expect(mock.played).toEqual(["/audio/duplicate.mp3"]);
});

it("retries a clip after a failed download", async () => {
  const mock = setup();
  mock.fetcher.mockRejectedValueOnce(new Error("Network unavailable"));
  const audio = await import("../src/lib/scannerAudio");
  await expect(audio.playResult("ACCEPTED")).rejects.toThrow("Network unavailable");
  await audio.playResult("ACCEPTED");
  expect(mock.played).toEqual(["/audio/accepted.mp3"]);
});
