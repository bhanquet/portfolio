import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";

const s3Region = process.env.S3_REGION || "auto"; // Required by AWS SDK, not used by R2
const s3Endpoint = process.env.S3_ENDPOINT;
const s3AccessKeyId = process.env.S3_ACCESS_KEY_ID;
const s3SecretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
const s3BucketName = process.env.S3_BUCKET_NAME || "portfolio";
const publicFileUrl =
  process.env.PUBLIC_FILE_URL?.replace(/\/$/, "") ||
  `${s3Endpoint}/${s3BucketName}`;

if (!s3Endpoint) throw new Error("Missing S3_ENDPOINT");
if (!s3AccessKeyId) throw new Error("Missing S3_ACCESS_KEY_ID");
if (!s3SecretAccessKey) throw new Error("Missing S3_SECRET_ACCESS_KEY");

const r2 = new S3Client({
  region: s3Region, // Required by AWS SDK, not used by R2
  endpoint: s3Endpoint || "",
  credentials: {
    accessKeyId: s3AccessKeyId,
    secretAccessKey: s3SecretAccessKey,
  },
});

export async function uploadFile(key: string, body: Buffer | string) {
  // Upload a file
  await r2.send(
    new PutObjectCommand({
      Bucket: s3BucketName,
      Key: key,
      Body: body,
    }),
  );
}

export async function deleteFile(key: string) {
  await r2.send(
    new DeleteObjectCommand({
      Bucket: s3BucketName,
      Key: key,
    }),
  );
}

export async function fileExists(key: string): Promise<boolean> {
  const command = new HeadObjectCommand({
    Bucket: s3BucketName,
    Key: key,
  });

  try {
    await r2.send(command);
    return true; // File exists
  } catch (error: any) {
    if (
      error?.name === "NotFound" ||
      error?.$metadata?.httpStatusCode === 404
    ) {
      return false; // File does not exist
    }

    throw error; // Rethrow other errors
  }
}

export async function getFileUrl(key: string): Promise<string | false> {
  // Check if the file exists
  if (!fileExists(key)) {
    return false; // File does not exist
  }

  return `${publicFileUrl}/${key}`; // Return the public URL of the file
}
