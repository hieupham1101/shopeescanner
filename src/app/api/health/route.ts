export function GET() {
  return Response.json({ status: "ok", storage: "local-indexeddb" });
}
