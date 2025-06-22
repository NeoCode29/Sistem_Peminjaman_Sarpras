"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserNotifications, markAsRead } from "@/service/notificationService";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  message: string;
  url: string | null;
  isRead: boolean;
  createdAt: Date;
  sender: {
    name: string | null;
    image: string | null;
  };
}

interface NotificationPopoverProps {
  userId: string;
}

export function NotificationPopover({ userId }: NotificationPopoverProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  const fetchNotifications = async () => {
    if (!userId) return;
    
    try {
      const data = await getUserNotifications(userId, { limit: 10 });
      // Add defensive programming - ensure data is an array
      const notificationArray = Array.isArray(data) ? data : [];
      setNotifications(notificationArray);
      setUnreadCount(notificationArray.filter(n => !n.isRead).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      // Set empty array on error to prevent crashes
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchNotifications();
      // Refresh notifications every minute
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (!notification.isRead) {
        await markAsRead(notification.id);
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      if (notification.url) {
        router.push(notification.url);
      }
    } catch (error) {
      console.error("Error handling notification click:", error);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">Notifikasi</h4>
          {unreadCount > 0 && (
            <span className="text-sm text-muted-foreground">
              {unreadCount} belum dibaca
            </span>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Tidak ada notifikasi
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "w-full p-4 text-left hover:bg-muted/50 transition-colors",
                    !notification.isRead && "bg-muted/30"
                  )}
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-sm">{notification.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(notification.createdAt), "dd MMM yyyy HH:mm", { locale: id })}
                      </span>
                      {notification.url && (
                        <span className="text-xs text-blue-500 hover:underline">
                          Lihat detail
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
} 