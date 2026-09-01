import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";

const R2_REGION = "auto"; // Required by AWS SDK, not used by R2

type R2Config = {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl: string;
};

function getR2Config(): R2Config {
  const endpoint = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME || "portfolio";
  const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");

  if (!endpoint) throw new Error("Missing R2_ENDPOINT");
  if (!accessKeyId) throw new Error("Missing R2_ACCESS_KEY_ID");
  if (!secretAccessKey) throw new Error("Missing R2_SECRET_ACCESS_KEY");
  if (!publicUrl) throw new Error("Missing R2_PUBLIC_URL");

  return { endpoint, accessKeyId, secretAccessKey, bucketName, publicUrl };
}

function getR2Client(config: R2Config) {
  return new S3Client({
    region: R2_REGION,
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

export async function uploadFile(key: string, body: Buffer | string) {
  const config = getR2Config();
  const r2 = getR2Client(config);
  await r2.send(
    new PutObjectCommand({
      Bucket: config.bucketName,
      Key: key,
      Body: body,
    }),
  );
}

export async function deleteFile(key: string) {
  const config = getR2Config();
  const r2 = getR2Client(config);
  await r2.send(
    new DeleteObjectCommand({
      Bucket: config.bucketName,
      Key: key,
    }),
  );
}

export async function fileExists(key: string): Promise<boolean> {
  const config = getR2Config();
  const r2 = getR2Client(config);
  const command = new HeadObjectCommand({
    Bucket: config.bucketName,
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
  const config = getR2Config();
  // Check if the file exists
  if (!(await fileExists(key))) {
    return false; // File does not exist
  }

  return `${config.publicUrl}/${key}`; // Return the public URL of the file
}
