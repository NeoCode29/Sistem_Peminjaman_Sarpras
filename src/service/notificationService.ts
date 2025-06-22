"use server";

import { prisma } from "@/lib/prisma";
// import { NotificationType, NotificationPriority, BaseNotification } from "@/types/notification";

// Create notification for status changes
export async function createStatusNotification(
  senderId: string,
  receiverId: string,
  peminjamanId: string,
  newStatus: string,
  message: string
) {
  try {
  const notification = await prisma.notification.create({
    data: {
      senderId,
      receiverId,
      message,
        url: `/admin/peminjaman/${peminjamanId}`,
      isRead: false,
    },
  });
  return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

// Create notification for all admins
export async function createAdminNotifications(
  senderId: string,
  peminjamanId: string,
  message: string
) {
  try {
    // Get all admin users
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true }
    });

    // Create notifications for each admin
    const notifications = await Promise.all(
      admins.map(admin => 
        prisma.notification.create({
          data: {
            senderId,
            receiverId: admin.id,
            message,
            url: `/admin/peminjaman/${peminjamanId}`,
            isRead: false,
          },
        })
      )
    );

    return notifications;
  } catch (error) {
    console.error("Error creating admin notifications:", error);
    throw error;
  }
}

// Create pickup reminder notification
export async function createPickupReminder(
  senderId: string,
  receiverId: string,
  peminjamanId: string,
  pickupDate: Date
) {
  const notification = await prisma.notification.create({
    data: {
      senderId,
      receiverId,
      message: `Jangan lupa untuk mengambil barang pada tanggal ${pickupDate.toLocaleDateString('id-ID')}`,
      url: `/peminjam/peminjaman/${peminjamanId}`,
      isRead: false,
    },
  });
  return notification;
}

// Create return reminder notification
export async function createReturnReminder(
  senderId: string,
  receiverId: string,
  peminjamanId: string,
  returnDate: Date
) {
  const notification = await prisma.notification.create({
    data: {
      senderId,
      receiverId,
      message: `Jangan lupa untuk mengembalikan barang pada tanggal ${returnDate.toLocaleDateString('id-ID')}`,
      url: `/peminjam/peminjaman/${peminjamanId}`,
      isRead: false,
    },
  });
  return notification;
}

// Create late return notification
export async function createLateReturnNotification(
  senderId: string,
  receiverId: string,
  peminjamanId: string,
  daysLate: number
) {
  const notification = await prisma.notification.create({
    data: {
      senderId,
      receiverId,
      message: `Anda terlambat mengembalikan barang selama ${daysLate} hari. Mohon segera mengembalikan barang.`,
      url: `/peminjam/peminjaman/${peminjamanId}`,
      isRead: false,
    },
  });
  return notification;
}

// Create admin message notification
export async function createAdminMessageNotification(
  senderId: string,
  receiverId: string,
  peminjamanId: string,
  message: string
) {
  try {
    await prisma.notification.create({
    data: {
      senderId,
      receiverId,
      message,
        url: `/admin/peminjaman/${peminjamanId}`,
      isRead: false,
    },
  });
  } catch (error) {
    console.error("Error creating admin message notification:", error);
  }
}

// Get all notifications for a user
export async function getUserNotifications(
  receiverId: string,
  options?: {
    limit?: number;
    offset?: number;
    isRead?: boolean;
  }
) {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        receiverId,
        ...(options?.isRead !== undefined && { isRead: options.isRead }),
      },
      include: {
        sender: {
          select: {
            name: true,
            image: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: options?.offset || 0,
      take: options?.limit || 10,
    });
    return notifications || [];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

// Mark notification as read
export async function markAsRead(notificationId: string) {
  try {
    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
    return notification;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
}

// Mark all notifications as read for a user
export async function markAllAsRead(receiverId: string) {
  await prisma.notification.updateMany({
    where: { receiverId },
    data: { isRead: true },
  });
}

// Delete notification
export async function deleteNotification(notificationId: string) {
  await prisma.notification.delete({
    where: { id: notificationId },
  });
}

// Delete all read notifications for a user
export async function deleteReadNotifications(receiverId: string) {
  await prisma.notification.deleteMany({
    where: {
      receiverId,
      isRead: true,
    },
  });
}
