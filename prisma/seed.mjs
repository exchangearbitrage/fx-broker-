import { createRequire } from "node:module";
import argon2 from "argon2";

const require = createRequire(import.meta.url);
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  await prisma.globalPaymentConfig.upsert({ where: { id: "global-config" }, update: {}, create: { id: "global-config" } });
  await Promise.all([
    { id: "plan-standard", name: "Standard", price: 0, stakingApyBonus: 0, tradingFeeDiscount: 0, hasAccountManager: false, badgeLabel: "STANDARD", demoAllocation: 25000, maxStakingAssets: 4, maxCopyProviders: 1 },
    { id: "plan-pro", name: "Pro Trader", price: 1500, stakingApyBonus: 3.5, tradingFeeDiscount: 30, hasAccountManager: false, badgeLabel: "PRO", demoAllocation: 100000, maxStakingAssets: 7, maxCopyProviders: 4 },
    { id: "plan-vip", name: "VIP Institutional", price: 5000, stakingApyBonus: 8, tradingFeeDiscount: 60, hasAccountManager: true, badgeLabel: "VIP", demoAllocation: 250000, maxStakingAssets: 10, maxCopyProviders: 7 },
  ].map((plan) => prisma.membershipPlan.upsert({ where: { id: plan.id }, update: plan, create: plan })));
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.log("ADMIN_EMAIL and ADMIN_PASSWORD are not set; skipped admin seed.");
    return;
  }

  await prisma.user.upsert({
    where: { email: email.toLowerCase() },
    update: {
      role: "ADMIN",
      status: "ACTIVE",
    },
    create: {
      email: email.toLowerCase(),
      firstName: "Admin",
      lastName: "User",
      role: "ADMIN",
      status: "ACTIVE",
      passwordHash: await argon2.hash(password),
      humanVerifiedAt: new Date(),
      emailVerifiedAt: new Date(),
    },
  });

  console.log(`Seeded admin user: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
