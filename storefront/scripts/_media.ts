import "./env";
import { randomUUID } from "node:crypto";
import { putObject } from "../src/lib/storage";
// 1x1 PNG
const png = Uint8Array.from(Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64"));
putObject(`${randomUUID()}/${randomUUID()}.png`, png, "image/png").then((p) => { console.log(p); process.exit(0); });
