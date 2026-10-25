import { suggestProducts } from "@/lib/catalog";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.slice(0, 80) ?? "";
  return Response.json(await suggestProducts(q));
}
