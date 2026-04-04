import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { useListServices, useGetMe, useCreateQuote } from "@workspace/api-client-react";
import { useI18n } from "@/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { PriceCalculator } from "@/components/price-calculator";

const schema = z.object({
  serviceId: z.string().min(1, "Sélectionnez un service"),
  note: z.string().optional(),
});

export default function NewQuote() {
  const { t, language } = useI18n();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { data: services } = useListServices({ active: true });
  const { data: user } = useGetMe();
  const createQuote = useCreateQuote();
  const [calcData, setCalcData] = useState<{ width: number; height: number; unit: string; area: number; totalPrice: number } | null>(null);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { serviceId: "", note: "" },
  });

  const selectedServiceId = form.watch("serviceId");
  const selectedService = services?.find(s => String(s.id) === selectedServiceId);

  const getPriceForUser = (service: any) => {
    if (!user) return service.publicPricePerM2;
    if (user.role === "subcontractor") return service.subcontractorPricePerM2;
    return service.clientPricePerM2;
  };

  const onSubmit = form.handleSubmit((data) => {
    if (!calcData || calcData.area === 0) {
      toast({ title: "Erreur", description: "Veuillez entrer les dimensions", variant: "destructive" });
      return;
    }
    createQuote.mutate({
      data: {
        serviceId: parseInt(data.serviceId),
        widthInput: calcData.width,
        heightInput: calcData.height,
        unitInput: calcData.unit as "cm" | "m",
        note: data.note || undefined,
      }
    }, {
      onSuccess: (quote) => {
        toast({ title: "Devis envoyé", description: "Nous vous répondrons dans les plus brefs délais" });
        setLocation(`/dashboard/quotes/${quote.id}`);
      },
      onError: (err: any) => {
        toast({ title: "Erreur", description: err?.response?.data?.error || "Erreur", variant: "destructive" });
      },
    });
  });

  return (
    <DashboardLayout>
      <div className="max-w-2xl">
        <Button variant="ghost" size="sm" asChild className="mb-6 text-muted-foreground">
          <Link href="/dashboard/quotes"><ArrowLeft className="mr-2 h-4 w-4" />{t("myQuotes")}</Link>
        </Button>

        <h1 className="text-2xl font-bold mb-8">{t("newQuote")}</h1>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-6">
            <FormField control={form.control} name="serviceId" render={({ field }) => (
              <FormItem>
                <FormLabel>Service</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-service">
                      <SelectValue placeholder="Choisir un service" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {services?.map(s => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {language === "ar" ? s.nameAr : s.nameFr} — {getPriceForUser(s).toLocaleString()} DA/m²
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            {selectedService && (
              <PriceCalculator
                pricePerM2={getPriceForUser(selectedService)}
                onCalculated={setCalcData}
              />
            )}

            <FormField control={form.control} name="note" render={({ field }) => (
              <FormItem>
                <FormLabel>Notes supplémentaires</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Détails du projet, finitions souhaitées..."
                    rows={4}
                    data-testid="textarea-note"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="bg-muted/40 border border-border rounded-xl p-4 text-sm text-muted-foreground">
              Notre équipe validera le devis et vous enverra une confirmation.
            </div>

            <Button type="submit" className="w-full h-11" disabled={createQuote.isPending || !calcData || calcData.area === 0} data-testid="button-submit-quote">
              {createQuote.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Envoi...</> : "Envoyer la demande de devis"}
            </Button>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
}
