import { AdminLayout } from "@/components/layouts/admin-layout";
import { useGetDashboardStats } from "@workspace/api-client-react";
import { useI18n } from "@/hooks/use-i18n";
import { motion } from "framer-motion";
import { ShoppingCart, FileText, Users, TrendingUp, DollarSign, Clock, Loader2, ArrowRight, Activity } from "lucide-react";
import { Link } from "wouter";

const STAT_CARDS = (stats: any) => [
  { label: "Commandes totales", value: stats?.totalOrders ?? "—", icon: ShoppingCart, color: "text-blue-400", bg: "bg-blue-500/8", border: "border-blue-500/15", href: "/admin/orders" },
  { label: "CA total", value: stats?.totalRevenue ? `${Number(stats.totalRevenue).toLocaleString("fr-DZ")} DA` : "0 DA", icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/8", border: "border-emerald-500/15", href: "/admin/orders" },
  { label: "Devis en attente", value: stats?.pendingQuotes ?? "—", icon: FileText, color: "text-amber-400", bg: "bg-amber-500/8", border: "border-amber-500/15", href: "/admin/quotes" },
  { label: "Commandes en attente", value: stats?.pendingOrders ?? "—", icon: Clock, color: "text-orange-400", bg: "bg-orange-500/8", border: "border-orange-500/15", href: "/admin/orders" },
  { label: "Utilisateurs", value: stats?.totalUsers ?? "—", icon: Users, color: "text-violet-400", bg: "bg-violet-500/8", border: "border-violet-500/15", href: "/admin/users" },
  { label: "Services actifs", value: stats?.totalServices ?? "—", icon: TrendingUp, color: "text-cyan-400", bg: "bg-cyan-500/8", border: "border-cyan-500/15", href: "/admin/services" },
];

const QUICK_LINKS = [
  { label: "Gérer commandes", href: "/admin/orders", icon: ShoppingCart, desc: "Suivre et mettre à jour" },
  { label: "Gérer devis", href: "/admin/quotes", icon: FileText, desc: "Approuver et facturer" },
  { label: "Gérer services", href: "/admin/services", icon: TrendingUp, desc: "Tarifs et catalogue" },
  { label: "Gérer utilisateurs", href: "/admin/users", icon: Users, desc: "Rôles et comptes" },
];

export default function AdminDashboard() {
  const { t } = useI18n();
  const { data: stats, isLoading } = useGetDashboardStats();

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-700 tracking-tight">{t("adminDashboard")}</h1>
            <p className="text-sm text-muted-foreground mt-1">Vue d'ensemble de l'activité — {new Date().toLocaleDateString("fr-DZ", { weekday: "long", day: "numeric", month: "long" })}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
            <Activity className="h-3.5 w-3.5" />
            Système opérationnel
          </div>
        </div>

        {/* Stats grid */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {STAT_CARDS(stats).map((card, i) => (
              <motion.div key={card.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}>
                <Link href={card.href} className="block group" data-testid={`stat-card-${i}`}>
                  <div className={`rounded-2xl border ${card.border} ${card.bg} p-5 transition-all duration-200 group-hover:border-primary/30 group-hover:shadow-lg group-hover:shadow-black/10 group-hover:-translate-y-0.5`}>
                    <div className={`w-9 h-9 rounded-xl ${card.bg} border ${card.border} flex items-center justify-center mb-4`}>
                      <card.icon className={`h-4.5 w-4.5 ${card.color}`} />
                    </div>
                    <div className={`font-display text-3xl font-700 mb-1 tabular-nums ${card.color}`}>{card.value}</div>
                    <div className="text-xs text-muted-foreground font-medium">{card.label}</div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Bottom grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Quick links */}
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border/40">
              <h2 className="font-display font-600 text-sm">Accès rapides</h2>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {QUICK_LINKS.map((link) => (
                <Link key={link.href} href={link.href}
                  className="flex items-start gap-3 p-3.5 rounded-xl border border-border/40 hover:border-primary/30 hover:bg-muted/20 transition-all group">
                  <div className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                    <link.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">{link.label}</div>
                    <div className="text-xs text-muted-foreground truncate">{link.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Activity chart */}
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border/40">
              <h2 className="font-display font-600 text-sm">Indicateurs clés</h2>
            </div>
            <div className="p-5 space-y-4">
              {stats ? [
                { label: "Taux de commandes actives", value: stats.pendingOrders || 0, total: Math.max(1, stats.totalOrders || 1), color: "bg-amber-500", display: `${stats.pendingOrders || 0} en attente` },
                { label: "CA ce mois vs total", value: Math.round((stats.revenueThisMonth || 0) / 1000), total: Math.max(1, Math.round((stats.totalRevenue || 0) / 1000)), color: "bg-emerald-500", display: `${((stats.revenueThisMonth || 0) / 1000).toFixed(0)}K DA ce mois` },
                { label: "Devis en attente de traitement", value: stats.pendingQuotes || 0, total: Math.max(1, stats.totalQuotes || 1), color: "bg-blue-500", display: `${stats.pendingQuotes || 0} devis` },
              ].map((bar) => (
                <div key={bar.label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{bar.label}</span>
                    <span className="text-xs font-semibold tabular-nums">{bar.display}</span>
                  </div>
                  <div className="h-1.5 bg-muted/60 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${bar.color} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (bar.value / bar.total) * 100)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                    />
                  </div>
                </div>
              )) : (
                <div className="text-center py-4 text-muted-foreground text-sm">Chargement...</div>
              )}
            </div>

            {stats && (
              <div className="px-5 pb-4">
                <Link href="/admin/orders" className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors font-medium">
                  Voir toutes les commandes <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
