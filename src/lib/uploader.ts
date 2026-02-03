import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

function generateRandomCode(length: number = 8): string {
  return crypto.randomBytes(length).toString("hex").slice(0, length);
}

export async function uploadBuffer(
  buffer: Buffer,
  ext: string = ".bin",
  baseUrl: string,
  customFilename?: string
): Promise<{ url: string; filename: string }> {
  const randomCode = generateRandomCode(8);
  if (!ext.startsWith(".")) ext = "." + ext;

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const filename = customFilename ? (customFilename.endsWith(ext) ? customFilename : `${customFilename}${ext}`) : `${randomCode}${ext}`;
  const filePath = path.join(uploadDir, filename);

  await writeFile(filePath, buffer);

  const protocol = baseUrl.includes("localhost") ? "http" : "https";
  const url = `${protocol}://${baseUrl}/uploads/${encodeURIComponent(filename)}`;

  return { url, filename };
}

