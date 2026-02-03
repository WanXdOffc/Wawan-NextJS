"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import axios from "axios";

export function NotificationLoader() {
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    
    const fetchNotifications = async () => {
      try {
        const response = await axios.get("/api/notifications/active");
        const notifications = response.data;

        if (Array.isArray(notifications)) {
          notifications.forEach((notif) => {
            const toastOptions = {
              description: notif.content,
              duration: 5000,
            };

            switch (notif.category) {
              case "success":
                toast.success(notif.title, toastOptions);
                break;
              case "error":
                toast.error(notif.title, toastOptions);
                break;
              case "warning":
                toast.warning(notif.title, toastOptions);
                break;
              default:
                toast.info(notif.title, toastOptions);
            }
          });
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchNotifications();
    fetchedRef.current = true;
  }, []);

  return null;
}
