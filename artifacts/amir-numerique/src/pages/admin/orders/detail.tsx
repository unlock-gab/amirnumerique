import { AdminLayout } from "@/components/layouts/admin-layout";
import { useGetOrder, useUpdateOrderStatus } from "@workspace/api-client-react";
import { useI18n } from "@/hooks/use-i18n";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useCallback } from "react";
import { OrderTimeline } from "@/components/order-timeline";

const STATUS_OPTIONS = [
  { value: "pending",     label: "En attente" },
  { value: "confirmed",   label: "Confirmée" },
  { value: "in_progress", label: "En préparation" },
  { value: "printing",    label: "En impression" },
  { value: "ready",       label: "Prête" },
  { value: "delivered",   label: "Livrée" },
  { value: "cancelled",   label: "Annulée" },
];
const PAYMENT_OPTIONS = [
  { value: "pending_on_delivery", label: "À la livraison" },
  { value: "paid",                label: "Payé" },
  { value: "cancelled",           label: "Annulé" },
];

export default function AdminOrderDetail() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [, params] = useRoute("/admin/orders/:id");
  const id = params?.id ? parseInt(params.id) : 0;
  const { data: order, isLoading, refetch } = useGetOrder(id, { query: { enabled: !!id } });
  const updateOrder = useUpdateOrderStatus();
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [timelineKey, setTimelineKey] = useState(0);

  if (order && !initialized) {
    setOrderStatus(order.orderStatus);
    setPaymentStatus(order.paymentStatus);
    setInitialized(true);
  }

  const handleSave = useCallback(() => {
    if (!id) return;
    updateOrder.mutate({
      id,
      data: {
        orderStatus: orderStatus as any,
        paymentStatus: paymentStatus as any,
      },
    }, {
      onSuccess: () => {
        toast({ title: "Commande mise à jour" });
        refetch();
        setTimelineKey(k => k + 1);
      },
      onError: () => toast({ title: "Erreur", variant: "destructive" }),
    });
  }, [id, orderStatus, paymentStatus, updateOrder, refetch, toast]);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="text-center py-20">
          <Button asChild><Link href="/admin/orders">Retour</Link></Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl space-y-6">
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground -ml-2">
          <Link href="/admin/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />{t("manageOrders")}
          </Link>
        </Button>

        <div>
          <h1 className="text-2xl font-bold">Commande {order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {(order as any).user?.fullName || "—"} · {(order as any).user?.email || "—"}
          </p>
        </div>

        <OrderTimeline
          key={timelineKey}
          orderId={order.id}
          currentStatus={orderStatus || order.orderStatus}
        />

        <div className="bg-card border border-border rounded-xl divide-y divide-border">
          {[
            { label: "Date",           value: new Date(order.createdAt).toLocaleString("fr-DZ") },
            { label: "Dimensions",     value: `${order.widthInput} × ${order.heightInput} ${order.unitInput}` },
            { label: "Surface (m²)",   value: `${order.areaM2.toFixed(2)} m²` },
            { label: "Prix unitaire",  value: `${order.unitPricePerM2.toLocaleString()} DA/m²` },
            { label: "Prix affiché",   value: `${order.displayedPrice.toLocaleString()} DA` },
            { label: "Prix final",     value: order.finalPrice ? `${order.finalPrice.toLocaleString()} DA` : "—" },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center px-4 py-3.5">
              <span className="text-sm text-muted-foreground">{label}</span>
              <span className="font-medium text-sm">{value}</span>
            </div>
          ))}
          {order.note && (
            <div className="px-4 py-3.5">
              <span className="text-sm text-muted-foreground block mb-1">Note client</span>
              <p className="text-sm leading-relaxed">{order.note}</p>
            </div>
          )}
          {order.fileUrl && (
            <div className="px-4 py-3.5 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Fichier</span>
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

        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <h2 className="font-semibold">Gérer la commande</h2>

          <div>
            <label className="text-sm font-medium block mb-1.5">Statut de la commande</label>
            <Select value={orderStatus} onValueChange={setOrderStatus}>
              <SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Statut du paiement</label>
            <Select value={paymentStatus} onValueChange={setPaymentStatus}>
              <SelectTrigger data-testid="select-payment"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PAYMENT_OPTIONS.map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSave}
            disabled={updateOrder.isPending}
            data-testid="button-save-order"
            className="w-full sm:w-auto"
          >
            {updateOrder.isPending
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sauvegarde...</>
              : "Enregistrer les modifications"}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
