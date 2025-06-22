// Notification Types
export enum NotificationType {
  STATUS_UPDATE = "STATUS_UPDATE",
  PICKUP_REMINDER = "PICKUP_REMINDER",
  RETURN_REMINDER = "RETURN_REMINDER",
  ADMIN_MESSAGE = "ADMIN_MESSAGE",
  LATE_RETURN = "LATE_RETURN",
  SYSTEM = "SYSTEM",
}

export enum NotificationPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export interface BaseNotification {
  senderId: string;
  receiverId: string;
  message: string;
  url?: string;
  isRead: boolean;
  createdAt: Date;
} 