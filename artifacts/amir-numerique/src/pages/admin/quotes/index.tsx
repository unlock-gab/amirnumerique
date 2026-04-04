import { AdminLayout } from "@/components/layouts/admin-layout";
import { useListQuotes } from "@workspace/api-client-react";
import { useI18n } from "@/hooks/use-i18n";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2, FileText } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  reviewed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  accepted: "bg-green-500/10 text-green-500 border-green-500/20",
  rejected: "bg-red-500/10 text-red-500 border-red-500/20",
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
        <h1 className="text-2xl font-bold">{t("manageQuotes")}</h1>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : quotes.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-lg font-semibold">Aucune demande de devis</h3>
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
                    <th className="text-right p-4 text-sm font-semibold text-muted-foreground">Prix estimé</th>
                    <th className="text-center p-4 text-sm font-semibold text-muted-foreground">Statut</th>
                    <th className="p-4" />
                  </tr>
                </thead>
                <tbody>
                  {quotes.map((quote: any) => (
                    <tr key={quote.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors" data-testid={`admin-quote-row-${quote.id}`}>
                      <td className="p-4 font-mono text-sm">#{quote.id}</td>
                      <td className="p-4 text-sm">{quote.user?.fullName || "—"}</td>
                      <td className="p-4 text-sm text-muted-foreground">{new Date(quote.createdAt).toLocaleDateString("fr-DZ")}</td>
                      <td className="p-4 text-sm">{quote.areaM2 ? `${quote.areaM2.toFixed(2)} m²` : "—"}</td>
                      <td className="p-4 text-right font-semibold text-sm">{quote.estimatedPrice ? `${quote.estimatedPrice.toLocaleString()} DA` : "—"}</td>
                      <td className="p-4 text-center">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full border ${STATUS_COLORS[quote.status]}`}>
                          {STATUS_LABELS[quote.status] || quote.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Button asChild variant="ghost" size="sm">
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
