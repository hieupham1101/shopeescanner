import { expect, it, vi } from "vitest";
it("I: resumes suspended audio; success has one high tone, error two low tones", async () => {
  const frequencies: number[] = [];
  let resumed = 0;
  class MockAudioContext {
    state = "suspended";
    currentTime = 0;
    destination = {};
    async resume() {
      resumed++;
      this.state = "running";
    }
    createOscillator() {
      const osc = {
        type: "",
        frequency: { value: 0 },
        connect() {},
        disconnect() {},
        start() {
          frequencies.push(osc.frequency.value);
        },
        stop() {},
        onended: null,
      };
      return osc;
    }
    createGain() {
      return {
        gain: {
          setValueAtTime() {},
          linearRampToValueAtTime() {},
          exponentialRampToValueAtTime() {},
        },
        connect() {},
        disconnect() {},
      };
    }
  }
  vi.stubGlobal("AudioContext", MockAudioContext);
  const audio = await import("../src/lib/scannerAudio");
  await audio.playSuccess();
  await audio.playError();
  expect(resumed).toBe(1);
  expect(frequencies).toEqual([1240, 460, 460]);
  audio.setEnabled(false);
  await audio.playSuccess();
  expect(frequencies).toHaveLength(3);
  vi.unstubAllGlobals();
});
