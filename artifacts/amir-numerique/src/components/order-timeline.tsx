import { useEffect, useState } from "react";
import { Clock, CheckCircle2, Settings2, Printer, Package, Truck, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type StageKey = "pending" | "confirmed" | "in_progress" | "printing" | "ready" | "delivered" | "cancelled";

interface HistoryEntry {
  id: number;
  status: string;
  note: string | null;
  createdAt: string;
  changedBy: { id: number; fullName: string } | null;
}

interface OrderTimelineProps {
  orderId: number;
  currentStatus: string;
}

const STAGES: { key: StageKey; label: string; icon: React.ElementType }[] = [
  { key: "pending",    label: "Commande envoyée",  icon: Clock },
  { key: "confirmed",  label: "Confirmée",          icon: CheckCircle2 },
  { key: "in_progress",label: "En préparation",     icon: Settings2 },
  { key: "printing",   label: "En impression",      icon: Printer },
  { key: "ready",      label: "Prête",              icon: Package },
  { key: "delivered",  label: "Livrée",             icon: Truck },
];

const STAGE_COLORS: Record<StageKey, { done: string; dot: string; glow: string }> = {
  pending:     { done: "text-amber-400",  dot: "border-amber-400  bg-amber-400/10",  glow: "shadow-amber-400/20" },
  confirmed:   { done: "text-blue-400",   dot: "border-blue-400   bg-blue-400/10",   glow: "shadow-blue-400/20" },
  in_progress: { done: "text-violet-400", dot: "border-violet-400 bg-violet-400/10", glow: "shadow-violet-400/20" },
  printing:    { done: "text-indigo-400", dot: "border-indigo-400 bg-indigo-400/10", glow: "shadow-indigo-400/20" },
  ready:       { done: "text-cyan-400",   dot: "border-cyan-400   bg-cyan-400/10",   glow: "shadow-cyan-400/20" },
  delivered:   { done: "text-emerald-400",dot: "border-emerald-400 bg-emerald-400/10",glow: "shadow-emerald-400/20" },
  cancelled:   { done: "text-red-400",    dot: "border-red-400    bg-red-400/10",    glow: "shadow-red-400/20" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-DZ", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function OrderTimeline({ orderId, currentStatus }: OrderTimelineProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    fetch(`/api/orders/${orderId}/history`)
      .then(r => r.json())
      .then((data: HistoryEntry[]) => {
        setHistory(Array.isArray(data) ? data : []);
      })
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [orderId, currentStatus]);

  const isCancelled = currentStatus === "cancelled";
  const activeStages = STAGES;
  const currentIndex = activeStages.findIndex(s => s.key === currentStatus);

  const getTimestampForStatus = (status: string) => {
    const entry = history.find(h => h.status === status);
    return entry ? formatDate(entry.createdAt) : null;
  };

  const cancelEntry = history.find(h => h.status === "cancelled");

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[hsl(222,30%,7%)] overflow-hidden">
      <div className="px-6 pt-5 pb-4 border-b border-white/[0.06]">
        <h2 className="text-sm font-semibold text-white/90 tracking-wide uppercase">
          Suivi de commande
        </h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-white/30" />
        </div>
      ) : isCancelled ? (
        <CancelledView cancelEntry={cancelEntry} />
      ) : (
        <div className="px-6 py-6">
          <div className="relative">
            {activeStages.map((stage, i) => {
              const isDone    = i < currentIndex;
              const isCurrent = i === currentIndex;
              const isFuture  = i > currentIndex;
              const colors    = STAGE_COLORS[stage.key];
              const Icon      = stage.icon;
              const timestamp = getTimestampForStatus(stage.key);
              const isLast    = i === activeStages.length - 1;

              return (
                <div key={stage.key} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "relative z-10 w-9 h-9 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300",
                        isDone    && `${colors.dot} border-opacity-80`,
                        isCurrent && `${colors.dot} border-opacity-100 shadow-lg ${colors.glow}`,
                        isFuture  && "border-white/10 bg-white/[0.03]",
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-4 h-4",
                          isDone    && colors.done,
                          isCurrent && cn(colors.done, "animate-pulse"),
                          isFuture  && "text-white/20",
                        )}
                        strokeWidth={isCurrent ? 2.5 : 2}
                      />
                    </div>
                    {!isLast && (
                      <div
                        className={cn(
                          "w-px flex-1 my-1",
                          isDone || isCurrent ? "bg-gradient-to-b from-white/20 to-white/5" : "bg-white/[0.05]"
                        )}
                        style={{ minHeight: 28 }}
                      />
                    )}
                  </div>

                  <div className={cn("pb-6 flex-1 min-w-0", isLast && "pb-0")}>
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span
                        className={cn(
                          "text-sm font-semibold leading-none",
                          isDone    && "text-white/60",
                          isCurrent && "text-white",
                          isFuture  && "text-white/25",
                        )}
                      >
                        {stage.label}
                      </span>
                      {isCurrent && (
                        <span className={cn("text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full", colors.dot, colors.done)}>
                          En cours
                        </span>
                      )}
                    </div>
                    {timestamp && (
                      <p className="mt-1 text-xs text-white/35 font-mono">{timestamp}</p>
                    )}
                    {isFuture && (
                      <p className="mt-0.5 text-xs text-white/20">En attente</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function CancelledView({ cancelEntry }: { cancelEntry?: HistoryEntry }) {
  return (
    <div className="px-6 py-8 flex flex-col items-center text-center gap-3">
      <div className="w-14 h-14 rounded-full border-2 border-red-400/40 bg-red-400/10 flex items-center justify-center shadow-lg shadow-red-400/10">
        <XCircle className="w-7 h-7 text-red-400" strokeWidth={1.5} />
      </div>
      <div>
        <p className="font-semibold text-red-300 text-base">Commande annulée</p>
        {cancelEntry?.createdAt && (
          <p className="text-xs text-white/35 font-mono mt-1">{formatDate(cancelEntry.createdAt)}</p>
        )}
        {cancelEntry?.note && (
          <p className="mt-2 text-sm text-white/50 max-w-xs">{cancelEntry.note}</p>
        )}
      </div>
    </div>
  );
}
