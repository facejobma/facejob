import React, { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import Cookies from "js-cookie";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import toast from "react-hot-toast";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: number;
  data: {
    offre: number;
    msg: string;
    userId: number;
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
  const [userRole, setUserRole] = useState<string | null>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = typeof window !== "undefined"
        ? window.sessionStorage?.getItem("user") || '{}'
        : '{}';
      const userId = user ? JSON.parse(user).id : null;
      setUserId(userId);
      console.log("userRole, ", sessionStorage.getItem("userRole"));
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
        (notification: Notification) => {
          console.log("notification: ", notification);
          fetchNotifications();
          toast.success("You have a new notification");
        },
      );

      window.Echo.private("App.Models.Candidat." + userId).notification(
        (notification: Notification) => {
          console.log("notification: ", notification);
          fetchNotifications();
          toast.success("You have a new notification");
        },
      );
    }

    fetchNotifications();
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationRef]);

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

  return (
    <div className="relative" ref={notificationRef}>
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
        <div className="absolute w-80 sm:w-96 top-10 right-0 bg-white border border-gray-200 rounded-md shadow-xl z-20 transition-all transform origin-top scale-100 opacity-100">
          <ul
            className={`overflow-y-auto max-h-96 transition-all duration-300 ${
              isVisible ? "h-auto opacity-100" : "h-0 opacity-0"
            }`}
          >
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className="relative hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex justify-between px-4 py-2">
                  <div className="w-full">
                    <div className="text-sm text-gray-800 mb-1">
                      {notification.data.msg}
                    </div>
                    {sessionStorage.getItem("userRole") == "entreprise" ? (
                      <div className="text-left text-base mt-2">
                        <Link
                          href="/dashboard/entreprise/mes-offres/[offer_id]"
                          as={`/dashboard/entreprise/mes-offres/${notification.data.offre}`}
                          legacyBehavior
                        >
                          <a className="self-start text-primary font-semibold ml-1">
                            consult
                          </a>
                        </Link>
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                  <div className="w-1/4 text-right text-xs text-gray-500">
                    {formatDistanceToNow(new Date(notification.created_at), {
                      addSuffix: true,
                    })}
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
