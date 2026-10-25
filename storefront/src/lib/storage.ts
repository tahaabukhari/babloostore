import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

// Neon Object Storage (S3-compatible). Env names match what Neon's Console
// "Connect > Storage" shows. The bucket must use the `public_read` access level
// so product photos can be shown straight from storage.
const env = () => ({
  endpoint: process.env.AWS_ENDPOINT_URL_S3,
  region: process.env.AWS_REGION ?? "ap-southeast-1",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  bucket: process.env.S3_BUCKET ?? "stores",
});

export function isStorageConfigured() {
  const e = env();
  return !!(e.endpoint && e.accessKeyId && e.secretAccessKey);
}

let client: S3Client | undefined;
function s3() {
  const e = env();
  return (client ??= new S3Client({
    endpoint: e.endpoint,
    region: e.region,
    credentials: { accessKeyId: e.accessKeyId!, secretAccessKey: e.secretAccessKey! },
    forcePathStyle: true, // Neon supports path-style addressing only
    // Newer SDKs add CRC checksums by default; only send them when an operation requires it.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  }));
}

export function publicUrl(key: string) {
  const e = env();
  const base = process.env.S3_PUBLIC_URL ?? `${e.endpoint!.replace(/\/+$/, "")}/${e.bucket}`;
  return `${base}/${key}`;
}

export async function putPublicObject(key: string, body: Uint8Array, contentType: string) {
  await s3().send(
    new PutObjectCommand({
      Bucket: env().bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      // Keys are unique per upload, so browsers and CDNs can cache forever.
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  return publicUrl(key);
}
