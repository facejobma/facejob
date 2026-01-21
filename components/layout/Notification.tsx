import React, { useState, useEffect, useRef, useCallback } from "react";
import { Bell, X } from "lucide-react";
import Cookies from "js-cookie";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import toast from "react-hot-toast";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface Notification {
  id: number;
  data: {
    offre: number;
    msg: string;
    userId: number;
  };
  created_at: string;
  is_read: boolean;
  read_at: string | null;
}

declare global {
  interface Window {
    Echo: any;
    Pusher: typeof Pusher;
  }
}

const Notification: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const echoInitialized = useRef(false);

  // Initialisation de l'utilisateur
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const userStr = window.sessionStorage?.getItem("user");
        const roleStr = window.sessionStorage?.getItem("userRole");
        
        if (userStr) {
          const user = JSON.parse(userStr);
          setUserId(user.id?.toString() || null);
        }
        
        if (roleStr) {
          setUserRole(roleStr);
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // Fonction pour récupérer les notifications
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      const authToken = Cookies.get("authToken")?.replace(/["']/g, "");
      
      if (!authToken) {
        console.error("No auth token found");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Trier les notifications par date (plus récentes en premier)
        const sortedData = Array.isArray(data)
          ? data.sort((a, b) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )
          : [];
        setNotifications(sortedData);
      } else {
        console.error("Failed to fetch notifications:", response.status);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Erreur lors du chargement des notifications");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Configuration de Laravel Echo pour les notifications en temps réel
  useEffect(() => {
    if (!userId || echoInitialized.current) return;

    const authToken = Cookies.get("authToken")?.replace(/["']/g, "");
    if (!authToken) return;

    try {
      if (typeof window !== "undefined" && !window.Echo) {
        // Configuration de Pusher
        window.Pusher = Pusher;
        Pusher.logToConsole = process.env.NODE_ENV === "development";

        window.Echo = new Echo({
          broadcaster: "pusher",
          key: "1a293a67e0882be06b73",
          cluster: "eu",
          forceTLS: true,
          encrypted: true,
          authEndpoint: `${process.env.NEXT_PUBLIC_BACKEND_URL}/broadcasting/auth`,
          auth: {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          },
          enabledTransports: ["ws", "wss"],
        });

        // Écoute des notifications pour les entreprises
        window.Echo.private(`App.Models.Entreprise.${userId}`).notification(
          (notification: Notification) => {
            console.log("Nouvelle notification (Entreprise):", notification);
            fetchNotifications();
            toast.success("Vous avez une nouvelle notification");
          }
        );

        // Écoute des notifications pour les candidats
        window.Echo.private(`App.Models.Candidat.${userId}`).notification(
          (notification: Notification) => {
            console.log("Nouvelle notification (Candidat):", notification);
            fetchNotifications();
            toast.success("Vous avez une nouvelle notification");
          }
        );

        echoInitialized.current = true;
      }
    } catch (error) {
      console.error("Error initializing Echo:", error);
      toast.error("Erreur de connexion aux notifications en temps réel");
    }

    // Récupération initiale des notifications
    fetchNotifications();

    // Nettoyage
    return () => {
      if (window.Echo && echoInitialized.current) {
        window.Echo.leave(`App.Models.Entreprise.${userId}`);
        window.Echo.leave(`App.Models.Candidat.${userId}`);
      }
    };
  }, [userId, fetchNotifications]);

  // Gestion du clic en dehors du composant
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVisible]);

  // Toggle de visibilité
  const toggleVisibility = () => {
    setIsVisible((prev) => !prev);
    if (!isVisible) {
      markNotificationsAsRead();
    }
  };

  // Marquer les notifications comme lues
  const markNotificationsAsRead = async () => {
    try {
      const authToken = Cookies.get("authToken")?.replace(/["']/g, "");
      
      if (!authToken) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications/mark-as-read`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) => ({
            ...notification,
            read_at: notification.read_at || new Date().toISOString(),
          }))
        );
      } else {
        console.error("Failed to mark notifications as read");
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  // Supprimer une notification
  const deleteNotification = async (notificationId: number) => {
    try {
      const authToken = Cookies.get("authToken")?.replace(/["']/g, "");
      
      if (!authToken) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications/${notificationId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setNotifications((prev) =>
          prev.filter((notif) => notif.id !== notificationId)
        );
        toast.success("Notification supprimée");
      } else {
        toast.error("Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const unreadCount = Array.isArray(notifications)
    ? notifications.filter((n) => !n.read_at).length
    : 0;

  return (
    <div className="relative" ref={notificationRef}>
      <button
        onClick={toggleVisibility}
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
        aria-label="Notifications"
      >
        <Bell size={24} className="text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isVisible && (
        <div className="absolute w-80 sm:w-96 top-12 right-0 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
          {/* En-tête */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 text-sm text-blue-600">
                  ({unreadCount} non lue{unreadCount > 1 ? "s" : ""})
                </span>
              )}
            </h3>
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 hover:bg-white rounded-full transition-colors"
              aria-label="Fermer"
            >
              <X size={18} className="text-gray-600" />
            </button>
          </div>

          {/* Liste des notifications */}
          <div className="overflow-y-auto max-h-96">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 px-4">
                <Bell size={48} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">Aucune notification</p>
              </div>
            ) : (
              <ul>
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className={`relative border-b border-gray-100 last:border-b-0 transition-colors hover:bg-gray-50 ${
                      !notification.read_at ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 px-4 py-3">
                      {/* Indicateur non lu */}
                      {!notification.read_at && (
                        <div className="flex-shrink-0 w-2 h-2 mt-2 bg-green-600 rounded-full"></div>
                      )}

                      {/* Contenu de la notification */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 mb-1">
                          {notification.data.msg}
                        </p>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(
                              new Date(notification.created_at),
                              {
                                addSuffix: true,
                                locale: fr,
                              }
                            )}
                          </span>
                          {userRole === "entreprise" &&
                            notification.data.offre && (
                              <Link
                                href={`/dashboard/entreprise/mes-offres/${notification.data.offre}`}
                                className="text-xs text-blue-600 hover:text-blue-800 font-semibold hover:underline"
                                onClick={() => setIsVisible(false)}
                              >
                                Consulter →
                              </Link>
                            )}
                        </div>
                      </div>

                      {/* Bouton supprimer 
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="flex-shrink-0 p-1 hover:bg-red-100 rounded-full transition-colors group"
                        aria-label="Supprimer"
                      >
                        <X
                          size={16}
                          className="text-gray-400 group-hover:text-red-600"
                        />
                      </button>*/}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Pied de page */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => {
                  markNotificationsAsRead();
                  toast.success("Toutes les notifications sont marquées comme lues");
                }}
                className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Tout marquer comme lu
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notification;