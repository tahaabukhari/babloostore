"use server";

import { randomUUID } from "node:crypto";
import { requireOwnerStore } from "@/lib/auth";
import { isStorageConfigured, putObject } from "@/lib/storage";

const MAX_BYTES = 4 * 1024 * 1024; // the browser shrinks photos first; this is a backstop
const types: Record<string, string> = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png" };

export async function uploadProductImage(form: FormData): Promise<{ url?: string; error?: string }> {
  const { store } = await requireOwnerStore();
  if (!isStorageConfigured()) return { error: "Photo uploads aren't set up yet. Paste an image link instead." };
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a photo to upload." };
  const ext = types[file.type];
  if (!ext) return { error: "Use a JPG, PNG or WebP photo." };
  if (file.size > MAX_BYTES) return { error: "That photo is too large (max 4 MB)." };

  try {
    const key = `${store.id}/${randomUUID()}.${ext}`;
    const url = await putObject(key, new Uint8Array(await file.arrayBuffer()), file.type);
    return { url };
  } catch (e) {
    console.error("uploadProductImage failed", e);
    return { error: "Upload failed. Check your connection and try again." };
  }
}
