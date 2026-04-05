import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { useGetOrder } from "@workspace/api-client-react";
import { useI18n } from "@/hooks/use-i18n";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Loader2 } from "lucide-react";
import { OrderTimeline } from "@/components/order-timeline";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  confirmed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  in_progress: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  printing: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  ready: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};
const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  in_progress: "En préparation",
  printing: "En impression",
  ready: "Prête",
  delivered: "Livrée",
  cancelled: "Annulée",
};

export default function OrderDetail() {
  const { t } = useI18n();
  const [, params] = useRoute("/dashboard/orders/:id");
  const id = params?.id ? parseInt(params.id) : 0;
  const { data: order, isLoading } = useGetOrder(id, { query: { enabled: !!id } });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!order) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground mb-4">Commande introuvable</p>
          <Button asChild><Link href="/dashboard/orders">Retour</Link></Button>
        </div>
      </DashboardLayout>
    );
  }

  const statusLabel = STATUS_LABELS[order.orderStatus] || order.orderStatus;
  const statusColor = STATUS_COLORS[order.orderStatus] || "bg-muted text-muted-foreground border-border";

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-6">
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground -ml-2">
          <Link href="/dashboard/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />{t("myOrders")}
          </Link>
        </Button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Commande #{order.orderNumber}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date(order.createdAt).toLocaleDateString("fr-DZ", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border flex-shrink-0 ${statusColor}`}>
            {statusLabel}
          </span>
        </div>

        <OrderTimeline orderId={order.id} currentStatus={order.orderStatus} />

        <div className="bg-card border border-border rounded-xl divide-y divide-border">
          {[
            { label: t("width"), value: `${order.widthInput} ${order.unitInput}` },
            { label: t("height"), value: `${order.heightInput} ${order.unitInput}` },
            { label: t("area"), value: `${order.areaM2.toFixed(2)} m²` },
            { label: "Prix unitaire", value: `${order.unitPricePerM2.toLocaleString()} DA/m²` },
            { label: t("totalPrice"), value: `${(order.finalPrice || order.displayedPrice).toLocaleString()} DA` },
            {
              label: "Paiement",
              value: order.paymentStatus === "paid"
                ? "Payé"
                : order.paymentStatus === "pending_on_delivery"
                ? "À la livraison"
                : order.paymentStatus,
            },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center px-4 py-3.5">
              <span className="text-sm text-muted-foreground">{label}</span>
              <span className="font-medium text-sm">{value}</span>
            </div>
          ))}
          {order.note && (
            <div className="px-4 py-3.5">
              <span className="text-sm text-muted-foreground block mb-1">{t("note")}</span>
              <p className="text-sm leading-relaxed">{order.note}</p>
            </div>
          )}
        </div>

        {order.fileUrl && (
          <div className="p-4 bg-card border border-border rounded-xl flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Fichier d'impression</span>
            <a
              href={order.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline text-sm font-medium"
            >
              Télécharger
            </a>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
