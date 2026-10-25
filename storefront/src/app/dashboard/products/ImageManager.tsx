"use client";

import { ArrowLeft, ImagePlus, Link2, X } from "lucide-react";
import { useRef, useState } from "react";
import { uploadProductImage } from "@/app/actions/uploads";
import { Button, ProductImage } from "@/components/ui";

const MAX_IMAGES = 6;
const MAX_EDGE = 1600;

/** Shrink to at most 1600px on the long edge and re-encode as WebP before upload. */
async function compress(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const encode = (type: string) => new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.85));
  // Safari can't encode WebP and silently returns a large PNG instead, so fall back to JPEG.
  const webp = await encode("image/webp");
  if (webp?.type === "image/webp") return webp;
  return (await encode("image/jpeg")) ?? file;
}

export function ImageManager({
  initial,
  category,
  error,
  uploadsEnabled,
}: {
  initial: string[];
  category: string;
  error?: string;
  uploadsEnabled: boolean;
}) {
  const [images, setImages] = useState(initial);
  const [busy, setBusy] = useState(0);
  const [message, setMessage] = useState<string>();
  const [link, setLink] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const room = MAX_IMAGES - images.length;

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setMessage(undefined);
    const picked = Array.from(files).slice(0, room);
    if (files.length > room) setMessage(`Only ${MAX_IMAGES} photos per product — extra files were skipped.`);
    setBusy((n) => n + picked.length);
    for (const file of picked) {
      try {
        const blob = await compress(file);
        const fd = new FormData();
        fd.append("file", new File([blob], blob.type === "image/jpeg" ? "photo.jpg" : "photo.webp", { type: blob.type || file.type }));
        const res = await uploadProductImage(fd);
        if (res.url) setImages((prev) => [...prev, res.url!].slice(0, MAX_IMAGES));
        else setMessage(res.error);
      } catch {
        setMessage("Couldn't read that photo. Try a JPG or PNG.");
      } finally {
        setBusy((n) => n - 1);
      }
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  function addLink() {
    const url = link.trim();
    if (!/^https?:\/\/\S+$/.test(url)) return setMessage("Paste a full image link starting with https://");
    setImages((prev) => [...prev, url].slice(0, MAX_IMAGES));
    setLink("");
    setMessage(undefined);
  }

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-base font-bold">Photos</h2>
        <p id="images-help" className="text-xs text-ink-secondary">
          Up to {MAX_IMAGES}. The first photo is the main one. Square photos on a plain background look best.
        </p>
      </div>
      <input type="hidden" name="images" value={images.join("\n")} />

      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-6" aria-label="Product photos">
        {images.map((src, i) => (
          <li key={src + i} className="relative">
            <ProductImage src={src} category={category} alt={`Photo ${i + 1}${i === 0 ? " (main)" : ""}`} className="rounded-control border border-border" />
            {i === 0 && <span className="absolute bottom-1 left-1 rounded bg-ink px-1.5 text-[11px] font-semibold text-white">Main</span>}
            <div className="absolute right-1 top-1 flex gap-1">
              {i > 0 && (
                <button
                  type="button"
                  onClick={() => setImages((prev) => [prev[i], ...prev.filter((_, j) => j !== i)])}
                  aria-label={`Make photo ${i + 1} the main photo`}
                  className="grid size-8 place-items-center rounded-full bg-surface/95 shadow-sm hover:bg-surface"
                >
                  <ArrowLeft aria-hidden className="size-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                aria-label={`Remove photo ${i + 1}`}
                className="grid size-8 place-items-center rounded-full bg-surface/95 shadow-sm hover:bg-danger-soft hover:text-danger"
              >
                <X aria-hidden className="size-4" />
              </button>
            </div>
          </li>
        ))}
        {Array.from({ length: busy }).map((_, i) => (
          <li key={`busy-${i}`} aria-label="Uploading" className="aspect-square animate-pulse rounded-control bg-surface-muted" />
        ))}
      </ul>

      {room > 0 && (
        <div className="flex flex-wrap items-end gap-3">
          {uploadsEnabled && (
            <>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="sr-only"
                id="photo-upload"
                onChange={(e) => onFiles(e.target.files)}
              />
              <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()} loading={busy > 0}>
                <ImagePlus aria-hidden className="size-4" /> {busy > 0 ? "Uploading" : "Upload photos"}
              </Button>
            </>
          )}
          <div className="flex min-w-60 flex-1 items-end gap-2">
            <div className="flex-1">
              <label htmlFor="image-link" className="mb-1 block text-xs text-ink-secondary">
                {uploadsEnabled ? "…or paste an image link" : "Image link"}
              </label>
              <input
                id="image-link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addLink();
                  }
                }}
                placeholder="https://…"
                className="h-11 w-full rounded-control border border-control bg-surface px-3 text-[16px]"
              />
            </div>
            <Button type="button" variant="secondary" onClick={addLink}>
              <Link2 aria-hidden className="size-4" /> Add
            </Button>
          </div>
        </div>
      )}
      {(message || error) && (
        <p role="alert" className="text-sm text-danger">
          {message ?? error}
        </p>
      )}
    </div>
  );
}
