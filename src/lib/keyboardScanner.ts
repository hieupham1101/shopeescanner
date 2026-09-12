export function attachKeyboardScanner(onScan: (code: string) => void) {
  let buffer = "",
    last = 0;
  const listener = (event: KeyboardEvent) => {
    const target = event.target as HTMLElement | null;
    if (
      target?.closest(
        'input,textarea,select,[contenteditable="true"],[role="dialog"]',
      )
    ) {
      buffer = "";
      return;
    }
    if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing)
      return;
    const now = performance.now();
    if (now - last > 100) buffer = "";
    if (event.key === "Enter") {
      if (buffer) {
        event.preventDefault();
        onScan(buffer);
        buffer = "";
      }
    } else if (event.key.length === 1) {
      buffer += event.key;
      if (buffer.length > 512) buffer = "";
    }
    last = now;
  };
  window.addEventListener("keydown", listener);
  return () => window.removeEventListener("keydown", listener);
}
