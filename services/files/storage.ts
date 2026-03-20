import "server-only";

import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { getLocalDataDir } from "@/lib/local-data-dir";

let s3Client: S3Client | null = null;

function getS3Config() {
  const bucket = process.env.S3_BUCKET;
  const endpoint = process.env.S3_ENDPOINT;
  const region = process.env.S3_REGION;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

  if (!bucket || !endpoint || !region || !accessKeyId || !secretAccessKey) {
    return null;
  }

  return {
    bucket,
    endpoint,
    region,
    accessKeyId,
    secretAccessKey
  };
}

function getS3Client(config: NonNullable<ReturnType<typeof getS3Config>>) {
  if (!s3Client) {
    s3Client = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey
      }
    });
  }

  return s3Client;
}

export async function storeUploadedBuffer(filename: string, buffer: Buffer) {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "-");
  const s3Config = getS3Config();

  if (s3Config) {
    const key = `uploads/${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${safeName}`;
    const client = getS3Client(s3Config);

    await client.send(
      new PutObjectCommand({
        Bucket: s3Config.bucket,
        Key: key,
        Body: buffer,
        ContentType: filename.endsWith(".md") ? "text/markdown" : undefined
      })
    );

    return `s3://${s3Config.bucket}/${key}`;
  }

  const folder = path.join(getLocalDataDir(), "uploads");
  await mkdir(folder, { recursive: true });

  const filePath = path.join(folder, `${randomUUID()}-${safeName}`);
  await writeFile(filePath, buffer);
  return filePath;
}
