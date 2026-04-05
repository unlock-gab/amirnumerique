import { AdminLayout } from "@/components/layouts/admin-layout";
import { useGetQuote, useUpdateQuoteStatus } from "@workspace/api-client-react";
import { useI18n } from "@/hooks/use-i18n";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  ArrowLeft, Loader2, User, Calendar, Maximize2, DollarSign,
  FileText, MessageSquare, Paperclip, CheckCircle, XCircle,
  Clock, MailOpen, RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { motion } from "framer-motion";

const STATUS_OPTIONS = [
  { value: "pending",            label: "En attente",   icon: Clock,        cls: "text-amber-400" },
  { value: "responded",          label: "Répondu",      icon: MailOpen,     cls: "text-blue-400" },
  { value: "accepted",           label: "Accepté",      icon: CheckCircle,  cls: "text-emerald-400" },
  { value: "refused",            label: "Refusé",       icon: XCircle,      cls: "text-red-400" },
  { value: "converted_to_order", label: "Converti",     icon: RefreshCw,    cls: "text-violet-400" },
];

const STATUS_BADGE: Record<string, string> = {
  pending:            "bg-amber-500/10 text-amber-400 border-amber-500/25",
  responded:          "bg-blue-500/10 text-blue-400 border-blue-500/25",
  accepted:           "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
  refused:            "bg-red-500/10 text-red-400 border-red-500/25",
  converted_to_order: "bg-violet-500/10 text-violet-400 border-violet-500/25",
};

export default function AdminQuoteDetail() {
  const { t } = useI18n();
  const { toast } = useToast();
  const params = useParams<{ id: string }>();
  const id = params?.id ? parseInt(params.id) : 0;

  const { data: quote, isLoading, refetch } = useGetQuote(id, { query: { enabled: !!id } });
  const updateQuote = useUpdateQuoteStatus();

  const [status, setStatus] = useState("");
  const [adminResponse, setAdminResponse] = useState("");
  const [initialized, setInitialized] = useState(false);

  if (quote && !initialized) {
    setStatus(quote.status);
    setAdminResponse((quote as any).adminResponse || "");
    setInitialized(true);
  }

  const handleSave = () => {
    if (!id) return;
    updateQuote.mutate(
      { id, data: { status: status as any, adminResponse: adminResponse || undefined } },
      {
        onSuccess: () => { toast({ title: "Devis mis à jour" }); refetch(); },
        onError: () => toast({ title: "Erreur", variant: "destructive" }),
      }
    );
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!quote) {
    return (
      <AdminLayout>
        <div className="text-center py-24">
          <p className="text-muted-foreground mb-4">Devis introuvable</p>
          <Button asChild variant="outline">
            <Link href="/admin/quotes">
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux devis
            </Link>
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const currentStatusCfg = STATUS_OPTIONS.find((o) => o.value === quote.status);
  const clientName = (quote as any).user?.fullName || "—";
  const clientEmail = (quote as any).user?.email || "—";
  const serviceName = (quote as any).service?.nameFr || "—";

  return (
    <AdminLayout>
      <div className="max-w-3xl">
        <Button variant="ghost" size="sm" asChild className="mb-6 text-muted-foreground hover:text-foreground">
          <Link href="/admin/quotes">
            <ArrowLeft className="mr-2 h-4 w-4" /> {t("manageQuotes")}
          </Link>
        </Button>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-display text-2xl font-700 tracking-tight">
                Devis <span className="text-primary font-mono">#{quote.id}</span>
              </h1>
              {currentStatusCfg && (
                <span className={`inline-flex items-center gap-1.5 text-[11px] font-600 px-2.5 py-1 rounded-full border ${STATUS_BADGE[quote.status] || ""}`}>
                  <currentStatusCfg.icon className="h-2.5 w-2.5" />
                  {currentStatusCfg.label}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Soumis le {new Date(quote.createdAt).toLocaleDateString("fr-DZ", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left column — quote details */}
          <div className="lg:col-span-2 space-y-5">
            {/* Client info */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-5"
            >
              <h2 className="font-display font-600 text-sm mb-4 flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" /> Client
              </h2>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
                  <span className="font-700 text-sm text-primary">{clientName.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="font-600 text-sm">{clientName}</p>
                  <p className="text-xs text-muted-foreground">{clientEmail}</p>
                </div>
              </div>
            </motion.div>

            {/* Quote details */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="glass rounded-2xl p-5"
            >
              <h2 className="font-display font-600 text-sm mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" /> Détails de la demande
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Service", value: serviceName, icon: FileText },
                  { label: "Dimensions", value: `${quote.widthInput} × ${quote.heightInput} ${quote.unitInput}`, icon: Maximize2 },
                  { label: "Surface", value: `${quote.areaM2.toFixed(2)} m²`, icon: Maximize2 },
                  { label: "Date", value: new Date(quote.createdAt).toLocaleDateString("fr-DZ"), icon: Calendar },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="rounded-xl bg-muted/30 border border-border/30 px-3 py-2.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className="h-3 w-3 text-muted-foreground/50" />
                      <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wide font-500">{label}</span>
                    </div>
                    <p className="text-sm font-600">{value}</p>
                  </div>
                ))}

                {/* Estimated price — full width */}
                <div className="col-span-2 rounded-xl bg-primary/5 border border-primary/20 px-3 py-2.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <DollarSign className="h-3 w-3 text-primary/50" />
                    <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wide font-500">Prix estimé</span>
                  </div>
                  <p className="text-xl font-display font-800 text-primary tabular-nums">
                    {quote.estimatedPrice
                      ? `${Number(quote.estimatedPrice).toLocaleString("fr-DZ")} DA`
                      : "—"}
                  </p>
                </div>
              </div>

              {quote.note && (
                <div className="mt-3 rounded-xl bg-muted/20 border border-border/30 px-3 py-2.5">
                  <div className="flex items-center gap-1.5 mb-2">
                    <MessageSquare className="h-3 w-3 text-muted-foreground/50" />
                    <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wide font-500">Note du client</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{quote.note}</p>
                </div>
              )}

              {(quote as any).fileUrl && (
                <div className="mt-3">
                  <a
                    href={(quote as any).fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Paperclip className="h-3.5 w-3.5" />
                    Télécharger le fichier joint
                  </a>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right column — admin response */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-5 space-y-5 h-fit"
          >
            <h2 className="font-display font-600 text-sm flex items-center gap-2">
              <MailOpen className="h-4 w-4 text-muted-foreground" /> Répondre
            </h2>

            {/* Status select */}
            <div>
              <label className="text-xs text-muted-foreground font-500 uppercase tracking-wide block mb-2">Statut</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-10" data-testid="select-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      <span className={`flex items-center gap-2 ${o.cls}`}>
                        <o.icon className="h-3.5 w-3.5" />
                        {o.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Admin response */}
            <div>
              <label className="text-xs text-muted-foreground font-500 uppercase tracking-wide block mb-2">
                Réponse au client
              </label>
              <Textarea
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                rows={5}
                placeholder="Détails du devis, délai de production, conditions..."
                className="resize-none text-sm"
                data-testid="textarea-admin-response"
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={updateQuote.isPending}
              className="w-full gap-2 btn-premium"
              data-testid="button-save-quote"
            >
              {updateQuote.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Sauvegarde...</>
              ) : (
                <><CheckCircle className="h-4 w-4" /> Enregistrer la réponse</>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
}
