import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { getUserPreferences, saveUserPreferences } from "@/lib/storage/userPreferences";
import argon2 from "argon2";
import { z } from "zod";

const updateProfileSchema = z.object({
  firstName: z.string().max(60).optional(),
  lastName: z.string().max(60).optional(),
  phone: z.string().max(30).optional(),
  country: z.string().max(60).optional(),
  address: z.string().max(120).optional(),
  timezone: z.string().max(60).optional(),
  newEmail: z.string().email().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional(),
  twoFactorEnabled: z.boolean().optional(),
  terminateOtherSessions: z.boolean().optional(),
  displayCurrency: z.string().regex(/^[A-Z]{3}$/).optional(),
  preferredLanguage: z.string().max(10).optional(),
  displayCurrencyManuallySet: z.boolean().optional(),
});

const countryDefaults: Record<string, { currency: string; language: string }> = {
  nigeria: { currency: "NGN", language: "en" }, spain: { currency: "EUR", language: "es" },
};

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      status: true,
      createdAt: true,
      localCurrency: true,
      displayCurrency: true,
      preferredLanguage: true,
      displayCurrencyManuallySet: true,
    },
  });

  const prefs = await getUserPreferences(user.id);
  const sessionCount = await prisma.session.count({
    where: { userId: user.id },
  });

  return NextResponse.json({
    user: {
      ...dbUser,
      ...prefs,
    },
    activeSessions: sessionCount,
  });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await request.json();
    const data = updateProfileSchema.parse(json);

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const prismaUpdates: Record<string, any> = {};

    if (data.firstName !== undefined) prismaUpdates.firstName = data.firstName;
    if (data.lastName !== undefined) prismaUpdates.lastName = data.lastName;
    if (data.displayCurrency !== undefined) prismaUpdates.displayCurrency = data.displayCurrency;
    if (data.preferredLanguage !== undefined) prismaUpdates.preferredLanguage = data.preferredLanguage;
    if (data.displayCurrencyManuallySet !== undefined) prismaUpdates.displayCurrencyManuallySet = data.displayCurrencyManuallySet;
    if (data.country !== undefined && !dbUser.displayCurrencyManuallySet && data.displayCurrency === undefined && data.preferredLanguage === undefined) {
      const defaults = countryDefaults[data.country.trim().toLowerCase()];
      if (defaults) { prismaUpdates.displayCurrency = defaults.currency; prismaUpdates.preferredLanguage = defaults.language; }
    }

    // 1. Email update
    if (data.newEmail && data.newEmail.toLowerCase() !== dbUser.email.toLowerCase()) {
      const existing = await prisma.user.findUnique({
        where: { email: data.newEmail.toLowerCase() },
      });
      if (existing) {
        return NextResponse.json({ error: "Email address is already in use by another account." }, { status: 400 });
      }
      prismaUpdates.email = data.newEmail.toLowerCase();
    }

    // 2. Password change
    if (data.newPassword) {
      if (!data.currentPassword) {
        return NextResponse.json({ error: "Current password is required to set a new password." }, { status: 400 });
      }
      const valid = await argon2.verify(dbUser.passwordHash, data.currentPassword);
      if (!valid) {
        return NextResponse.json({ error: "Current password does not match our records." }, { status: 400 });
      }
      prismaUpdates.passwordHash = await argon2.hash(data.newPassword);
    }

    // 3. Extended preferences update
    const prefUpdates: Record<string, any> = {};
    if (data.phone !== undefined) prefUpdates.phone = data.phone;
    if (data.country !== undefined) prefUpdates.country = data.country;
    if (data.address !== undefined) prefUpdates.address = data.address;
    if (data.timezone !== undefined) prefUpdates.timezone = data.timezone;
    if (data.twoFactorEnabled !== undefined) prefUpdates.twoFactorEnabled = data.twoFactorEnabled;

    if (Object.keys(prefUpdates).length > 0) {
      await saveUserPreferences(user.id, prefUpdates);
    }

    // 4. Terminate other sessions
    if (data.terminateOtherSessions) {
      await prisma.session.deleteMany({
        where: { userId: user.id },
      });
    }

    let updatedDbUser = dbUser;
    if (Object.keys(prismaUpdates).length > 0) {
      updatedDbUser = await prisma.user.update({
        where: { id: user.id },
        data: prismaUpdates,
      });
    }

    const currentPrefs = await getUserPreferences(user.id);

    return NextResponse.json({
      ok: true,
      message: "Settings updated successfully.",
      user: {
        id: updatedDbUser.id,
        email: updatedDbUser.email,
        firstName: updatedDbUser.firstName,
        lastName: updatedDbUser.lastName,
        role: updatedDbUser.role,
        ...currentPrefs,
      },
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: err.message ?? "Server error" }, { status: 500 });
  }
}
