import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { useGetOrder } from "@workspace/api-client-react";
import { useI18n } from "@/hooks/use-i18n";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Loader2 } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  confirmed: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  in_progress: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  printing: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  ready: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  delivered: "bg-green-500/10 text-green-600 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
};
const STATUS_LABELS: Record<string, string> = {
  pending: "En attente", confirmed: "Confirmée", in_progress: "En cours",
  printing: "En impression", ready: "Prête", delivered: "Livrée", cancelled: "Annulée",
};
const STATUS_STEPS = ["pending", "confirmed", "in_progress", "printing", "ready", "delivered"];

export default function OrderDetail() {
  const { t } = useI18n();
  const [, params] = useRoute("/dashboard/orders/:id");
  const id = params?.id ? parseInt(params.id) : 0;
  const { data: order, isLoading } = useGetOrder(id, { query: { enabled: !!id } });

  if (isLoading) {
    return <DashboardLayout><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></DashboardLayout>;
  }

  if (!order) {
    return <DashboardLayout><div className="text-center py-20"><p>Commande introuvable</p><Button asChild className="mt-4"><Link href="/dashboard/orders">Retour</Link></Button></div></DashboardLayout>;
  }

  const stepIndex = STATUS_STEPS.indexOf(order.orderStatus);

  return (
    <DashboardLayout>
      <div className="max-w-2xl">
        <Button variant="ghost" size="sm" asChild className="mb-6 text-muted-foreground">
          <Link href="/dashboard/orders"><ArrowLeft className="mr-2 h-4 w-4" />{t("myOrders")}</Link>
        </Button>

        <div className="flex items-start justify-between mb-8">
          <h1 className="text-2xl font-bold">Commande #{order.orderNumber}</h1>
          <span className={`text-sm font-medium px-3 py-1.5 rounded-full border ${STATUS_COLORS[order.orderStatus] || "bg-muted"}`}>
            {STATUS_LABELS[order.orderStatus] || order.orderStatus}
          </span>
        </div>

        {/* Progress stepper */}
        {order.orderStatus !== "cancelled" && (
          <div className="mb-8 p-5 bg-card border border-border rounded-xl">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-4 left-4 right-4 h-0.5 bg-border z-0" />
              <div
                className="absolute top-4 left-4 h-0.5 bg-primary z-0 transition-all duration-500"
                style={{ width: `${Math.max(0, (stepIndex / (STATUS_STEPS.length - 1))) * 92}%` }}
              />
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className="flex flex-col items-center gap-2 z-10">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors
                    ${i <= stepIndex ? "bg-primary border-primary text-primary-foreground" : "bg-background border-border text-muted-foreground"}`}>
                    {i + 1}
                  </div>
                  <span className="text-xs text-muted-foreground hidden sm:block text-center">{STATUS_LABELS[step]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-card border border-border rounded-xl divide-y divide-border">
          {[
            { label: "Date", value: new Date(order.createdAt).toLocaleString("fr-DZ") },
            { label: t("width"), value: `${order.widthInput} ${order.unitInput}` },
            { label: t("height"), value: `${order.heightInput} ${order.unitInput}` },
            { label: t("area"), value: `${order.areaM2.toFixed(2)} m²` },
            { label: "Prix unitaire", value: `${order.unitPricePerM2.toLocaleString()} DA/m²` },
            { label: t("totalPrice"), value: `${(order.finalPrice || order.displayedPrice).toLocaleString()} DA` },
            { label: "Paiement", value: order.paymentStatus === "paid" ? "Payé" : order.paymentStatus === "pending_on_delivery" ? "À la livraison" : order.paymentStatus },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center p-4">
              <span className="text-sm text-muted-foreground">{label}</span>
              <span className="font-medium text-sm">{value}</span>
            </div>
          ))}
          {order.note && (
            <div className="p-4">
              <span className="text-sm text-muted-foreground block mb-1">{t("note")}</span>
              <p className="text-sm">{order.note}</p>
            </div>
          )}
        </div>

        {order.fileUrl && (
          <div className="mt-4 p-4 bg-card border border-border rounded-xl">
            <span className="text-sm text-muted-foreground block mb-2">Fichier d'impression</span>
            <a href={order.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm font-medium">
              Télécharger le fichier
            </a>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
