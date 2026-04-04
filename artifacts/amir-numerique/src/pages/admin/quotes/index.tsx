import { AdminLayout } from "@/components/layouts/admin-layout";
import { useListQuotes } from "@workspace/api-client-react";
import { useI18n } from "@/hooks/use-i18n";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2, FileText } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/25",
  reviewed: "bg-blue-500/10 text-blue-400 border-blue-500/25",
  accepted: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
  rejected: "bg-red-500/10 text-red-400 border-red-500/25",
};
const STATUS_LABELS: Record<string, string> = {
  pending: "En attente", reviewed: "Examiné", accepted: "Accepté", rejected: "Refusé",
};

export default function AdminQuotes() {
  const { t } = useI18n();
  const { data: result, isLoading } = useListQuotes({});
  const quotes = (result as any)?.quotes || (Array.isArray(result) ? result : []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-700 tracking-tight">{t("manageQuotes")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{quotes.length} demande{quotes.length !== 1 ? "s" : ""} de devis</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : quotes.length === 0 ? (
          <div className="text-center py-24 rounded-2xl border border-border/50 bg-card/40">
            <FileText className="h-10 w-10 mx-auto mb-4 text-muted-foreground/20" />
            <h3 className="font-display font-600 text-lg mb-1">Aucune demande de devis</h3>
            <p className="text-sm text-muted-foreground">Les demandes clients apparaîtront ici</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/20">
                    <th className="text-left px-5 py-3.5 text-xs font-600 font-display uppercase tracking-wider text-muted-foreground">N°</th>
                    <th className="text-left px-5 py-3.5 text-xs font-600 font-display uppercase tracking-wider text-muted-foreground">Client</th>
                    <th className="text-left px-5 py-3.5 text-xs font-600 font-display uppercase tracking-wider text-muted-foreground">Date</th>
                    <th className="text-left px-5 py-3.5 text-xs font-600 font-display uppercase tracking-wider text-muted-foreground">Surface</th>
                    <th className="text-right px-5 py-3.5 text-xs font-600 font-display uppercase tracking-wider text-muted-foreground">Prix estimé</th>
                    <th className="text-center px-5 py-3.5 text-xs font-600 font-display uppercase tracking-wider text-muted-foreground">Statut</th>
                    <th className="px-5 py-3.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {quotes.map((quote: any) => (
                    <tr key={quote.id} className="hover:bg-muted/15 transition-colors group" data-testid={`admin-quote-row-${quote.id}`}>
                      <td className="px-5 py-4 font-mono text-xs text-muted-foreground">#{quote.id}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-bold text-primary">{quote.user?.fullName?.charAt(0) || "?"}</span>
                          </div>
                          <span className="text-sm font-medium">{quote.user?.fullName || "—"}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">{new Date(quote.createdAt).toLocaleDateString("fr-DZ")}</td>
                      <td className="px-5 py-4 text-sm tabular-nums">{quote.areaM2 ? `${quote.areaM2.toFixed(2)} m²` : "—"}</td>
                      <td className="px-5 py-4 text-right">
                        <span className="font-display font-600 text-sm tabular-nums">
                          {quote.estimatedPrice ? `${quote.estimatedPrice.toLocaleString()} DA` : "—"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex items-center text-[11px] font-medium px-2.5 py-1 rounded-full border ${STATUS_COLORS[quote.status] || "bg-muted text-muted-foreground border-border"}`}>
                          {STATUS_LABELS[quote.status] || quote.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Button asChild variant="ghost" size="sm" className="h-7 text-xs opacity-60 group-hover:opacity-100">
                          <Link href={`/admin/quotes/${quote.id}`}>Gérer</Link>
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
