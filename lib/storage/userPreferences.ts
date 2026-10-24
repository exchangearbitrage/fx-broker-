import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const filePath = join(process.cwd(), "uploads", "user_preferences.json");

export interface UserPreferences {
  phone?: string;
  country?: string;
  address?: string;
  timezone?: string;
  twoFactorEnabled?: boolean;
  defaultLeverage?: number;
  slippage?: number;
  oneClickTrading?: boolean;
}

async function loadAll(): Promise<Record<string, UserPreferences>> {
  if (!existsSync(filePath)) return {};
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export async function getUserPreferences(userId: string): Promise<UserPreferences> {
  const all = await loadAll();
  return (
    all[userId] || {
      phone: "+1 (555) 234-5678",
      country: "United States",
      address: "120 Wall Street, Suite 400",
      timezone: "America/New_York (UTC-5)",
      twoFactorEnabled: false,
      defaultLeverage: 50,
      slippage: 0.5,
      oneClickTrading: true,
    }
  );
}

export async function saveUserPreferences(userId: string, data: Partial<UserPreferences>): Promise<UserPreferences> {
  const folder = join(process.cwd(), "uploads");
  if (!existsSync(folder)) {
    await mkdir(folder, { recursive: true });
  }

  const all = await loadAll();
  const current = all[userId] || {};
  const updated = { ...current, ...data };
  all[userId] = updated;

  await writeFile(filePath, JSON.stringify(all, null, 2), "utf8");
  return updated;
}
