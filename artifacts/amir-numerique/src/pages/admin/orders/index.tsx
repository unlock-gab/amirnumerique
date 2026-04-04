import { AdminLayout } from "@/components/layouts/admin-layout";
import { useListOrders } from "@workspace/api-client-react";
import { useI18n } from "@/hooks/use-i18n";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

export default function AdminOrders() {
  const { t } = useI18n();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { data: result, isLoading } = useListOrders({});
  const allOrders = (result as any)?.orders || (Array.isArray(result) ? result : []);
  const filtered = statusFilter === "all" ? allOrders : allOrders.filter((o: any) => o.orderStatus === statusFilter);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t("manageOrders")}</h1>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {Object.entries(STATUS_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-lg font-semibold mb-2">Aucune commande</h3>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">N°</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Client</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Date</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Surface</th>
                    <th className="text-right p-4 text-sm font-semibold text-muted-foreground">Prix</th>
                    <th className="text-center p-4 text-sm font-semibold text-muted-foreground">Statut</th>
                    <th className="p-4" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order: any) => (
                    <tr key={order.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors" data-testid={`admin-order-row-${order.id}`}>
                      <td className="p-4 font-mono text-sm">{order.orderNumber}</td>
                      <td className="p-4 text-sm">{order.user?.fullName || "—"}</td>
                      <td className="p-4 text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("fr-DZ")}</td>
                      <td className="p-4 text-sm">{order.areaM2 ? `${order.areaM2.toFixed(2)} m²` : "—"}</td>
                      <td className="p-4 text-right font-semibold text-sm">
                        {(order.finalPrice || order.displayedPrice) ? `${(order.finalPrice || order.displayedPrice).toLocaleString()} DA` : "—"}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full border ${STATUS_COLORS[order.orderStatus]}`}>
                          {STATUS_LABELS[order.orderStatus] || order.orderStatus}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/orders/${order.id}`}>Gérer</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
