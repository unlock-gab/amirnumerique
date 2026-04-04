import { AdminLayout } from "@/components/layouts/admin-layout";
import { useGetDashboardStats } from "@workspace/api-client-react";
import { useI18n } from "@/hooks/use-i18n";
import { motion } from "framer-motion";
import { ShoppingCart, FileText, Users, TrendingUp, DollarSign, Clock, Loader2 } from "lucide-react";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { t } = useI18n();
  const { data: stats, isLoading } = useGetDashboardStats();

  const cards = [
    { label: "Commandes totales", value: stats?.totalOrders ?? "—", icon: ShoppingCart, color: "text-blue-500", bg: "bg-blue-500/10", href: "/admin/orders" },
    { label: "Devis en attente", value: stats?.pendingQuotes ?? "—", icon: FileText, color: "text-amber-500", bg: "bg-amber-500/10", href: "/admin/quotes" },
    { label: "Utilisateurs", value: stats?.totalUsers ?? "—", icon: Users, color: "text-purple-500", bg: "bg-purple-500/10", href: "/admin/users" },
    { label: "CA total (DA)", value: stats?.totalRevenue ? `${stats.totalRevenue.toLocaleString()}` : "0", icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10", href: "/admin/orders" },
    { label: "Services actifs", value: stats?.totalServices ?? "—", icon: TrendingUp, color: "text-indigo-500", bg: "bg-indigo-500/10", href: "/admin/services" },
    { label: "Commandes en attente", value: stats?.pendingOrders ?? "—", icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10", href: "/admin/orders" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">{t("adminDashboard")}</h1>
          <p className="text-muted-foreground">Vue d'ensemble de l'activité</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card, i) => (
              <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Link href={card.href} className="block group">
                  <div className="bg-card border border-border rounded-xl p-5 group-hover:border-primary/50 group-hover:shadow-md transition-all" data-testid={`stat-card-${i}`}>
                    <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
                      <card.icon className={`h-5 w-5 ${card.color}`} />
                    </div>
                    <div className="text-3xl font-bold mb-1">{card.value}</div>
                    <div className="text-sm text-muted-foreground">{card.label}</div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-semibold mb-4">Accès rapides</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Gérer commandes", href: "/admin/orders", icon: ShoppingCart },
                { label: "Gérer devis", href: "/admin/quotes", icon: FileText },
                { label: "Gérer services", href: "/admin/services", icon: TrendingUp },
                { label: "Gérer utilisateurs", href: "/admin/users", icon: Users },
              ].map(link => (
                <Link key={link.href} href={link.href}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-all text-sm font-medium">
                  <link.icon className="h-4 w-4 text-primary" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-semibold mb-4">Statistiques</h2>
            {stats ? (
              <div className="space-y-3">
                {[
                  { label: "Commandes en attente", value: stats.pendingOrders || 0, total: stats.totalOrders || 1, color: "bg-amber-500" },
                  { label: "CA ce mois (DA)", value: Math.round((stats.revenueThisMonth || 0) / 1000), total: Math.max(1, Math.round((stats.totalRevenue || 0) / 1000)), color: "bg-green-500", suffix: "K" },
                  { label: "Devis en attente", value: stats.pendingQuotes || 0, total: Math.max(1, stats.totalQuotes || 1), color: "bg-blue-500" },
                ].map(bar => (
                  <div key={bar.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{bar.label}</span>
                      <span className="font-medium">{bar.value}{(bar as any).suffix}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${bar.color} rounded-full transition-all`}
                        style={{ width: `${Math.min(100, (bar.value / bar.total) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground text-sm">Chargement...</div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
