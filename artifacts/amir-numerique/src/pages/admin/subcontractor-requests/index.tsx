import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useListSettings } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Handshake,
  User,
  Building2,
  Phone,
  MapPin,
  Layers,
  BarChart3,
  MessageSquare,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  RefreshCcw,
} from "lucide-react";

type Status = "pending" | "reviewed" | "accepted" | "refused";

interface SubcontractorRequest {
  id: number;
  fullName: string;
  companyName: string;
  phone: string;
  city: string;
  activityType: string;
  estimatedVolume: string;
  message?: string;
  status: Status;
  createdAt: string;
}

const statusConfig: Record<Status, { label: string; color: string; badge: string }> = {
  pending:  { label: "En attente",  color: "text-amber-400",   badge: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  reviewed: { label: "Examinée",    color: "text-sky-400",     badge: "bg-sky-500/15 text-sky-400 border-sky-500/30" },
  accepted: { label: "Acceptée",    color: "text-emerald-400", badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  refused:  { label: "Refusée",     color: "text-red-400",     badge: "bg-red-500/15 text-red-400 border-red-500/30" },
};

function openWhatsApp(req: SubcontractorRequest, phone: string) {
  const lines = [
    "🤝 *Demande de sous-traitance — Amir Numerique*",
    "",
    `👤 *Nom :* ${req.fullName}`,
    `🏢 *Société :* ${req.companyName}`,
    `📞 *Téléphone :* ${req.phone}`,
    `📍 *Ville :* ${req.city}`,
    `🏭 *Activité :* ${req.activityType}`,
    `📊 *Volume :* ${req.estimatedVolume}`,
    req.message ? `\n💬 *Message :*\n${req.message}` : "",
  ];
  const encoded = encodeURIComponent(lines.join("\n"));
  const number = phone.replace(/\D/g, "");
  window.open(`https://wa.me/${number}?text=${encoded}`, "_blank", "noopener,noreferrer");
}

export default function AdminSubcontractorRequests() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<Status | "all">("all");

  const { data: requests = [], isLoading } = useQuery<SubcontractorRequest[]>({
    queryKey: ["subcontractor-requests"],
    queryFn: async () => {
      const res = await fetch("/api/subcontractor-requests");
      if (!res.ok) throw new Error("Erreur serveur");
      return res.json();
    },
  });

  const { data: settingsRaw } = useListSettings();
  const whatsappNumber =
    (settingsRaw as any[])?.find((s: any) => s.key === "company_whatsapp")?.value ?? "213XXXXXXXXX";

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: Status }) => {
      const res = await fetch(`/api/subcontractor-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Erreur serveur");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcontractor-requests"] });
      toast({ title: "Statut mis à jour" });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de mettre à jour.", variant: "destructive" });
    },
  });

  const filtered = filterStatus === "all"
    ? requests
    : requests.filter((r) => r.status === filterStatus);

  const counts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    reviewed: requests.filter((r) => r.status === "reviewed").length,
    accepted: requests.filter((r) => r.status === "accepted").length,
    refused: requests.filter((r) => r.status === "refused").length,
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-7 h-7 rounded-lg bg-violet-500/15 border border-violet-500/30 flex items-center justify-center">
                <Handshake className="h-3.5 w-3.5 text-violet-400" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Demandes de sous-traitance</h1>
            </div>
            <p className="text-sm text-muted-foreground ml-9">
              {requests.length} demande{requests.length !== 1 ? "s" : ""} au total
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["subcontractor-requests"] })}
          >
            <RefreshCcw className="h-3.5 w-3.5 mr-2" />
            Rafraîchir
          </Button>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2">
          {(["all", "pending", "reviewed", "accepted", "refused"] as const).map((s) => {
            const cfg = s === "all"
              ? { label: "Toutes", badge: "bg-muted text-foreground" }
              : { label: statusConfig[s].label, badge: statusConfig[s].badge };
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  filterStatus === s
                    ? `${cfg.badge} border-current`
                    : "border-border/40 text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                {cfg.label}
                <span className="bg-background/50 rounded px-1">{counts[s]}</span>
              </button>
            );
          })}
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-card/50 border border-border/40 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Handshake className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>Aucune demande trouvée</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((req) => {
              const cfg = statusConfig[req.status];
              const isOpen = expandedId === req.id;
              return (
                <motion.div
                  key={req.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm"
                >
                  {/* Row header */}
                  <div className="flex items-center gap-4 p-4">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground">{req.fullName}</span>
                        <span className="text-muted-foreground text-sm">·</span>
                        <span className="text-sm text-muted-foreground">{req.companyName}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {req.city}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(req.createdAt).toLocaleDateString("fr-DZ", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-semibold ${cfg.badge}`}>
                        {cfg.label}
                      </span>
                      <button
                        onClick={() => setExpandedId(isOpen ? null : req.id)}
                        className="w-7 h-7 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-t border-border/40 px-4 py-5 space-y-4"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoRow icon={<Phone className="h-3.5 w-3.5" />} label="Téléphone" value={req.phone} />
                        <InfoRow icon={<MapPin className="h-3.5 w-3.5" />} label="Ville / Wilaya" value={req.city} />
                        <InfoRow icon={<Layers className="h-3.5 w-3.5" />} label="Activité" value={req.activityType} />
                        <InfoRow icon={<BarChart3 className="h-3.5 w-3.5" />} label="Volume estimé" value={req.estimatedVolume} />
                      </div>
                      {req.message && (
                        <div className="bg-muted/40 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                            <MessageSquare className="h-3.5 w-3.5" /> Message
                          </div>
                          <p className="text-sm text-foreground leading-relaxed">{req.message}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-border/30">
                        <ActionBtn
                          onClick={() => updateStatus.mutate({ id: req.id, status: "reviewed" })}
                          active={req.status === "reviewed"}
                          icon={<Eye className="h-3.5 w-3.5" />}
                          label="Examiner"
                          className="border-sky-500/40 text-sky-400 hover:bg-sky-500/10"
                        />
                        <ActionBtn
                          onClick={() => updateStatus.mutate({ id: req.id, status: "accepted" })}
                          active={req.status === "accepted"}
                          icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                          label="Accepter"
                          className="border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                        />
                        <ActionBtn
                          onClick={() => updateStatus.mutate({ id: req.id, status: "refused" })}
                          active={req.status === "refused"}
                          icon={<XCircle className="h-3.5 w-3.5" />}
                          label="Refuser"
                          className="border-red-500/40 text-red-400 hover:bg-red-500/10"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="ml-auto border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/10 h-8"
                          onClick={() => openWhatsApp(req, whatsappNumber)}
                        >
                          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 mr-1.5 fill-current">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                          </svg>
                          WhatsApp
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
        {icon} {label}
      </div>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function ActionBtn({
  onClick,
  active,
  icon,
  label,
  className,
}: {
  onClick: () => void;
  active: boolean;
  icon: React.ReactNode;
  label: string;
  className: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${className} ${
        active ? "ring-1 ring-current" : ""
      }`}
    >
      {icon} {label}
      {active && <CheckCircle2 className="h-3 w-3" />}
    </button>
  );
}
