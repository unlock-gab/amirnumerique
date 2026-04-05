import { AdminLayout } from "@/components/layouts/admin-layout";
import { useListQuotes, useUpdateQuoteStatus } from "@workspace/api-client-react";
import { useI18n } from "@/hooks/use-i18n";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  Loader2, FileText, Calendar, User, Maximize2, DollarSign,
  ArrowRight, CheckCircle, XCircle, Clock, MessageSquare, Paperclip,
  MailOpen, RefreshCw,
} from "lucide-react";
import { useState } from "react";

const STATUS_CONFIG: Record<string, { label: string; icon: any; cls: string }> = {
  pending:           { label: "En attente",  icon: Clock,        cls: "bg-amber-500/10 text-amber-400 border-amber-500/25" },
  responded:         { label: "Répondu",     icon: MailOpen,     cls: "bg-blue-500/10 text-blue-400 border-blue-500/25" },
  accepted:          { label: "Accepté",     icon: CheckCircle,  cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25" },
  refused:           { label: "Refusé",      icon: XCircle,      cls: "bg-red-500/10 text-red-400 border-red-500/25" },
  converted_to_order:{ label: "Converti",    icon: RefreshCw,    cls: "bg-violet-500/10 text-violet-400 border-violet-500/25" },
};

const QUICK_ACTIONS = [
  { status: "responded",  label: "Marquer répondu",  icon: MailOpen,    variant: "outline" as const },
  { status: "accepted",   label: "Accepter",          icon: CheckCircle, variant: "outline" as const },
  { status: "refused",    label: "Refuser",            icon: XCircle,     variant: "outline" as const },
];

export default function AdminQuotes() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { data: result, isLoading, refetch } = useListQuotes({});
  const updateStatus = useUpdateQuoteStatus();
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const quotes: any[] = (result as any)?.quotes || (Array.isArray(result) ? result : []);
  const total = (result as any)?.total ?? quotes.length;
  const pending = quotes.filter((q) => q.status === "pending").length;
  const responded = quotes.filter((q) => q.status === "responded").length;

  const handleQuickAction = (id: number, status: string) => {
    setUpdatingId(id);
    updateStatus.mutate(
      { id, data: { status: status as any } },
      {
        onSuccess: () => {
          toast({ title: "Statut mis à jour" });
          refetch();
        },
        onError: () => toast({ title: "Erreur", variant: "destructive" }),
        onSettled: () => setUpdatingId(null),
      }
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-700 tracking-tight">{t("manageQuotes")}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {total} demande{total !== 1 ? "s" : ""} de devis reçue{total !== 1 ? "s" : ""}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5 shrink-0">
            <RefreshCw className="h-3.5 w-3.5" /> Actualiser
          </Button>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total", value: total, color: "text-foreground", bg: "bg-muted/40", border: "border-border/60" },
            { label: "En attente", value: pending, color: "text-amber-400", bg: "bg-amber-500/8", border: "border-amber-500/20" },
            { label: "Répondus", value: responded, color: "text-blue-400", bg: "bg-blue-500/8", border: "border-blue-500/20" },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl border ${s.border} ${s.bg} px-5 py-4`}>
              <div className={`font-display text-3xl font-700 tabular-nums ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground font-medium mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : quotes.length === 0 ? (
          /* ── Empty state ── */
          <div className="rounded-2xl border border-border/40 bg-card/40 py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted/60 border border-border/40 flex items-center justify-center mx-auto mb-5">
              <FileText className="h-7 w-7 text-muted-foreground/30" />
            </div>
            <h3 className="font-display font-700 text-lg mb-2">Aucune demande de devis</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
              Les demandes soumises par vos clients depuis le site apparaîtront ici, triées par date.
            </p>
          </div>
        ) : (
          /* ── Quote cards ── */
          <div className="space-y-4">
            {quotes.map((quote: any, i: number) => {
              const cfg = STATUS_CONFIG[quote.status] || STATUS_CONFIG.pending;
              const StatusIcon = cfg.icon;
              const serviceName = quote.service?.nameFr || "—";
              const clientName = quote.user?.fullName || "Client inconnu";
              const clientEmail = quote.user?.email || "";
              const isUpdating = updatingId === quote.id;

              return (
                <motion.div
                  key={quote.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  className="group glass rounded-2xl border border-border/40 hover:border-primary/20 transition-all duration-200 overflow-hidden"
                  data-testid={`admin-quote-row-${quote.id}`}
                >
                  <div className="p-5">
                    {/* Top row: client + status + date */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
                          <span className="text-sm font-700 text-primary">{clientName.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-600 text-sm leading-tight truncate">{clientName}</p>
                          {clientEmail && (
                            <p className="text-xs text-muted-foreground/70 truncate">{clientEmail}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-600 px-2.5 py-1 rounded-full border ${cfg.cls}`}>
                          <StatusIcon className="h-2.5 w-2.5" />
                          {cfg.label}
                        </span>
                        <span className="text-xs text-muted-foreground/60 font-mono">
                          #{quote.id}
                        </span>
                      </div>
                    </div>

                    {/* Info grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      <div className="rounded-xl bg-muted/30 border border-border/30 px-3 py-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <FileText className="h-3 w-3 text-muted-foreground/50" />
                          <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wide font-500">Service</span>
                        </div>
                        <p className="text-xs font-600 truncate">{serviceName}</p>
                      </div>

                      <div className="rounded-xl bg-muted/30 border border-border/30 px-3 py-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Maximize2 className="h-3 w-3 text-muted-foreground/50" />
                          <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wide font-500">Dimensions</span>
                        </div>
                        <p className="text-xs font-600 tabular-nums">
                          {quote.widthInput} × {quote.heightInput} {quote.unitInput}
                        </p>
                      </div>

                      <div className="rounded-xl bg-muted/30 border border-border/30 px-3 py-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Maximize2 className="h-3 w-3 text-muted-foreground/50" />
                          <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wide font-500">Surface</span>
                        </div>
                        <p className="text-xs font-600 tabular-nums">{quote.areaM2?.toFixed(2)} m²</p>
                      </div>

                      <div className="rounded-xl bg-primary/5 border border-primary/15 px-3 py-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <DollarSign className="h-3 w-3 text-primary/50" />
                          <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wide font-500">Estimé</span>
                        </div>
                        <p className="text-xs font-700 text-primary tabular-nums">
                          {quote.estimatedPrice
                            ? `${Number(quote.estimatedPrice).toLocaleString("fr-DZ")} DA`
                            : "—"}
                        </p>
                      </div>
                    </div>

                    {/* Note preview */}
                    {quote.note && (
                      <div className="flex items-start gap-2 mb-4 rounded-xl bg-muted/20 border border-border/30 px-3 py-2.5">
                        <MessageSquare className="h-3.5 w-3.5 text-muted-foreground/50 mt-0.5 shrink-0" />
                        <p className="text-xs text-muted-foreground line-clamp-2">{quote.note}</p>
                      </div>
                    )}

                    {/* Bottom row: date + file + actions */}
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
                          <Calendar className="h-3 w-3" />
                          {new Date(quote.createdAt).toLocaleDateString("fr-DZ", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                        {quote.fileUrl && (
                          <a
                            href={quote.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                          >
                            <Paperclip className="h-3 w-3" />
                            Fichier joint
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* quick actions — only for pending */}
                        {quote.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs px-2.5 gap-1.5 text-blue-400 border-blue-500/25 hover:bg-blue-500/10"
                              disabled={isUpdating}
                              onClick={() => handleQuickAction(quote.id, "responded")}
                            >
                              {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <MailOpen className="h-3 w-3" />}
                              Répondu
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs px-2.5 gap-1.5 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/10"
                              disabled={isUpdating}
                              onClick={() => handleQuickAction(quote.id, "accepted")}
                            >
                              {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                              Accepter
                            </Button>
                          </>
                        )}

                        <Button asChild size="sm" variant="outline" className="h-7 text-xs px-3 gap-1.5 opacity-70 group-hover:opacity-100">
                          <Link href={`/admin/quotes/${quote.id}`}>
                            Gérer
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
