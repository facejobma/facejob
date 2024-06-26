import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import Cookies from "js-cookie";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import toast from "react-hot-toast";

interface Notification {
  id: number;
  data: {
    [key: string]: any;
  };
  created_at: string;
  is_read: boolean;
}

declare global {
  interface Window {
    Echo: Echo;
  }
}

const Notification: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = sessionStorage.getItem("user");
      const userId = user ? JSON.parse(user).id : null;
      setUserId(userId);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchNotifications = async () => {
      try {
        const response = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/api/notifications",
          {
            headers: {
              Authorization: `Bearer ${Cookies.get("authToken")?.replace(/["']/g, "")}`,
              "Content-Type": "application/json",
            },
          },
        );
        if (response.ok) {
          const data = await response.json();
          setNotifications(data);
        } else {
          console.error("Failed to fetch notifications");
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    if (typeof window !== "undefined" && !window.Echo) {
      Pusher.logToConsole = true;

      window.Echo = new Echo({
        broadcaster: "pusher",
        key: "1a293a67e0882be06b73",
        cluster: "eu",
        forceTLS: true,
        authEndpoint:
          process.env.NEXT_PUBLIC_BACKEND_URL + "/broadcasting/auth",
        auth: {
          headers: {
            Authorization: `Bearer ${Cookies.get("authToken")?.replace(/["']/g, "")}`,
          },
        },
      });

      window.Echo.private("App.Models.Entreprise." + userId).notification(
        (notification: any) => {
          console.log("notification: ", notification);
          fetchNotifications();
          toast.success("You have a new notification");
        },
      );
    }

    fetchNotifications();
  }, [userId]);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
    if (!isVisible) {
      markNotificationsAsRead();
    }
  };

  const markNotificationsAsRead = async () => {
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/api/notifications/mark-as-read",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${Cookies.get("authToken")?.replace(/["']/g, "")}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (response.ok) {
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) => ({
            ...notification,
            is_read: true,
          })),
        );
      } else {
        console.error("Failed to mark notifications as read");
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const unreadNotifications = notifications.some(
    (notification) => !notification.is_read,
  );

  const formatHumanDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const renderData = (data: { [key: string]: any }) => {
    return Object.entries(data).map(([key, value]) => {
      if (typeof value === "object" && value !== null) {
        return (
          <div key={key} className="mb-1">
            <strong>{key}:</strong>
            <div className="ml-4">{renderData(value)}</div>
          </div>
        );
      } else {
        return (
          <div key={key} className="text-sm text-gray-800 mb-1">
            <strong>{key}:</strong>{" "}
            {value !== null && value !== undefined ? value.toString() : "N/A"}
          </div>
        );
      }
    });
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <button
          onClick={toggleVisibility}
          className="-mx-2 md:inline-flex"
          aria-label="Notification"
        >
          <Bell size={24} className="text-gray-600" />
          {unreadNotifications && (
            <div className="absolute w-3 h-3 rounded-full bg-red-600 top-0 right-0"></div>
          )}
        </button>
      </div>
      {isVisible && (
        <div className="absolute w-96 top-10 right-0 bg-white rounded-md shadow-xl z-20 transition-all transform origin-top">
          <ul
            className={`overflow-y-auto max-h-96 transition-opacity duration-300 ${
              isVisible ? "h-auto opacity-100" : "h-0 opacity-0"
            }`}
          >
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className="relative hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex justify-between px-4 py-2">
                  <div className="w-3/4">{renderData(notification.data)}</div>
                  <div className="w-2/4 text-right text-xs text-gray-500">
                    {formatHumanDate(notification.created_at)}
                  </div>
                </div>
                <div className="absolute top-0 left-0 w-full h-full invisible group-hover:visible"></div>
                <hr />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Notification;
