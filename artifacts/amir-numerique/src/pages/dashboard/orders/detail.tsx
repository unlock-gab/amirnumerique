import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { useGetOrder } from "@workspace/api-client-react";
import { useI18n } from "@/hooks/use-i18n";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  ArrowLeft, Loader2, Ruler, Package2, CreditCard,
  FileText, Download, CalendarDays, Layers
} from "lucide-react";
import { OrderTimeline } from "@/components/order-timeline";

const STATUS_COLORS: Record<string, string> = {
  pending:     "bg-amber-500/10 text-amber-400 border-amber-500/25",
  confirmed:   "bg-blue-500/10 text-blue-400 border-blue-500/25",
  in_progress: "bg-violet-500/10 text-violet-400 border-violet-500/25",
  printing:    "bg-indigo-500/10 text-indigo-400 border-indigo-500/25",
  ready:       "bg-cyan-500/10 text-cyan-400 border-cyan-500/25",
  delivered:   "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
  cancelled:   "bg-red-500/10 text-red-400 border-red-500/25",
};
const STATUS_LABELS: Record<string, string> = {
  pending:     "En attente",
  confirmed:   "Confirmée",
  in_progress: "En préparation",
  printing:    "En impression",
  ready:       "Prête",
  delivered:   "Livrée",
  cancelled:   "Annulée",
};
const PAYMENT_LABELS: Record<string, { label: string; color: string }> = {
  pending_on_delivery: { label: "À la livraison", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  paid:                { label: "Payé",           color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  cancelled:           { label: "Annulé",         color: "bg-red-500/10 text-red-400 border-red-500/20" },
};

function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[hsl(222,30%,8%)] overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/[0.06]">
        <Icon className="h-4 w-4 text-primary" strokeWidth={2} />
        <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wide">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function DataRow({ label, value, highlight }: { label: string; value: React.ReactNode; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center px-5 py-3.5 border-b border-white/[0.04] last:border-0">
      <span className="text-sm text-white/45">{label}</span>
      <span className={`text-sm font-medium ${highlight ? "text-primary font-semibold" : "text-white/80"}`}>{value}</span>
    </div>
  );
}

export default function OrderDetail() {
  const { t } = useI18n();
  const [, params] = useRoute("/dashboard/orders/:id");
  const id = params?.id ? parseInt(params.id) : 0;
  const { data: order, isLoading } = useGetOrder(id, { query: { enabled: !!id } });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-24">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!order) {
    return (
      <DashboardLayout>
        <div className="text-center py-24">
          <p className="text-white/40 mb-4">Commande introuvable</p>
          <Button asChild><Link href="/dashboard/orders">Retour aux commandes</Link></Button>
        </div>
      </DashboardLayout>
    );
  }

  const o = order as any;
  const service = o.service;
  const category = o.category;
  const statusLabel = STATUS_LABELS[order.orderStatus] || order.orderStatus;
  const statusColor = STATUS_COLORS[order.orderStatus] || "bg-muted text-muted-foreground border-border";
  const payment = PAYMENT_LABELS[order.paymentStatus] || { label: order.paymentStatus, color: "bg-muted/20 text-muted-foreground border-border" };

  const widthM = order.widthM.toFixed(2);
  const heightM = order.heightM.toFixed(2);
  const totalPrice = (order.finalPrice || order.displayedPrice).toLocaleString("fr-DZ");

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6">

        <Button variant="ghost" size="sm" asChild className="text-white/40 hover:text-white/70 -ml-2">
          <Link href="/dashboard/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />{t("myOrders")}
          </Link>
        </Button>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{order.orderNumber}</h1>
            {service && (
              <p className="text-sm text-white/40 mt-1 flex items-center gap-2">
                {service.nameFr}
                {category && <><span className="text-white/20">·</span><span>{category.nameFr}</span></>}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${statusColor}`}>
              {statusLabel}
            </span>
            <span className="text-xs text-white/30 flex items-center gap-1.5">
              <CalendarDays className="h-3 w-3" />
              {new Date(order.createdAt).toLocaleDateString("fr-DZ", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>
        </div>

        <OrderTimeline orderId={order.id} currentStatus={order.orderStatus} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SectionCard title="Détails de la commande" icon={Ruler}>
            {service && <DataRow label="Service" value={service.nameFr} />}
            {category && <DataRow label="Catégorie" value={category.nameFr} />}
            <DataRow
              label="Dimensions saisies"
              value={`${order.widthInput} × ${order.heightInput} ${order.unitInput}`}
            />
            <DataRow
              label="Dimensions (mètres)"
              value={`${widthM} × ${heightM} m`}
            />
            <DataRow label="Surface" value={`${order.areaM2.toFixed(2)} m²`} />
            <DataRow label="Prix unitaire" value={`${order.unitPricePerM2.toLocaleString()} DA/m²`} />
          </SectionCard>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/[0.07] bg-[hsl(222,30%,8%)] overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/[0.06]">
                <Package2 className="h-4 w-4 text-primary" strokeWidth={2} />
                <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wide">Montant total</h2>
              </div>
              <div className="px-5 py-6 text-center">
                <p className="text-4xl font-bold text-white tracking-tight">{totalPrice}</p>
                <p className="text-sm text-white/35 mt-1">Dinars algériens (DA)</p>
              </div>
              <div className="border-t border-white/[0.05] divide-y divide-white/[0.04]">
                <DataRow label="Surface totale" value={`${order.areaM2.toFixed(2)} m²`} />
                <DataRow label="Prix au m²" value={`${order.unitPricePerM2.toLocaleString()} DA`} />
              </div>
            </div>

            <SectionCard title="Paiement" icon={CreditCard}>
              <DataRow label="Méthode" value="Paiement à la livraison" />
              <DataRow
                label="Statut"
                value={
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${payment.color}`}>
                    {payment.label}
                  </span>
                }
              />
            </SectionCard>
          </div>
        </div>

        {order.note && (
          <SectionCard title="Votre message" icon={FileText}>
            <div className="px-5 py-4">
              <p className="text-sm text-white/60 leading-relaxed">{order.note}</p>
            </div>
          </SectionCard>
        )}

        {order.fileUrl && (
          <div className="rounded-2xl border border-white/[0.07] bg-[hsl(222,30%,8%)] p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white/80">Fichier d'impression</p>
                <p className="text-xs text-white/35 truncate max-w-[200px]">
                  {order.fileUrl.split("/").pop() || "Fichier joint"}
                </p>
              </div>
            </div>
            <a
              href={order.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-medium text-primary border border-primary/30 bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-xl transition-colors flex-shrink-0"
            >
              <Download className="h-4 w-4" />
              Télécharger
            </a>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
