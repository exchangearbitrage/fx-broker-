import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomBytes } from "node:crypto";

const uploadRoot = join(process.cwd(), "uploads");

export async function saveKycDocument(file: File, userId: string) {
  return saveDocument(file, userId, "kyc");
}

export async function savePaymentProof(file: File, userId: string) {
  return saveDocument(file, userId, "payments");
}

export async function saveSupportAttachment(file: File, userId: string) {
  return saveDocument(file, userId, "support");
}

async function saveDocument(file: File, userId: string, type: string) {
  const bytes = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const folder = join(uploadRoot, type, userId);
  const storedName = `${Date.now()}-${randomBytes(8).toString("hex")}-${safeName}`;
  const path = join(folder, storedName);

  await mkdir(folder, { recursive: true });
  await writeFile(path, bytes);

  return {
    path,
    originalName: file.name,
    mimeType: file.type || "application/octet-stream",
  };
}
