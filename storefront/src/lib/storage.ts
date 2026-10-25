import { GetObjectCommand, NoSuchKey, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

// Neon Object Storage (S3-compatible). Env names match what Neon's Console
// "Connect > Storage" shows. The bucket can stay private: photos are served
// through /media/<key>, which Vercel's CDN caches.
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

/** Path the app serves an uploaded object from. */
export const mediaPath = (key: string) => `/media/${key}`;

export async function putObject(key: string, body: Uint8Array, contentType: string) {
  await s3().send(new PutObjectCommand({ Bucket: env().bucket, Key: key, Body: body, ContentType: contentType }));
  return mediaPath(key);
}

export async function getObject(key: string) {
  try {
    const res = await s3().send(new GetObjectCommand({ Bucket: env().bucket, Key: key }));
    return res.Body ? { body: res.Body.transformToWebStream(), contentType: res.ContentType, length: res.ContentLength } : null;
  } catch (e) {
    if (e instanceof NoSuchKey || (e as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode === 404) return null;
    throw e;
  }
}
