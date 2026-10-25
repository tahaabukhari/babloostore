import { getObject } from "@/lib/storage";

// Only keys the uploader creates: <storeId>/<uuid>.<ext>
const KEY = /^[0-9a-f-]{36}\/[0-9a-f-]{36}\.(webp|jpg|png)$/;

export async function GET(_: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const key = (await params).key.join("/");
  if (!KEY.test(key)) return new Response("Not found", { status: 404 });
  const obj = await getObject(key);
  if (!obj) return new Response("Not found", { status: 404 });
  return new Response(obj.body, {
    headers: {
      "Content-Type": obj.contentType ?? "application/octet-stream",
      ...(obj.length ? { "Content-Length": String(obj.length) } : {}),
      // Keys are unique per upload, so browsers and Vercel's CDN can cache forever.
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
