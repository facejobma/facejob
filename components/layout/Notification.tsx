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
    type?: string;
    title?: string;
    message?: string;
    offre?: number;
    msg?: string;
    userId?: number;
    reason?: string;
    cv_id?: number;
    sector?: string;
    job?: string;
    action_url?: string;
    action_text?: string;
    icon?: string;
    color?: string;
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
  const [isMounted, setIsMounted] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const echoInitialized = useRef(false);

  // Ensure component is mounted before rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialisation de l'utilisateur
  useEffect(() => {
    if (!isMounted) return;
    
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
  }, [isMounted]);

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
        `${(typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_BACKEND_URL)}/api/v1/notifications`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const payload = await response.json();
        const data = payload?.data ?? payload;
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
    if (!userId || !userRole || echoInitialized.current) return;

    const model = userRole === "entreprise"
      ? "Entreprise"
      : userRole === "candidat"
        ? "Candidat"
        : null;

    if (!model) return;

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
          authEndpoint: `${(typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_BACKEND_URL)}/broadcasting/auth`,
          auth: {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          },
          enabledTransports: ["ws", "wss"],
        });

        // Écoute des notifications pour les entreprises
        window.Echo.private(`App.Models.${model}.${userId}`).notification(
          (notification: Notification) => {
            console.log(`Nouvelle notification (${model}):`, notification);
            fetchNotifications();
            toast.success("Vous avez une nouvelle notification");
          }
        );

        // Écoute des notifications pour les candidats
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
  }, [userId, userRole, fetchNotifications]);

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
        `${(typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_BACKEND_URL)}/api/v1/notifications/mark-as-read`,
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
        `${(typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_BACKEND_URL)}/api/v1/notifications/${notificationId}`,
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

  // Don't render until mounted to avoid hydration mismatch
  if (!isMounted) {
    return (
      <div className="relative">
        <button
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
          aria-label="Notifications"
          disabled
        >
          <Bell size={19} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={notificationRef}>
      <button
        onClick={toggleVisibility}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
        aria-label="Notifications"
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-rose-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isVisible && (
        <div className="fixed right-4 top-20 z-[60] w-[calc(100vw-2rem)] max-w-96 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          {/* En-tête */}
          <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-white px-4 py-3.5">
            <h3 className="text-base font-semibold text-gray-900">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 text-sm text-green-600">
                  ({unreadCount})
                </span>
              )}
            </h3>
            <button
              onClick={() => setIsVisible(false)}
              className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
              aria-label="Fermer"
            >
              <X size={18} className="text-gray-600" />
            </button>
          </div>

          {/* Liste des notifications */}
          <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-emerald-100 border-t-emerald-600"></div>
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
                      !notification.read_at ? "bg-green-50/30" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3 px-4 py-3">
                      {/* Indicateur non lu */}
                      {!notification.read_at && (
                        <div className="flex-shrink-0 w-2 h-2 mt-2 bg-green-600 rounded-full"></div>
                      )}
                      
                      {/* Icône de notification */}
                      {notification.data.icon && (
                        <div className="flex-shrink-0 mt-1">
                          {notification.data.icon === 'check-circle' && (
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                              <span className="text-green-600 text-lg">✓</span>
                            </div>
                          )}
                          {notification.data.icon === 'alert-circle' && (
                            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                              <span className="text-amber-600 text-lg">⚠</span>
                            </div>
                          )}
                          {!notification.data.icon.includes('circle') && (
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <Bell size={16} className="text-blue-600" />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Contenu de la notification */}
                      <div className="flex-1 min-w-0">
                        {/* Titre de la notification */}
                        {notification.data.title && (
                          <p className="text-sm font-semibold text-gray-900 mb-1">
                            {notification.data.title}
                          </p>
                        )}
                        
                        {/* Message de la notification */}
                        <p className="text-sm text-gray-700 mb-1">
                          {notification.data.message || notification.data.msg}
                        </p>
                        
                        {/* Informations supplémentaires pour CV */}
                        {(notification.data.sector || notification.data.job) && (
                          <div className="text-xs text-gray-600 mb-1">
                            {notification.data.sector && (
                              <span>📂 {notification.data.sector}</span>
                            )}
                            {notification.data.sector && notification.data.job && (
                              <span className="mx-1">•</span>
                            )}
                            {notification.data.job && (
                              <span>💼 {notification.data.job}</span>
                            )}
                          </div>
                        )}
                        
                        {/* Raison du refus si présente */}
                        {notification.data.reason && (
                          <div className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded mt-1">
                            <strong>Raison :</strong> {notification.data.reason}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between gap-2 mt-2">
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(
                              new Date(notification.created_at),
                              {
                                addSuffix: true,
                                locale: fr,
                              }
                            )}
                          </span>
                          
                          {/* Lien d'action */}
                          {notification.data.action_url && (
                            <Link
                              href={notification.data.action_url}
                              className="text-xs text-green-600 hover:text-green-700 font-medium hover:underline"
                              onClick={() => setIsVisible(false)}
                            >
                              {notification.data.action_text || "Consulter"} →
                            </Link>
                          )}
                          
                          {/* Lien pour entreprise */}
                          {userRole === "entreprise" &&
                            notification.data.offre && (
                              <Link
                                href={`/dashboard/entreprise/mes-offres/${notification.data.offre}`}
                                className="text-xs text-green-600 hover:text-green-700 font-medium hover:underline"
                                onClick={() => setIsVisible(false)}
                              >
                                Consulter →
                              </Link>
                            )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Pied de page */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => {
                  markNotificationsAsRead();
                  toast.success("Toutes les notifications sont marquées comme lues");
                }}
                className="w-full text-sm text-green-600 hover:text-green-700 font-medium py-1"
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
