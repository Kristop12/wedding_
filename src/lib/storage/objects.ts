import { randomBytes } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "@/lib/env";

const MAX_QR_BYTES = 2 * 1024 * 1024;
const QR_FILE = /^[a-f0-9]{32}\.(jpg|png|webp)$/;

export function inspectQrImage(bytes: Uint8Array) {
  if (bytes.byteLength === 0 || bytes.byteLength > MAX_QR_BYTES) {
    return null;
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { extension: "jpg" as const, contentType: "image/jpeg" };
  }
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return { extension: "png" as const, contentType: "image/png" };
  }
  if (
    bytes.byteLength > 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return { extension: "webp" as const, contentType: "image/webp" };
  }
  return null;
}

export function qrFileName(storageKey: string | null) {
  const name = storageKey?.split("/").pop() ?? "";
  return QR_FILE.test(name) ? name : null;
}

export async function saveQrImage(bytes: Uint8Array, extension: "jpg" | "png" | "webp", contentType: string) {
  const key = `qr/${randomBytes(16).toString("hex")}.${extension}`;
  await putObject(key, bytes, contentType);
  return key;
}

export async function readQrImage(storageKey: string) {
  const name = qrFileName(storageKey);
  if (!name || storageKey !== `qr/${name}`) {
    return null;
  }
  const bytes = await getObject(storageKey);
  if (!bytes) {
    return null;
  }
  const inspected = inspectQrImage(bytes);
  if (!inspected) {
    return null;
  }
  return { bytes, contentType: inspected.contentType };
}

export async function deleteQrImage(storageKey: string | null) {
  const name = qrFileName(storageKey);
  if (!name || storageKey !== `qr/${name}`) {
    return;
  }
  await deleteObject(storageKey);
}

function r2Settings() {
  const accountId = env.R2_ACCOUNT_ID;
  const accessKeyId = env.R2_ACCESS_KEY_ID;
  const secretAccessKey = env.R2_SECRET_ACCESS_KEY;
  const bucket = env.R2_BUCKET;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    return null;
  }
  return { accountId, accessKeyId, secretAccessKey, bucket };
}

function r2Client(settings: NonNullable<ReturnType<typeof r2Settings>>) {
  return new S3Client({
    region: "auto",
    endpoint: `https://${settings.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: settings.accessKeyId,
      secretAccessKey: settings.secretAccessKey,
    },
  });
}

async function putObject(key: string, bytes: Uint8Array, contentType: string) {
  const settings = r2Settings();
  if (settings) {
    await r2Client(settings).send(
      new PutObjectCommand({
        Bucket: settings.bucket,
        Key: key,
        Body: bytes,
        ContentType: contentType,
      }),
    );
    return;
  }

  const file = localPath(key);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, bytes);
}

async function getObject(key: string) {
  const settings = r2Settings();
  if (settings) {
    const response = await r2Client(settings).send(
      new GetObjectCommand({ Bucket: settings.bucket, Key: key }),
    );
    const body = response.Body;
    if (!body) {
      return null;
    }
    return new Uint8Array(await body.transformToByteArray());
  }

  try {
    return new Uint8Array(await readFile(localPath(key)));
  } catch {
    return null;
  }
}

async function deleteObject(key: string) {
  const settings = r2Settings();
  if (settings) {
    await r2Client(settings).send(new DeleteObjectCommand({ Bucket: settings.bucket, Key: key }));
    return;
  }
  await unlink(localPath(key)).catch(() => undefined);
}

function localPath(key: string) {
  const name = qrFileName(key);
  if (!name) {
    throw new Error("Invalid QR image key.");
  }
  return path.join(process.cwd(), "storage", "qr", name);
}
