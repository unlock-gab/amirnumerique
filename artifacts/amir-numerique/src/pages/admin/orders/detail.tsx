import { AdminLayout } from "@/components/layouts/admin-layout";
import { useGetOrder, useUpdateOrderStatus } from "@workspace/api-client-react";
import { useI18n } from "@/hooks/use-i18n";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const STATUS_OPTIONS = [
  { value: "pending", label: "En attente" },
  { value: "confirmed", label: "Confirmée" },
  { value: "in_progress", label: "En cours" },
  { value: "printing", label: "En impression" },
  { value: "ready", label: "Prête" },
  { value: "delivered", label: "Livrée" },
  { value: "cancelled", label: "Annulée" },
];
const PAYMENT_OPTIONS = [
  { value: "pending_on_delivery", label: "À la livraison" },
  { value: "paid", label: "Payé" },
  { value: "cancelled", label: "Annulé" },
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

  if (order && !initialized) {
    setOrderStatus(order.orderStatus);
    setPaymentStatus(order.paymentStatus);
    setInitialized(true);
  }

  const handleSave = () => {
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
      },
      onError: () => toast({ title: "Erreur", variant: "destructive" }),
    });
  };

  if (isLoading) {
    return <AdminLayout><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AdminLayout>;
  }

  if (!order) {
    return <AdminLayout><div className="text-center py-20"><Button asChild><Link href="/admin/orders">Retour</Link></Button></div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl">
        <Button variant="ghost" size="sm" asChild className="mb-6 text-muted-foreground">
          <Link href="/admin/orders"><ArrowLeft className="mr-2 h-4 w-4" />{t("manageOrders")}</Link>
        </Button>

        <h1 className="text-2xl font-bold mb-8">Commande {order.orderNumber}</h1>

        <div className="bg-card border border-border rounded-xl divide-y divide-border mb-6">
          {[
            { label: "Client", value: (order as any).user?.fullName || "—" },
            { label: "Email", value: (order as any).user?.email || "—" },
            { label: "Date", value: new Date(order.createdAt).toLocaleString("fr-DZ") },
            { label: "Dimensions", value: `${order.widthInput} × ${order.heightInput} ${order.unitInput}` },
            { label: "Surface (m²)", value: `${order.areaM2.toFixed(2)} m²` },
            { label: "Prix unitaire", value: `${order.unitPricePerM2.toLocaleString()} DA/m²` },
            { label: "Prix affiché", value: `${order.displayedPrice.toLocaleString()} DA` },
            { label: "Prix final", value: order.finalPrice ? `${order.finalPrice.toLocaleString()} DA` : "—" },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center p-4">
              <span className="text-sm text-muted-foreground">{label}</span>
              <span className="font-medium text-sm">{value}</span>
            </div>
          ))}
          {order.note && (
            <div className="p-4">
              <span className="text-sm text-muted-foreground block mb-1">Note client</span>
              <p className="text-sm">{order.note}</p>
            </div>
          )}
          {order.fileUrl && (
            <div className="p-4">
              <span className="text-sm text-muted-foreground block mb-1">Fichier</span>
              <a href={order.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">Télécharger</a>
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
                {STATUS_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Statut du paiement</label>
            <Select value={paymentStatus} onValueChange={setPaymentStatus}>
              <SelectTrigger data-testid="select-payment"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PAYMENT_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSave} disabled={updateOrder.isPending} data-testid="button-save-order">
            {updateOrder.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sauvegarde...</> : "Enregistrer les modifications"}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
