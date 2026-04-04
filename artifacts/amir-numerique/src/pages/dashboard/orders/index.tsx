import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { useListOrders } from "@workspace/api-client-react";
import { useI18n } from "@/hooks/use-i18n";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  confirmed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  in_progress: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  printing: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  ready: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  delivered: "bg-green-500/10 text-green-500 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
};
const STATUS_LABELS: Record<string, string> = {
  pending: "En attente", confirmed: "Confirmée", in_progress: "En cours",
  printing: "Impression", ready: "Prête", delivered: "Livrée", cancelled: "Annulée",
};

export default function DashboardOrders() {
  const { t } = useI18n();
  const { data: result, isLoading } = useListOrders({});
  const orders = (result as any)?.orders || (Array.isArray(result) ? result : []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t("myOrders")}</h1>
          <Button asChild>
            <Link href="/dashboard/orders/new"><Plus className="h-4 w-4 mr-2" />{t("newOrder")}</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-lg font-semibold mb-2">Aucune commande</h3>
            <p className="text-muted-foreground mb-6">Passez votre première commande dès maintenant</p>
            <Button asChild>
              <Link href="/dashboard/orders/new"><Plus className="h-4 w-4 mr-2" />{t("newOrder")}</Link>
            </Button>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">N° Commande</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Date</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Surface</th>
                    <th className="text-right p-4 text-sm font-semibold text-muted-foreground">Prix total</th>
                    <th className="text-center p-4 text-sm font-semibold text-muted-foreground">Statut</th>
                    <th className="p-4" />
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order: any, i: number) => (
                    <motion.tr key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors" data-testid={`order-row-${order.id}`}>
                      <td className="p-4 font-mono text-sm">{order.orderNumber}</td>
                      <td className="p-4 text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("fr-DZ")}</td>
                      <td className="p-4 text-sm">{order.areaM2 ? `${order.areaM2.toFixed(2)} m²` : "—"}</td>
                      <td className="p-4 text-right font-semibold">{order.finalPrice ? `${order.finalPrice.toLocaleString()} DA` : order.displayedPrice ? `${order.displayedPrice.toLocaleString()} DA` : "—"}</td>
                      <td className="p-4 text-center">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full border ${STATUS_COLORS[order.orderStatus] || "bg-muted"}`}>
                          {STATUS_LABELS[order.orderStatus] || order.orderStatus}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/dashboard/orders/${order.id}`}>Voir</Link>
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
