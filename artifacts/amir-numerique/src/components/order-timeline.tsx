import { useEffect, useState } from "react";
import {
  Clock, CheckCircle2, Settings2, Printer, Package,
  Truck, XCircle, Loader2, Check, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export type StageKey = "pending" | "confirmed" | "in_progress" | "printing" | "ready" | "delivered";

export interface HistoryEntry {
  id: number;
  status: string;
  note: string | null;
  createdAt: string;
  changedBy: { id: number; fullName: string } | null;
}

export interface OrderTimelineProps {
  orderId: number;
  currentStatus: string;
}

export const STAGES: { key: StageKey; label: string; labelShort: string; icon: React.ElementType; note: string }[] = [
  { key: "pending",     label: "Commande reçue",   labelShort: "Reçue",    icon: Clock,        note: "Votre commande a été enregistrée" },
  { key: "confirmed",   label: "Confirmée",         labelShort: "Confirmée",icon: CheckCircle2, note: "La commande est confirmée par notre équipe" },
  { key: "in_progress", label: "En préparation",    labelShort: "Prép.",    icon: Settings2,    note: "Les fichiers sont en cours de traitement" },
  { key: "printing",    label: "En impression",     labelShort: "Impression",icon: Printer,     note: "Votre commande est sur la machine d'impression" },
  { key: "ready",       label: "Prête",             labelShort: "Prête",    icon: Package,      note: "Votre commande est prête pour la livraison" },
  { key: "delivered",   label: "Livrée",            labelShort: "Livrée",   icon: Truck,        note: "Commande livrée avec succès" },
];

const STAGE_THEME: Record<string, {
  accent: string; bg: string; border: string; text: string;
  ring: string; glow: string; bar: string;
}> = {
  pending:     { accent:"text-amber-600",   bg:"bg-amber-50",   border:"border-amber-300",   text:"text-amber-700",   ring:"ring-amber-300",   glow:"shadow-amber-200",  bar:"from-amber-500 to-amber-300" },
  confirmed:   { accent:"text-blue-600",    bg:"bg-blue-50",    border:"border-blue-300",    text:"text-blue-700",    ring:"ring-blue-300",    glow:"shadow-blue-200",   bar:"from-blue-500 to-blue-300" },
  in_progress: { accent:"text-violet-600",  bg:"bg-violet-50",  border:"border-violet-300",  text:"text-violet-700",  ring:"ring-violet-300",  glow:"shadow-violet-200", bar:"from-violet-500 to-violet-300" },
  printing:    { accent:"text-indigo-600",  bg:"bg-indigo-50",  border:"border-indigo-300",  text:"text-indigo-700",  ring:"ring-indigo-300",  glow:"shadow-indigo-200", bar:"from-indigo-500 to-indigo-300" },
  ready:       { accent:"text-cyan-600",    bg:"bg-cyan-50",    border:"border-cyan-300",    text:"text-cyan-700",    ring:"ring-cyan-300",    glow:"shadow-cyan-200",   bar:"from-cyan-500 to-cyan-300" },
  delivered:   { accent:"text-emerald-600", bg:"bg-emerald-50", border:"border-emerald-300", text:"text-emerald-700", ring:"ring-emerald-300", glow:"shadow-emerald-200",bar:"from-emerald-500 to-emerald-300" },
  cancelled:   { accent:"text-red-600",     bg:"bg-red-50",     border:"border-red-300",     text:"text-red-700",     ring:"ring-red-300",     glow:"shadow-red-200",    bar:"from-red-500 to-red-300" },
};

function formatShort(iso: string) {
  return new Date(iso).toLocaleString("fr-DZ", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

function formatFull(iso: string) {
  return new Date(iso).toLocaleString("fr-DZ", {
    weekday: "short", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
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
      .then((d: HistoryEntry[]) => setHistory(Array.isArray(d) ? d : []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [orderId, currentStatus]);

  const isCancelled = currentStatus === "cancelled";
  const currentIndex = STAGES.findIndex(s => s.key === currentStatus);
  const currentStage = STAGES[currentIndex];
  const theme = STAGE_THEME[currentStatus] ?? STAGE_THEME["pending"];
  const cancelEntry = history.find(h => h.status === "cancelled");
  const currentEntry = history.find(h => h.status === currentStatus);

  const getEntry = (key: string) => history.find(h => h.status === key);

  const progressPct = isCancelled ? 0 : currentIndex < 0 ? 0
    : Math.round((currentIndex / (STAGES.length - 1)) * 100);

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card shadow-sm flex items-center justify-center h-36">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/30" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">

      {isCancelled ? (
        <CancelledBanner cancelEntry={cancelEntry} />
      ) : (
        <>
          {/* ── Status Banner ─────────────────────────────────── */}
          <div className="relative px-6 py-5 border-b border-border/50 overflow-hidden bg-muted/20">
            <div className={cn("absolute -left-8 -top-8 w-40 h-40 rounded-full blur-3xl opacity-30", theme.bg)} />

            <div className="relative flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl border-2 flex items-center justify-center flex-shrink-0 shadow-md",
                  theme.bg, theme.border, theme.glow
                )}>
                  {currentStage ? (
                    <currentStage.icon className={cn("w-5 h-5", theme.accent)} strokeWidth={2} />
                  ) : (
                    <Clock className="w-5 h-5 text-muted-foreground/40" strokeWidth={2} />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <p className="text-base font-bold text-foreground leading-none">
                      {currentStage?.label ?? "Statut inconnu"}
                    </p>
                    <span className={cn(
                      "text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full border",
                      theme.bg, theme.border, theme.accent
                    )}>
                      En cours
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {currentStage?.note}
                    {currentEntry?.createdAt && (
                      <span className="text-muted-foreground/50 ml-1">· {formatFull(currentEntry.createdAt)}</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-2xl font-bold text-foreground leading-none">
                  {currentIndex + 1}<span className="text-sm text-muted-foreground font-normal"> / {STAGES.length}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">étapes</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="relative mt-4 h-1.5 rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700", theme.bar)}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* ── Step Tracker ── */}
          <div className="hidden md:block px-6 pt-6 pb-5">
            <HorizontalSteps stages={STAGES} currentIndex={currentIndex} getEntry={getEntry} theme={theme} />
          </div>
          <div className="md:hidden px-5 py-4">
            <VerticalSteps stages={STAGES} currentIndex={currentIndex} getEntry={getEntry} theme={theme} />
          </div>
        </>
      )}
    </div>
  );
}

/* ── Horizontal Stepper ─────────────────────────────────────────────── */
function HorizontalSteps({ stages, currentIndex, getEntry, theme }: {
  stages: typeof STAGES;
  currentIndex: number;
  getEntry: (key: string) => HistoryEntry | undefined;
  theme: typeof STAGE_THEME[string];
}) {
  const total = stages.length;

  return (
    <div className="relative">
      {/* Background connector line */}
      <div className="absolute top-[22px] left-[28px] right-[28px] h-px bg-border/60" />
      {/* Progress fill */}
      <div
        className={cn("absolute top-[22px] left-[28px] h-px bg-gradient-to-r transition-all duration-700", theme.bar)}
        style={{
          width: currentIndex < 0 ? "0%"
            : `${(currentIndex / (total - 1)) * 100}%`
        }}
      />

      <div className="relative flex justify-between">
        {stages.map((stage, i) => {
          const isDone    = i < currentIndex;
          const isCurrent = i === currentIndex;
          const isFuture  = i > currentIndex;
          const entry     = getEntry(stage.key);
          const Icon      = stage.icon;

          return (
            <div key={stage.key} className="flex flex-col items-center gap-2" style={{ width: `${100 / total}%` }}>
              {/* Circle */}
              <div className={cn(
                "w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all duration-300 relative z-10",
                isDone    && "border-border bg-muted/60",
                isCurrent && cn("border-2 shadow-lg", theme.border, theme.bg, theme.glow),
                isFuture  && "border-border/50 bg-background",
                isCurrent && "ring-4 ring-offset-0 ring-offset-transparent " + theme.ring,
              )}>
                {isDone ? (
                  <Check className="w-4 h-4 text-muted-foreground" strokeWidth={2.5} />
                ) : (
                  <Icon
                    className={cn(
                      "w-4 h-4",
                      isCurrent && theme.accent,
                      isFuture  && "text-muted-foreground/30",
                    )}
                    strokeWidth={isCurrent ? 2.5 : 1.5}
                  />
                )}
                {isCurrent && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary animate-ping opacity-60" />
                )}
              </div>

              {/* Label */}
              <div className="text-center px-1">
                <p className={cn(
                  "text-[11px] font-semibold leading-tight",
                  isDone    && "text-muted-foreground",
                  isCurrent && "text-foreground",
                  isFuture  && "text-muted-foreground/35",
                )}>
                  {stage.labelShort}
                </p>
                {entry?.createdAt ? (
                  <p className="text-[10px] text-muted-foreground/50 mt-0.5 font-mono leading-none">
                    {formatShort(entry.createdAt)}
                  </p>
                ) : isFuture ? (
                  <p className="text-[10px] text-muted-foreground/30 mt-0.5">—</p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Vertical Stepper (mobile) ──────────────────────────────────────── */
function VerticalSteps({ stages, currentIndex, getEntry, theme }: {
  stages: typeof STAGES;
  currentIndex: number;
  getEntry: (key: string) => HistoryEntry | undefined;
  theme: typeof STAGE_THEME[string];
}) {
  return (
    <div className="space-y-0">
      {stages.map((stage, i) => {
        const isDone    = i < currentIndex;
        const isCurrent = i === currentIndex;
        const isFuture  = i > currentIndex;
        const isLast    = i === stages.length - 1;
        const entry     = getEntry(stage.key);
        const Icon      = stage.icon;

        return (
          <div key={stage.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-9 h-9 rounded-full border-2 flex items-center justify-center flex-shrink-0 z-10 transition-all",
                isDone    && "border-border bg-muted/60",
                isCurrent && cn("border-2 shadow-md", theme.border, theme.bg),
                isFuture  && "border-border/50 bg-background",
              )}>
                {isDone ? (
                  <Check className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2.5} />
                ) : (
                  <Icon className={cn("w-3.5 h-3.5", isCurrent && theme.accent, isFuture && "text-muted-foreground/30")} strokeWidth={2} />
                )}
              </div>
              {!isLast && (
                <div className={cn("w-px flex-1 my-1", isDone ? "bg-border" : "bg-border/40")} style={{ minHeight: 20 }} />
              )}
            </div>
            <div className={cn("pb-4 flex-1 min-w-0", isLast && "pb-0")}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn(
                  "text-sm font-semibold",
                  isDone && "text-muted-foreground", isCurrent && "text-foreground", isFuture && "text-muted-foreground/35",
                )}>
                  {stage.label}
                </span>
                {isCurrent && (
                  <span className={cn("text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border", theme.bg, theme.border, theme.accent)}>
                    Maintenant
                  </span>
                )}
              </div>
              {entry?.createdAt ? (
                <p className="text-xs text-muted-foreground/50 mt-0.5 font-mono">{formatShort(entry.createdAt)}</p>
              ) : isFuture ? (
                <p className="text-xs text-muted-foreground/30 mt-0.5">En attente</p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Cancelled Banner ───────────────────────────────────────────────── */
function CancelledBanner({ cancelEntry }: { cancelEntry?: HistoryEntry }) {
  const theme = STAGE_THEME["cancelled"];
  return (
    <div className="relative overflow-hidden bg-red-50/50">
      <div className="absolute inset-0 bg-gradient-to-r from-red-100/60 via-transparent to-transparent" />
      <div className="relative px-6 py-8 flex items-center gap-6">
        <div className={cn("w-14 h-14 rounded-2xl border-2 flex items-center justify-center flex-shrink-0 shadow-md", theme.bg, theme.border)}>
          <XCircle className={cn("w-7 h-7", theme.accent)} strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-lg font-bold text-red-700">Commande annulée</p>
          {cancelEntry?.createdAt && (
            <p className="text-sm text-muted-foreground mt-1 font-mono">{formatFull(cancelEntry.createdAt)}</p>
          )}
          {cancelEntry?.note && (
            <p className="text-sm text-muted-foreground mt-2">{cancelEntry.note}</p>
          )}
        </div>
      </div>
      <div className="h-px bg-gradient-to-r from-red-200 via-red-100 to-transparent" />
      <div className="px-6 py-4 flex items-center gap-2">
        {[0,1,2,3,4,5].map(i => (
          <div key={i} className={cn("flex-1 h-1 rounded-full", i === 0 ? "bg-red-400/50" : "bg-border/40")} />
        ))}
      </div>
    </div>
  );
}
