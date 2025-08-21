"use server";

import crypto from "crypto";
import path from "path";
import fs from "fs/promises";
import { getSession } from "@/lib/session";

export async function uploadImage(
  file: File,
): Promise<{ path?: string; error?: string }> {
  const session = await getSession();
  if (session === null || session.userRole !== "admin") {
    return { error: "Not authorized" };
  }

  try {
    // Validate file type
    const allowTypes = ["image/png", "image/jpeg"];
    if (!allowTypes.includes(file.type)) {
      return { error: "Only PNG and JPEG images are allowed." };
    }

    // Read file into buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate a random filename
    const extention = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const randomName = crypto.randomBytes(16).toString("hex") + "." + extention;

    // Save into public/images
    const uploadDir = path.join(process.cwd(), "public", "images");
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, randomName);
    await fs.writeFile(filePath, buffer);

    // Return the path to the uploaded image
    const publicPath = `/images/${randomName}`;
    return { path: publicPath };
  } catch (error: any) {
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

  if (!imagePath.startsWith("/images/")) {
    return { success: false, error: "Invalid image path." };
  }

  const fullPath = path.join(process.cwd(), "public", imagePath);

  try {
    await fs.unlink(fullPath);
    return { success: true };
  } catch (error: any) {
    console.error("Image delete error:", error);
    return { success: false, error: "Failed to delete image." };
  }
}
