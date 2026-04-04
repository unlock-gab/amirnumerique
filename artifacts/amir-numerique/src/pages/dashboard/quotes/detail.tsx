import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { useGetQuote, useUpdateQuoteStatus } from "@workspace/api-client-react";
import { useI18n } from "@/hooks/use-i18n";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  reviewed: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  accepted: "bg-green-500/10 text-green-600 border-green-500/20",
  rejected: "bg-red-500/10 text-red-600 border-red-500/20",
};
const STATUS_LABELS: Record<string, string> = {
  pending: "En attente de réponse", reviewed: "Examiné par l'équipe", accepted: "Accepté", rejected: "Refusé",
};

export default function QuoteDetail() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [, params] = useRoute("/dashboard/quotes/:id");
  const id = params?.id ? parseInt(params.id) : 0;
  const { data: quote, isLoading } = useGetQuote(id, { query: { enabled: !!id } });
  const updateStatus = useUpdateQuoteStatus();

  const handleAccept = () => {
    if (!id) return;
    updateStatus.mutate({ id, data: { status: "accepted" } }, {
      onSuccess: () => toast({ title: "Devis accepté", description: "Nous vous contacterons pour la suite" }),
      onError: () => toast({ title: "Erreur", variant: "destructive" }),
    });
  };

  const handleReject = () => {
    if (!id) return;
    updateStatus.mutate({ id, data: { status: "rejected" } }, {
      onSuccess: () => toast({ title: "Devis refusé" }),
      onError: () => toast({ title: "Erreur", variant: "destructive" }),
    });
  };

  if (isLoading) {
    return <DashboardLayout><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></DashboardLayout>;
  }

  if (!quote) {
    return <DashboardLayout><div className="text-center py-20"><p>Devis introuvable</p><Button asChild className="mt-4"><Link href="/dashboard/quotes">Retour</Link></Button></div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl">
        <Button variant="ghost" size="sm" asChild className="mb-6 text-muted-foreground">
          <Link href="/dashboard/quotes"><ArrowLeft className="mr-2 h-4 w-4" />{t("myQuotes")}</Link>
        </Button>

        <div className="flex items-start justify-between mb-8">
          <h1 className="text-2xl font-bold">Devis #{quote.id}</h1>
          <span className={`text-sm font-medium px-3 py-1.5 rounded-full border ${STATUS_COLORS[quote.status]}`}>
            {STATUS_LABELS[quote.status] || quote.status}
          </span>
        </div>

        <div className="bg-card border border-border rounded-xl divide-y divide-border mb-6">
          {[
            { label: "Date", value: new Date(quote.createdAt).toLocaleString("fr-DZ") },
            { label: t("width"), value: `${quote.widthInput} ${quote.unitInput}` },
            { label: t("height"), value: `${quote.heightInput} ${quote.unitInput}` },
            { label: t("area"), value: `${quote.areaM2.toFixed(2)} m²` },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center p-4">
              <span className="text-sm text-muted-foreground">{label}</span>
              <span className="font-medium text-sm">{value}</span>
            </div>
          ))}
          {quote.estimatedPrice && (
            <div className="p-4 bg-primary/5">
              <span className="text-sm text-muted-foreground block mb-1">Prix estimé par l'équipe</span>
              <span className="text-2xl font-bold text-primary">{quote.estimatedPrice.toLocaleString()} DA</span>
            </div>
          )}
          {quote.adminResponse && (
            <div className="p-4">
              <span className="text-sm text-muted-foreground block mb-2">Note de l'équipe</span>
              <p className="text-sm">{quote.adminResponse}</p>
            </div>
          )}
          {quote.note && (
            <div className="p-4">
              <span className="text-sm text-muted-foreground block mb-1">Vos notes</span>
              <p className="text-sm">{quote.note}</p>
            </div>
          )}
        </div>

        {quote.status === "reviewed" && quote.estimatedPrice && (
          <div className="flex gap-3">
            <Button className="flex-1" onClick={handleAccept} disabled={updateStatus.isPending} data-testid="button-accept-quote">
              Accepter le devis
            </Button>
            <Button variant="outline" className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={handleReject} disabled={updateStatus.isPending} data-testid="button-reject-quote">
              Refuser
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
