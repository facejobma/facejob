"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Cookies from "js-cookie";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import toast from "react-hot-toast";
import { formatDistanceToNow, isValid } from "date-fns";
import { fr } from "date-fns/locale";
import {
  AlertCircle,
  Bell,
  BellRing,
  BriefcaseBusiness,
  Check,
  CheckCheck,
  Loader2,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";

interface UserIdentity {
  id: string;
  role: "entreprise" | "candidat";
}

interface UserNotification {
  id: string;
  data?: {
    type?: string;
    title?: string;
    message?: string;
    offre?: number | { id?: number };
    msg?: string;
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
  read_at: string | null;
}

const apiHeaders = () => {
  const token = Cookies.get("authToken")?.replace(/["']/g, "");
  return token
    ? { Authorization: `Bearer ${token}`, Accept: "application/json" }
    : null;
};

const getMessage = (notification: UserNotification) =>
  notification.data?.message ||
  notification.data?.msg ||
  "Nouvelle notification";

const getOfferId = (notification: UserNotification) => {
  const value = notification.data?.offre;
  return typeof value === "number" ? value : value?.id;
};

const relativeDate = (value: string) => {
  const date = new Date(value);
  return isValid(date)
    ? formatDistanceToNow(date, { addSuffix: true, locale: fr })
    : "Récemment";
};

function NotificationIcon({
  notification,
}: {
  notification: UserNotification;
}) {
  const type = notification.data?.type || notification.data?.icon;
  if (
    type?.includes("declined") ||
    type?.includes("rejected") ||
    type === "alert-circle"
  ) {
    return (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50">
        <AlertCircle className="h-5 w-5 text-amber-600" />
      </span>
    );
  }
  if (type?.includes("accepted") || type === "check-circle") {
    return (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
        <Check className="h-5 w-5 text-emerald-600" />
      </span>
    );
  }
  if (notification.data?.offre) {
    return (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
        <BriefcaseBusiness className="h-5 w-5 text-blue-600" />
      </span>
    );
  }
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
      <BellRing className="h-5 w-5 text-slate-600" />
    </span>
  );
}

export default function Notification() {
  const [mounted, setMounted] = useState(false);
  const [identity, setIdentity] = useState<UserIdentity | null>(null);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const panelRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = sessionStorage.getItem("user");
      const user = raw ? JSON.parse(raw) : null;
      const storedRole = sessionStorage.getItem("userRole");
      const role = storedRole || user?.role || user?.user_type;
      if (user?.id && (role === "entreprise" || role === "candidat")) {
        setIdentity({ id: String(user.id), role });
      }
    } catch {
      setIdentity(null);
    }
  }, []);

  const loadNotifications = useCallback(
    async (quiet = false) => {
      if (!identity) return;
      const headers = apiHeaders();
      if (!headers) return;
      if (!quiet) setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/v1/notifications", {
          headers,
          cache: "no-store",
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok)
          throw new Error(
            payload?.message || "Impossible de charger les notifications.",
          );
        const rows = payload?.data ?? payload;
        setNotifications(
          Array.isArray(rows)
            ? [...rows].sort(
                (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime(),
              )
            : [],
        );
      } catch (caught) {
        if (!quiet)
          setError(
            caught instanceof Error
              ? caught.message
              : "Une erreur est survenue.",
          );
      } finally {
        if (!quiet) setLoading(false);
      }
    },
    [identity],
  );

  useEffect(() => {
    if (!identity) return;
    void loadNotifications();
    const interval = window.setInterval(
      () => void loadNotifications(true),
      60_000,
    );
    const refreshOnFocus = () => {
      if (document.visibilityState === "visible") void loadNotifications(true);
    };
    document.addEventListener("visibilitychange", refreshOnFocus);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshOnFocus);
    };
  }, [identity, loadNotifications]);

  useEffect(() => {
    if (!identity) return;
    const headers = apiHeaders();
    const key =
      process.env.NEXT_PUBLIC_PUSHER_APP_KEY || "1a293a67e0882be06b73";
    if (!headers || !key) return;

    let echo: Echo<"pusher"> | null = null;
    try {
      Pusher.logToConsole = false;
      echo = new Echo({
        broadcaster: "pusher",
        key,
        cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER || "eu",
        forceTLS: true,
        authEndpoint: "/broadcasting/auth",
        auth: { headers: { ...headers, "X-Requested-With": "XMLHttpRequest" } },
        enabledTransports: ["ws", "wss"],
      });
      const model = identity.role === "entreprise" ? "Entreprise" : "Candidat";
      echo.private(`App.Models.${model}.${identity.id}`).notification(() => {
        void loadNotifications(true);
        toast.success("Vous avez reçu une nouvelle notification.");
      });
    } catch {
      // The periodic refresh remains active if realtime is unavailable.
    }

    return () => {
      if (echo) {
        const model =
          identity.role === "entreprise" ? "Entreprise" : "Candidat";
        echo.leave(`App.Models.${model}.${identity.id}`);
        echo.disconnect();
      }
    };
  }, [identity, loadNotifications]);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        panelRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      )
        return;
      setOpen(false);
    };
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", closeOutside);
    document.addEventListener("keydown", closeWithEscape);
    return () => {
      document.removeEventListener("mousedown", closeOutside);
      document.removeEventListener("keydown", closeWithEscape);
    };
  }, [open]);

  const markOne = async (notification: UserNotification) => {
    if (notification.read_at) return;
    const headers = apiHeaders();
    if (!headers) return;
    try {
      const response = await fetch(
        `/api/v1/notifications/${notification.id}/mark-as-read`,
        { method: "POST", headers },
      );
      if (response.ok) {
        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id
              ? { ...item, read_at: new Date().toISOString() }
              : item,
          ),
        );
      }
    } catch {
      // Reading the destination remains possible even if the acknowledgement fails.
    }
  };

  const markAll = async () => {
    const headers = apiHeaders();
    if (!headers || markingAll) return;
    setMarkingAll(true);
    try {
      const response = await fetch("/api/v1/notifications/mark-as-read", {
        method: "POST",
        headers,
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.message);
      const now = new Date().toISOString();
      setNotifications((current) =>
        current.map((item) => ({ ...item, read_at: item.read_at || now })),
      );
      toast.success("Toutes les notifications sont maintenant lues.");
    } catch {
      toast.error("Impossible de marquer les notifications comme lues.");
    } finally {
      setMarkingAll(false);
    }
  };

  const remove = async (id: string) => {
    const headers = apiHeaders();
    if (!headers || deletingId) return;
    setDeletingId(id);
    try {
      const response = await fetch(`/api/v1/notifications/${id}`, {
        method: "DELETE",
        headers,
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.message);
      setNotifications((current) => current.filter((item) => item.id !== id));
    } catch {
      toast.error("Impossible de supprimer cette notification.");
    } finally {
      setDeletingId(null);
    }
  };

  const actionUrl = (notification: UserNotification) => {
    if (notification.data?.action_url?.startsWith("/"))
      return notification.data.action_url;
    const offerId = getOfferId(notification);
    return identity?.role === "entreprise" && offerId
      ? `/dashboard/entreprise/mes-offres/${offerId}`
      : null;
  };
  const unreadCount = notifications.filter((item) => !item.read_at).length;

  if (!mounted)
    return (
      <button
        type="button"
        disabled
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-400"
        aria-label="Notifications"
      >
        <Bell className="h-[19px] w-[19px]" />
      </button>
    );

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} non lues` : ""}`}
        aria-expanded={open}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
      >
        <Bell className="h-[19px] w-[19px]" />
        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-rose-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open &&
        createPortal(
          <section
            ref={panelRef}
            className="fixed right-3 top-20 z-[100] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20 sm:right-4 sm:top-[72px]"
            style={{ width: "min(400px, calc(100vw - 24px))" }}
            aria-label="Centre de notifications"
          >
            <header className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-white px-4 py-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-slate-900">
                    Notifications
                  </h2>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                      {unreadCount} nouvelle{unreadCount > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  Vos activités récentes sur FaceJob
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-slate-900"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="max-h-[min(560px,calc(100vh-180px))] overflow-y-auto">
              {loading ? (
                <div
                  className="flex min-h-48 items-center justify-center"
                  role="status"
                >
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                  <span className="sr-only">Chargement des notifications</span>
                </div>
              ) : error ? (
                <div className="px-6 py-10 text-center">
                  <AlertCircle className="mx-auto h-8 w-8 text-red-400" />
                  <p className="mt-3 text-sm text-slate-600">{error}</p>
                  <button
                    type="button"
                    onClick={() => void loadNotifications()}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Réessayer
                  </button>
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                    <Bell className="h-6 w-6 text-slate-400" />
                  </span>
                  <h3 className="mt-4 text-sm font-semibold text-slate-900">
                    Vous êtes à jour
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Les nouvelles activités apparaîtront ici.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {notifications.map((notification) => {
                    const href = actionUrl(notification);
                    const content = (
                      <>
                        <NotificationIcon notification={notification} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start gap-2">
                            <div className="min-w-0 flex-1">
                              {notification.data?.title && (
                                <p className="truncate text-sm font-semibold text-slate-900">
                                  {notification.data.title}
                                </p>
                              )}
                              <p className="mt-0.5 line-clamp-3 break-words text-sm leading-5 text-slate-600">
                                {getMessage(notification)}
                              </p>
                            </div>
                            {!notification.read_at && (
                              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                            )}
                          </div>
                          {(notification.data?.sector ||
                            notification.data?.job) && (
                            <p className="mt-2 truncate text-xs text-slate-500">
                              {[notification.data.sector, notification.data.job]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          )}
                          {notification.data?.reason && (
                            <p className="mt-2 rounded-lg bg-amber-50 px-2.5 py-2 text-xs leading-4 text-amber-800">
                              <strong>Motif :</strong>{" "}
                              {notification.data.reason}
                            </p>
                          )}
                          <div className="mt-2 flex items-center justify-between gap-3">
                            <time className="text-[11px] text-slate-400">
                              {relativeDate(notification.created_at)}
                            </time>
                            {href && (
                              <span className="text-xs font-semibold text-emerald-700">
                                {notification.data?.action_text || "Consulter"}{" "}
                                →
                              </span>
                            )}
                          </div>
                        </div>
                      </>
                    );
                    return (
                      <li
                        key={notification.id}
                        className={`group relative transition hover:bg-slate-50 ${!notification.read_at ? "bg-emerald-50/40" : "bg-white"}`}
                      >
                        <div className="flex items-start gap-3 p-4 pr-11">
                          {href ? (
                            <Link
                              href={href}
                              onClick={() => {
                                void markOne(notification);
                                setOpen(false);
                              }}
                              className="contents"
                            >
                              {content}
                            </Link>
                          ) : (
                            <button
                              type="button"
                              onClick={() => void markOne(notification)}
                              className="contents text-left"
                            >
                              {content}
                            </button>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => void remove(notification.id)}
                          disabled={deletingId === notification.id}
                          aria-label="Supprimer la notification"
                          className="absolute right-2 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 opacity-100 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50 sm:opacity-0 sm:group-hover:opacity-100"
                        >
                          {deletingId === notification.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {notifications.length > 0 && (
              <footer className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/80 px-4 py-3">
                <p className="text-[11px] text-slate-500">
                  50 notifications récentes maximum
                </p>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => void markAll()}
                    disabled={markingAll}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                  >
                    {markingAll ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCheck className="h-3.5 w-3.5" />
                    )}
                    Tout marquer comme lu
                  </button>
                )}
              </footer>
            )}
          </section>,
          document.body,
        )}
    </div>
  );
}
