import { parseShopeeFile } from "../lib/shopeeParser";
self.onmessage = (
  event: MessageEvent<{ buffer: ArrayBuffer; filename: string }>,
) => {
  try {
    self.postMessage({
      data: parseShopeeFile(event.data.buffer, event.data.filename),
    });
  } catch (error) {
    self.postMessage({
      error:
        error instanceof Error ? error.message : "Unable to read Excel file.",
    });
  }
};
