import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";

const R2_REGION = "auto"; // Required by AWS SDK, not used by R2
const r2Endpoint = process.env.R2_ENDPOINT;
const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID;
const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const r2BucketName = process.env.R2_BUCKET_NAME || "portfolio";
const r2PublicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");

if (!r2Endpoint) throw new Error("Missing R2_ENDPOINT");
if (!r2AccessKeyId) throw new Error("Missing R2_ACCESS_KEY_ID");
if (!r2SecretAccessKey) throw new Error("Missing R2_SECRET_ACCESS_KEY");
if (!r2PublicUrl) throw new Error("Missing R2_PUBLIC_URL");

const r2 = new S3Client({
  region: R2_REGION, // Required by AWS SDK, not used by R2
  endpoint: r2Endpoint || "",
  credentials: {
    accessKeyId: r2AccessKeyId,
    secretAccessKey: r2SecretAccessKey,
  },
});

export async function uploadFile(key: string, body: Buffer | string) {
  // Upload a file
  await r2.send(
    new PutObjectCommand({
      Bucket: r2BucketName,
      Key: key,
      Body: body,
    }),
  );
}

export async function deleteFile(key: string) {
  await r2.send(
    new DeleteObjectCommand({
      Bucket: r2BucketName,
      Key: key,
    }),
  );
}

export async function fileExists(key: string): Promise<boolean> {
  const command = new HeadObjectCommand({
    Bucket: r2BucketName,
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
  if (!(await fileExists(key))) {
    return false; // File does not exist
  }

  return `${r2PublicUrl}/${key}`; // Return the public URL of the file
}
