import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { Bell, ShoppingCart, FileText, Info, AlertCircle, Check, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotifItem {
  id: number;
  type: string;
  title: string;
  message: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}j`;
  return new Date(iso).toLocaleDateString("fr-DZ", { day: "numeric", month: "short" });
}

function TypeIcon({ type }: { type: string }) {
  switch (type) {
    case "order_new":
      return <ShoppingCart className="h-3.5 w-3.5" />;
    case "order_update":
      return <Package className="h-3.5 w-3.5" />;
    case "quote":
    case "quote_new":
      return <FileText className="h-3.5 w-3.5" />;
    case "alert":
      return <AlertCircle className="h-3.5 w-3.5" />;
    default:
      return <Info className="h-3.5 w-3.5" />;
  }
}

function typeColor(type: string) {
  switch (type) {
    case "order_new":
      return "bg-violet-500/15 text-violet-400";
    case "order_update":
      return "bg-blue-500/15 text-blue-400";
    case "quote":
    case "quote_new":
      return "bg-amber-500/15 text-amber-400";
    case "alert":
      return "bg-red-500/15 text-red-400";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotifItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications?limit=30");
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.notifications ?? []);
      setUnread(data.unreadCount ?? 0);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 45_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function markOneRead(id: number) {
    setItems(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnread(prev => Math.max(0, prev - 1));
    await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
  }

  async function markAllRead() {
    if (markingAll || unread === 0) return;
    setMarkingAll(true);
    setItems(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnread(0);
    await fetch("/api/notifications/read-all", { method: "PATCH" });
    setMarkingAll(false);
  }

  async function handleItemClick(item: NotifItem) {
    if (!item.isRead) await markOneRead(item.id);
    setOpen(false);
    if (item.link) navigate(item.link);
  }

  return (
    <div ref={panelRef} className="relative">
      <button
        onClick={() => setOpen(prev => !prev)}
        className={cn(
          "relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150",
          "text-muted-foreground hover:text-foreground hover:bg-white/[0.06]",
          open && "bg-white/[0.08] text-foreground"
        )}
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-[3px] flex items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className={cn(
          "absolute right-0 top-[calc(100%+8px)] z-50 overflow-hidden",
          "w-[360px] max-w-[calc(100vw-24px)]",
          "rounded-2xl border border-white/[0.08] shadow-2xl",
          "bg-[hsl(222,30%,8%)]"
        )}>
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.06]">
            <span className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground/70">
              Notifications
            </span>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                disabled={markingAll}
                className={cn(
                  "flex items-center gap-1.5 text-[11px] font-medium rounded-md px-2 py-1 transition-colors",
                  "text-primary/80 hover:text-primary hover:bg-primary/10"
                )}
              >
                <Check className="h-3 w-3" />
                Tout lire
              </button>
            )}
          </div>

          <div className="overflow-y-auto max-h-[380px] overscroll-contain">
            {loading ? (
              <div className="py-10 flex flex-col items-center gap-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-[calc(100%-32px)] h-14 rounded-xl bg-white/[0.04] animate-pulse" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="py-14 flex flex-col items-center gap-3 text-center px-6">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] flex items-center justify-center">
                  <Bell className="h-5 w-5 text-muted-foreground/40" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground/50">Aucune notification</div>
                  <div className="text-xs text-muted-foreground/40 mt-0.5">Vous êtes à jour</div>
                </div>
              </div>
            ) : (
              items.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={cn(
                    "w-full text-left flex items-start gap-3 px-4 py-3.5 transition-colors duration-100 group",
                    idx < items.length - 1 && "border-b border-white/[0.04]",
                    !item.isRead
                      ? "bg-white/[0.025] hover:bg-white/[0.05]"
                      : "hover:bg-white/[0.025]"
                  )}
                >
                  <div className={cn(
                    "shrink-0 w-8 h-8 rounded-xl flex items-center justify-center mt-0.5",
                    typeColor(item.type)
                  )}>
                    <TypeIcon type={item.type} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className={cn(
                        "text-[13px] leading-snug truncate",
                        item.isRead ? "font-normal text-foreground/70" : "font-semibold text-foreground"
                      )}>
                        {item.title}
                      </span>
                      <span className="shrink-0 text-[10px] text-muted-foreground/50 mt-[1px]">
                        {relativeTime(item.createdAt)}
                      </span>
                    </div>
                    {item.message && (
                      <div className="text-[12px] text-muted-foreground/60 leading-snug mt-0.5 line-clamp-2">
                        {item.message}
                      </div>
                    )}
                  </div>

                  {!item.isRead && (
                    <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
