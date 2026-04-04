import { AdminLayout } from "@/components/layouts/admin-layout";
import { useListOrders } from "@workspace/api-client-react";
import { useI18n } from "@/hooks/use-i18n";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingCart, Filter } from "lucide-react";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/25",
  confirmed: "bg-blue-500/10 text-blue-400 border-blue-500/25",
  in_progress: "bg-purple-500/10 text-purple-400 border-purple-500/25",
  printing: "bg-indigo-500/10 text-indigo-400 border-indigo-500/25",
  ready: "bg-cyan-500/10 text-cyan-400 border-cyan-500/25",
  delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/25",
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
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-700 tracking-tight">{t("manageOrders")}</h1>
            <p className="text-sm text-muted-foreground mt-1">{filtered.length} commande{filtered.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44 h-9 text-sm border-border/60">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {Object.entries(STATUS_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 rounded-2xl border border-border/50 bg-card/40">
            <ShoppingCart className="h-10 w-10 mx-auto mb-4 text-muted-foreground/20" />
            <h3 className="font-display font-600 text-lg mb-1">Aucune commande</h3>
            <p className="text-sm text-muted-foreground">Aucune commande ne correspond aux filtres sélectionnés</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/20">
                    <th className="text-left px-5 py-3.5 text-xs font-600 font-display uppercase tracking-wider text-muted-foreground">N° Commande</th>
                    <th className="text-left px-5 py-3.5 text-xs font-600 font-display uppercase tracking-wider text-muted-foreground">Client</th>
                    <th className="text-left px-5 py-3.5 text-xs font-600 font-display uppercase tracking-wider text-muted-foreground">Date</th>
                    <th className="text-left px-5 py-3.5 text-xs font-600 font-display uppercase tracking-wider text-muted-foreground">Surface</th>
                    <th className="text-right px-5 py-3.5 text-xs font-600 font-display uppercase tracking-wider text-muted-foreground">Montant</th>
                    <th className="text-center px-5 py-3.5 text-xs font-600 font-display uppercase tracking-wider text-muted-foreground">Statut</th>
                    <th className="px-5 py-3.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filtered.map((order: any) => (
                    <tr key={order.id} className="hover:bg-muted/15 transition-colors group" data-testid={`admin-order-row-${order.id}`}>
                      <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{order.orderNumber}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-bold text-primary">{order.user?.fullName?.charAt(0) || "?"}</span>
                          </div>
                          <span className="text-sm font-medium">{order.user?.fullName || "—"}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("fr-DZ")}</td>
                      <td className="px-5 py-4 text-sm tabular-nums">{order.areaM2 ? `${order.areaM2.toFixed(2)} m²` : "—"}</td>
                      <td className="px-5 py-4 text-right">
                        <span className="font-display font-600 text-sm tabular-nums">
                          {(order.finalPrice || order.displayedPrice) ? `${(order.finalPrice || order.displayedPrice).toLocaleString()} DA` : "—"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex items-center text-[11px] font-medium px-2.5 py-1 rounded-full border ${STATUS_COLORS[order.orderStatus] || "bg-muted text-muted-foreground border-border"}`}>
                          {STATUS_LABELS[order.orderStatus] || order.orderStatus}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Button asChild variant="ghost" size="sm" className="h-7 text-xs opacity-60 group-hover:opacity-100">
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
