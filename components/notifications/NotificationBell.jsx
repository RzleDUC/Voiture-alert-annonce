// components/notifications/NotificationBell.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function fetchUnread() {
      try {
        const { data: authData, error: authError } =
          await supabase.auth.getUser();
        if (authError) throw authError;
        const currentUserId = authData?.user?.id;

        if (!currentUserId) {
          if (mounted) {
            setUnreadCount(0);
            setLoading(false);
          }
          return;
        }

        if (mounted) setUserId(currentUserId);

        const { data, error } = await supabase
          .from("notifications")
          .select("id, read_at")
          .eq("user_id", currentUserId)
          .is("read_at", null);

        if (!mounted) return;

        if (error) {
          console.error("Erreur chargement notifications :", error);
          setUnreadCount(0);
        } else {
          setUnreadCount(data?.length || 0);
        }
      } catch (err) {
        if (!mounted) return;
        console.error("Erreur auth/notifications :", err);
        setUnreadCount(0);
      }

      setLoading(false);
    }

    fetchUnread();

    // Petit polling toutes les 30s pour rester à jour
    const interval = setInterval(fetchUnread, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const fetchNotifications = async () => {
    if (!userId) {
      setNotifications([]);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(8);

      if (error) throw error;

      setNotifications(data || []);
      const unread = (data || []).filter((n) => !n.read_at).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Erreur chargement notifications :", err);
      setNotifications([]);
    }
  };

  const handleToggle = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      await fetchNotifications();
    }
  };

  const handleOpenNotification = (notifId) => {
    setOpen(false);
    router.push("/notifications");
    // Optionally could scroll to notifId; kept simple per request
  };

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleToggle}
        className="relative border-slate-300 text-slate-700 hover:bg-slate-100
                   dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
        title="Centre de notifications"
      >
        <Bell className="h-4 w-4" />

        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 inline-flex items-center justify-center
                           rounded-full bg-red-500 text-[10px] font-bold text-white
                           h-4 min-w-[16px] px-[3px]"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-80 rounded-lg border border-slate-200 bg-white shadow-lg
                     dark:bg-slate-900 dark:border-slate-700 z-50"
        >
          <div className="p-3 border-b border-slate-100 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Notifications
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {loading ? "Chargement..." : "Dernières mises à jour"}
            </p>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {!userId && (
              <div className="p-3 text-xs text-slate-500">
                Connecte-toi pour voir tes notifications.
              </div>
            )}

            {userId && notifications.length === 0 && !loading && (
              <div className="p-3 text-xs text-slate-500">
                Aucune notification pour l'instant.
              </div>
            )}

            {notifications.map((n) => {
              const isUnread = !n.read_at;
              const created = n.created_at
                ? new Date(n.created_at).toLocaleString()
                : "";
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleOpenNotification(n.id)}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-slate-500">{created}</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {n.title || "Notification"}
                      </p>
                      {n.body && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                          {n.body}
                        </p>
                      )}
                    </div>
                    {isUnread && (
                      <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-sky-600 hover:text-sky-500"
              onClick={() => {
                setOpen(false);
                router.push("/notifications");
              }}
            >
              Voir toutes les notifications
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
