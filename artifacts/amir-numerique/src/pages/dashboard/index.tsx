import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { useGetMe, useGetClientStats, useListOrders, useListQuotes } from "@workspace/api-client-react";
import { useI18n } from "@/hooks/use-i18n";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ShoppingCart, FileText, Plus, TrendingUp, Clock } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente", confirmed: "Confirmée", in_progress: "En cours",
  printing: "Impression", ready: "Prête", delivered: "Livrée", cancelled: "Annulée",
};
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  confirmed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  in_progress: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  printing: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  ready: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  delivered: "bg-green-500/10 text-green-500 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
};

export default function Dashboard() {
  const { t } = useI18n();
  const { data: user } = useGetMe();
  const { data: stats } = useGetClientStats();
  const { data: ordersResult } = useListOrders({});
  const { data: quotesResult } = useListQuotes({});

  const orders = (ordersResult as any)?.orders || (Array.isArray(ordersResult) ? ordersResult : []);
  const quotes = (quotesResult as any)?.quotes || (Array.isArray(quotesResult) ? quotesResult : []);

  const statCards = [
    { label: t("myOrders"), value: stats?.totalOrders ?? orders.length, icon: ShoppingCart, color: "text-blue-500", bg: "bg-blue-500/10", href: "/dashboard/orders" },
    { label: "En attente", value: stats?.pendingOrders ?? 0, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", href: "/dashboard/orders" },
    { label: t("myQuotes"), value: quotes.length, icon: FileText, color: "text-purple-500", bg: "bg-purple-500/10", href: "/dashboard/quotes" },
    { label: "Total dépensé", value: stats?.totalSpent ? `${stats.totalSpent.toLocaleString()} DA` : "0 DA", icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10", href: "/dashboard/orders" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{t("dashboard")}</h1>
            <p className="text-muted-foreground">Bienvenue, {user?.fullName}</p>
          </div>
          <div className="flex gap-3">
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/quotes/new"><Plus className="h-4 w-4 mr-2" />{t("newQuote")}</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/dashboard/orders/new"><Plus className="h-4 w-4 mr-2" />{t("newOrder")}</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Link href={stat.href} className="block group">
                <div className="bg-card border border-border rounded-xl p-5 group-hover:border-primary/50 group-hover:shadow-md transition-all">
                  <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-semibold">{t("myOrders")}</h2>
              <Button asChild variant="ghost" size="sm"><Link href="/dashboard/orders">Voir tout</Link></Button>
            </div>
            <div className="divide-y divide-border">
              {orders.slice(0, 5).map((order: any) => (
                <Link key={order.id} href={`/dashboard/orders/${order.id}`} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                  <div>
                    <div className="font-medium text-sm">{order.orderNumber}</div>
                    <div className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("fr-DZ")}</div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full border ${STATUS_COLORS[order.orderStatus] || "bg-muted"}`}>
                    {STATUS_LABELS[order.orderStatus] || order.orderStatus}
                  </span>
                </Link>
              ))}
              {orders.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  Aucune commande
                </div>
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-semibold">{t("myQuotes")}</h2>
              <Button asChild variant="ghost" size="sm"><Link href="/dashboard/quotes">Voir tout</Link></Button>
            </div>
            <div className="divide-y divide-border">
              {quotes.slice(0, 5).map((quote: any) => (
                <Link key={quote.id} href={`/dashboard/quotes/${quote.id}`} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                  <div>
                    <div className="font-medium text-sm">#{quote.id}</div>
                    <div className="text-xs text-muted-foreground">{new Date(quote.createdAt).toLocaleDateString("fr-DZ")}</div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full border ${STATUS_COLORS[quote.status] || "bg-muted"}`}>
                    {STATUS_LABELS[quote.status] || quote.status}
                  </span>
                </Link>
              ))}
              {quotes.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  Aucun devis
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
