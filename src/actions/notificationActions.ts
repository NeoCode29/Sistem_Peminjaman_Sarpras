"use server";

// import { prisma } from '@/lib/prisma';
import {
  createStatusNotification,
  createPickupReminder,
  createReturnReminder,
  createLateReturnNotification,
  createAdminMessageNotification,
  createAdminNotifications,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteReadNotifications,
  // getNotificationsByUserId,
  // markNotificationAsRead,
  // markAllNotificationsAsRead,
  // getUnreadNotificationCount
} from "@/service/notificationService";

export async function getUserNotificationsAction(userId: string, options?: {
  limit?: number;
  offset?: number;
  isRead?: boolean;
}) {
  try {
    const notifications = await getUserNotifications(userId, options);
    return { data: notifications, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Failed to get notifications" };
  }
}

export async function markAsReadAction(notificationId: string) {
  try {
    await markAsRead(notificationId);
    return { error: null };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to mark notification as read" };
  }
}

export async function markAllAsReadAction(userId: string) {
  try {
    await markAllAsRead(userId);
    return { error: null };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to mark all notifications as read" };
  }
}

export async function deleteNotificationAction(notificationId: string) {
  try {
    await deleteNotification(notificationId);
    return { error: null };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to delete notification" };
  }
}

export async function deleteReadNotificationsAction(userId: string) {
  try {
    await deleteReadNotifications(userId);
    return { error: null };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to delete read notifications" };
  }
}

export async function createStatusNotificationAction(
  senderId: string,
  receiverId: string,
  peminjamanId: string,
  newStatus: string,
  message: string
) {
  try {
    const notification = await createStatusNotification(
      senderId,
      receiverId,
      peminjamanId,
      newStatus,
      message
    );
    return { data: notification, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Failed to create status notification" };
  }
}

export async function createPickupReminderAction(
  senderId: string,
  receiverId: string,
  peminjamanId: string,
  pickupDate: Date
) {
  try {
    const notification = await createPickupReminder(
      senderId,
      receiverId,
      peminjamanId,
      pickupDate
    );
    return { data: notification, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Failed to create pickup reminder" };
  }
}

export async function createReturnReminderAction(
  senderId: string,
  receiverId: string,
  peminjamanId: string,
  returnDate: Date
) {
  try {
    const notification = await createReturnReminder(
      senderId,
      receiverId,
      peminjamanId,
      returnDate
    );
    return { data: notification, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Failed to create return reminder" };
  }
}

export async function createLateReturnNotificationAction(
  senderId: string,
  receiverId: string,
  peminjamanId: string,
  daysLate: number
) {
  try {
    const notification = await createLateReturnNotification(
      senderId,
      receiverId,
      peminjamanId,
      daysLate
    );
    return { data: notification, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Failed to create late return notification" };
  }
}

export async function createAdminMessageNotificationAction(
  senderId: string,
  receiverId: string,
  peminjamanId: string,
  message: string
) {
  try {
    const notification = await createAdminMessageNotification(
      senderId,
      receiverId,
      peminjamanId,
      message
    );
    return { data: notification, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Failed to create admin message notification" };
  }
}