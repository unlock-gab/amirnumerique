import { AdminLayout } from "@/components/layouts/admin-layout";
import { useListOrders } from "@workspace/api-client-react";
import { useI18n } from "@/hooks/use-i18n";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ShoppingCart, Search, X } from "lucide-react";
import { useState, useMemo } from "react";

const STATUS_COLORS: Record<string, string> = {
  pending:    "bg-amber-500/10 text-amber-400 border-amber-500/25",
  confirmed:  "bg-blue-500/10 text-blue-400 border-blue-500/25",
  in_progress:"bg-purple-500/10 text-purple-400 border-purple-500/25",
  printing:   "bg-indigo-500/10 text-indigo-400 border-indigo-500/25",
  ready:      "bg-cyan-500/10 text-cyan-400 border-cyan-500/25",
  delivered:  "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
  cancelled:  "bg-red-500/10 text-red-400 border-red-500/25",
};
const STATUS_LABELS: Record<string, string> = {
  pending: "En attente", confirmed: "Confirmée", in_progress: "En cours",
  printing: "Impression", ready: "Prête", delivered: "Livrée", cancelled: "Annulée",
};
const PAYMENT_LABELS: Record<string, string> = {
  pending_on_delivery: "À la livraison",
  paid: "Payé",
  cancelled: "Annulé",
};

export default function AdminOrders() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const { data: result, isLoading } = useListOrders({});
  const allOrders = (result as any)?.orders || (Array.isArray(result) ? result : []);

  const filtered = useMemo(() => {
    let list = allOrders;
    if (statusFilter !== "all") list = list.filter((o: any) => o.orderStatus === statusFilter);
    if (paymentFilter !== "all") list = list.filter((o: any) => o.paymentStatus === paymentFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((o: any) =>
        o.orderNumber?.toLowerCase().includes(q) ||
        o.user?.fullName?.toLowerCase().includes(q) ||
        o.user?.email?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allOrders, search, statusFilter, paymentFilter]);

  const hasFilters = search || statusFilter !== "all" || paymentFilter !== "all";
  const resetFilters = () => { setSearch(""); setStatusFilter("all"); setPaymentFilter("all"); };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-2xl font-700 tracking-tight">{t("manageOrders")}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {filtered.length} commande{filtered.length !== 1 ? "s" : ""}
              {hasFilters && <span className="ml-1 text-primary"> (filtrées)</span>}
            </p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
            <Input
              placeholder="N° commande ou client…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="orders-search"
              className="pl-9 h-9 text-sm border-border/60"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 h-9 text-sm border-border/60" data-testid="orders-status-filter">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {Object.entries(STATUS_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-44 h-9 text-sm border-border/60" data-testid="orders-payment-filter">
              <SelectValue placeholder="Paiement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tout paiement</SelectItem>
              {Object.entries(PAYMENT_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="h-9 text-muted-foreground hover:text-foreground gap-1.5">
              <X className="h-3.5 w-3.5" /> Réinitialiser
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 rounded-2xl border border-border/50 bg-card/40">
            <ShoppingCart className="h-10 w-10 mx-auto mb-4 text-muted-foreground/20" />
            <h3 className="font-display font-600 text-lg mb-1">Aucune commande</h3>
            <p className="text-sm text-muted-foreground mb-4">Aucune commande ne correspond à vos critères</p>
            {hasFilters && <Button variant="outline" size="sm" onClick={resetFilters}>Effacer les filtres</Button>}
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
                    <th className="text-center px-5 py-3.5 text-xs font-600 font-display uppercase tracking-wider text-muted-foreground">Paiement</th>
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
                        <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground border border-border/40">
                          {PAYMENT_LABELS[order.paymentStatus] || order.paymentStatus || "—"}
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
