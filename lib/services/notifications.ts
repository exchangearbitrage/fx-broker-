import { prisma } from "@/lib/db";

export const notificationTypes = {
  welcome: "welcome",
  kycReminder: "kyc_reminder",
  newMessage: "new_message",
  accountManagerMessage: "account_manager_message",
  kycSubmitted: "kyc_submitted",
  kycStatusUpdate: "kyc_status_update",
  paymentRequestSubmitted: "payment_request_submitted",
  depositStatusUpdate: "deposit_status_update",
  membershipStatusUpdate: "membership_status_update",
  stakingRewardClaimed: "staking_reward_claimed",
} as const;

export type NotificationType = (typeof notificationTypes)[keyof typeof notificationTypes];
export type NotificationMetadata = Record<string, unknown>;

type NotificationClient = {
  notification: typeof prisma.notification;
  user: typeof prisma.user;
};

type CreateNotificationInput = {
  recipientId: string;
  actorId?: string | null;
  type: NotificationType;
  title: string;
  body: string;
  metadata?: NotificationMetadata;
};

export type NotificationRecord = {
  id: string;
  recipientId: string;
  actorId: string | null;
  type: string;
  title: string;
  body: string;
  metadata: string;
  read: boolean;
  readAt: Date | null;
  createdAt: Date;
  actor?: { id: string; firstName: string; lastName: string; role: string } | null;
};

function serializeMetadata(metadata: NotificationMetadata | undefined) {
  return JSON.stringify(metadata ?? {});
}

function parseMetadata(value: string): NotificationMetadata {
  try {
    const parsed = JSON.parse(value) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as NotificationMetadata : {};
  } catch {
    return {};
  }
}

export function toNotificationResponse(notification: NotificationRecord) {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    metadata: parseMetadata(notification.metadata),
    read: notification.read,
    readAt: notification.readAt,
    createdAt: notification.createdAt,
    actor: notification.actor
      ? {
          id: notification.actor.id,
          name: `${notification.actor.firstName} ${notification.actor.lastName}`.trim() || "Platform team",
          role: notification.actor.role,
        }
      : null,
  };
}

// All application notification creation flows through this function.
export async function createNotification(
  input: CreateNotificationInput,
  client: NotificationClient = prisma,
) {
  if (input.actorId && input.actorId === input.recipientId) return null;

  return client.notification.create({
    data: {
      recipientId: input.recipientId,
      actorId: input.actorId ?? null,
      type: input.type,
      title: input.title.trim().slice(0, 160),
      body: input.body.trim().slice(0, 1_000),
      metadata: serializeMetadata(input.metadata),
    },
  });
}

export async function createAdminNotifications(
  input: Omit<CreateNotificationInput, "recipientId">,
  client: NotificationClient = prisma,
) {
  const admins = await client.user.findMany({
    where: { role: "ADMIN", ...(input.actorId ? { id: { not: input.actorId } } : {}) },
    select: { id: true },
  });

  return Promise.all(admins.map((admin: { id: string }) => createNotification({ ...input, recipientId: admin.id }, client)));
}
