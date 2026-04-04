import { AdminLayout } from "@/components/layouts/admin-layout";
import { useGetQuote, useUpdateQuoteStatus } from "@workspace/api-client-react";
import { useI18n } from "@/hooks/use-i18n";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const STATUS_OPTIONS = [
  { value: "pending", label: "En attente" },
  { value: "reviewed", label: "Examiné" },
  { value: "accepted", label: "Accepté" },
  { value: "rejected", label: "Refusé" },
];

export default function AdminQuoteDetail() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [, params] = useRoute("/admin/quotes/:id");
  const id = params?.id ? parseInt(params.id) : 0;
  const { data: quote, isLoading, refetch } = useGetQuote(id, { query: { enabled: !!id } });
  const updateQuote = useUpdateQuoteStatus();
  const [status, setStatus] = useState("");
  const [adminResponse, setAdminResponse] = useState("");
  const [estimatedPrice, setEstimatedPrice] = useState("");
  const [initialized, setInitialized] = useState(false);

  if (quote && !initialized) {
    setStatus(quote.status);
    setAdminResponse(quote.adminResponse || "");
    setEstimatedPrice(quote.estimatedPrice?.toString() || "");
    setInitialized(true);
  }

  const handleSave = () => {
    if (!id) return;
    updateQuote.mutate({
      id,
      data: {
        status: status as any,
        adminResponse,
      },
    }, {
      onSuccess: () => {
        toast({ title: "Devis mis à jour" });
        refetch();
      },
      onError: () => toast({ title: "Erreur", variant: "destructive" }),
    });
  };

  if (isLoading) {
    return <AdminLayout><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AdminLayout>;
  }

  if (!quote) {
    return <AdminLayout><div className="text-center py-20"><Button asChild><Link href="/admin/quotes">Retour</Link></Button></div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl">
        <Button variant="ghost" size="sm" asChild className="mb-6 text-muted-foreground">
          <Link href="/admin/quotes"><ArrowLeft className="mr-2 h-4 w-4" />{t("manageQuotes")}</Link>
        </Button>

        <h1 className="text-2xl font-bold mb-8">Devis #{quote.id}</h1>

        <div className="bg-card border border-border rounded-xl divide-y divide-border mb-6">
          {[
            { label: "Client", value: (quote as any).user?.fullName || "—" },
            { label: "Email", value: (quote as any).user?.email || "—" },
            { label: "Date", value: new Date(quote.createdAt).toLocaleString("fr-DZ") },
            { label: "Dimensions", value: `${quote.widthInput} × ${quote.heightInput} ${quote.unitInput}` },
            { label: "Surface (m²)", value: `${quote.areaM2.toFixed(2)} m²` },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center p-4">
              <span className="text-sm text-muted-foreground">{label}</span>
              <span className="font-medium text-sm">{value}</span>
            </div>
          ))}
          {quote.note && (
            <div className="p-4">
              <span className="text-sm text-muted-foreground block mb-2">Note du client</span>
              <p className="text-sm">{quote.note}</p>
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <h2 className="font-semibold">Répondre au devis</h2>

          <div>
            <label className="text-sm font-medium block mb-1.5">{t("status")}</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Prix estimé (DA) — informatif</label>
            <Input
              type="number"
              min="0"
              value={estimatedPrice}
              onChange={e => setEstimatedPrice(e.target.value)}
              placeholder="Ex: 15000"
              data-testid="input-estimated-price"
            />
            <p className="text-xs text-muted-foreground mt-1">Ce champ est indicatif — la modification du prix estimé nécessite un accès direct à la base.</p>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Réponse pour le client</label>
            <Textarea
              value={adminResponse}
              onChange={e => setAdminResponse(e.target.value)}
              rows={3}
              placeholder="Détails du devis, délais, conditions..."
              data-testid="textarea-admin-response"
            />
          </div>

          <Button onClick={handleSave} disabled={updateQuote.isPending} data-testid="button-save-quote">
            {updateQuote.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sauvegarde...</> : "Enregistrer la réponse"}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
