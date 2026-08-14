"use server";

import path from "path";
import fs from "fs/promises";
import { getSession } from "@/lib/session";
import { randomUUID } from "crypto";

const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg"] as const;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const PUBLIC_IMAGES_DIR = path.join(process.cwd(), "public", "images");

type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

const MAGIC_BYTES: Record<AllowedMimeType, number[]> = {
  "image/png": [0x89, 0x50, 0x4e, 0x47],
  "image/jpeg": [0xff, 0xd8, 0xff],
};

const EXTENSIONS: Record<AllowedMimeType, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
};

function hasValidMagicBytes(buffer: Buffer, mimeType: AllowedMimeType): boolean {
  const signature = MAGIC_BYTES[mimeType];
  return signature.every((byte, index) => buffer[index] === byte);
}

function normalizeImagePath(imagePath: string): string | null {
  const match = /^\/images\/[a-zA-Z0-9_-]+\.(png|jpe?g)$/i.exec(imagePath);
  return match ? match[0] : null;
}

export async function uploadImage(
  file: File,
): Promise<{ path?: string; error?: string }> {
  const session = await getSession();
  if (session === null || session.userRole !== "admin") {
    return { error: "Not authorized" };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type as AllowedMimeType)) {
    return { error: "Only PNG and JPEG images are allowed." };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { error: "File size must not exceed 5 MB." };
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const detectedType = file.type as AllowedMimeType;
  if (!hasValidMagicBytes(buffer, detectedType)) {
    return { error: "File content does not match its declared type." };
  }

  const extension = EXTENSIONS[detectedType];
  const randomName = `${randomUUID()}.${extension}`;

  try {
    await fs.mkdir(PUBLIC_IMAGES_DIR, { recursive: true });
    const filePath = path.join(PUBLIC_IMAGES_DIR, randomName);
    await fs.writeFile(filePath, buffer);

    return { path: `/images/${randomName}` };
  } catch (error) {
    console.error("Image upload error:", error);
    return { error: "Failed to upload image." };
  }
}

export async function deleteImage(
  imagePath: string,
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (session === null || session.userRole !== "admin") {
    return { success: false, error: "Not authorized" };
  }

  const normalized = normalizeImagePath(imagePath);
  if (!normalized) {
    return { success: false, error: "Invalid image path." };
  }

  const resolvedDir = path.resolve(PUBLIC_IMAGES_DIR);
  const resolvedTarget = path.resolve(
    path.join(process.cwd(), "public", normalized),
  );

  const isInsideDir =
    resolvedTarget.startsWith(resolvedDir + path.sep) ||
    resolvedTarget === resolvedDir;

  if (!isInsideDir) {
    return { success: false, error: "Invalid image path." };
  }

  try {
    await fs.unlink(resolvedTarget);
    return { success: true };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { success: true };
    }
    console.error("Image delete error:", error);
    return { success: false, error: "Failed to delete image." };
  }
}
