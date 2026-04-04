import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { useListServices, useGetMe, useCreateOrder, useUploadFile } from "@workspace/api-client-react";
import { useI18n } from "@/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, useSearch, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Loader2, Calculator, Upload, FileText, X, CheckCircle,
  CreditCard, Banknote, Landmark, AlertCircle, ChevronRight, Package,
} from "lucide-react";

type Unit = "cm" | "m";

const schema = z.object({
  serviceId: z.string().min(1, "Sélectionnez un service"),
  note: z.string().optional(),
  paymentMethod: z.string().optional(),
});

function toMeters(val: number, unit: Unit) { return unit === "cm" ? val / 100 : val; }
function getPrice(service: any, user: any) {
  if (!user) return service.publicPricePerM2;
  if (user.role === "subcontractor") return service.subcontractorPricePerM2;
  return service.clientPricePerM2;
}

const PAYMENT_METHODS = [
  { key: "bank_transfer", label: "Virement bancaire", icon: Landmark, desc: "CCP ou compte bancaire" },
  { key: "cash", label: "Paiement cash", icon: Banknote, desc: "À la livraison ou en agence" },
  { key: "card", label: "Carte CIB / EDAHABIA", icon: CreditCard, desc: "Paiement électronique" },
];

export default function NewOrder() {
  const { t, language } = useI18n();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const preselectedServiceId = params.get("service") || "";

  const { data: services } = useListServices({ active: true });
  const { data: user } = useGetMe();
  const createOrder = useCreateOrder();
  const uploadFile = useUploadFile();

  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [unit, setUnit] = useState<Unit>("cm");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("bank_transfer");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { serviceId: preselectedServiceId, note: "" },
  });

  const selectedServiceId = form.watch("serviceId");
  const selectedService = services?.find(s => String(s.id) === selectedServiceId);
  const pricePerM2 = selectedService ? getPrice(selectedService, user) : 0;
  const wM = toMeters(parseFloat(width) || 0, unit);
  const hM = toMeters(parseFloat(height) || 0, unit);
  const areaM2 = wM * hM;
  const totalPrice = areaM2 * pricePerM2;
  const hasValidDimensions = areaM2 > 0;

  useEffect(() => {
    if (preselectedServiceId) form.setValue("serviceId", preselectedServiceId);
  }, [preselectedServiceId]);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  }, []);

  const onSubmit = form.handleSubmit(async (data) => {
    if (!hasValidDimensions) {
      toast({ title: "Dimensions requises", description: "Veuillez entrer la largeur et la hauteur", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      let fileUrl: string | undefined;
      if (file) {
        const uploaded = await uploadFile.mutateAsync({ data: { file } });
        fileUrl = (uploaded as any).url;
      }
      const order = await createOrder.mutateAsync({
        data: {
          serviceId: parseInt(data.serviceId),
          widthInput: parseFloat(width),
          heightInput: parseFloat(height),
          unitInput: unit,
          note: data.note || undefined,
          fileUrl,
        },
      });
      toast({ title: "Commande créée", description: "Votre commande a été soumise avec succès" });
      setLocation(`/dashboard/orders/${order.id}`);
    } catch (err: any) {
      toast({ title: "Erreur", description: err?.response?.data?.error || "Erreur lors de la création", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        {/* Back nav */}
        <Button variant="ghost" size="sm" asChild className="mb-6 text-muted-foreground hover:text-foreground -ml-2">
          <Link href="/dashboard/orders"><ArrowLeft className="mr-2 h-4 w-4" />{t("myOrders")}</Link>
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-2xl font-700 tracking-tight">{t("newOrder")}</h1>
          <p className="text-muted-foreground text-sm mt-1">Remplissez les informations ci-dessous pour passer votre commande</p>
        </div>

        <Form {...form}>
          <form onSubmit={onSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

              {/* ── LEFT COLUMN: Form ── */}
              <div className="lg:col-span-3 space-y-5">

                {/* Step 1 – Service */}
                <FormStep number="1" title="Choisissez votre service">
                  <FormField control={form.control} name="serviceId" render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 border-border/60 text-sm" data-testid="select-service">
                            <SelectValue placeholder="Sélectionner un service d'impression..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {services?.map(s => (
                            <SelectItem key={s.id} value={String(s.id)} className="py-3">
                              <div className="flex items-center justify-between gap-8 w-full">
                                <span className="font-medium">{language === "ar" ? s.nameAr : s.nameFr}</span>
                                <span className="text-xs text-muted-foreground tabular-nums">{getPrice(s, user).toLocaleString()} DA/m²</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Service summary card */}
                  <AnimatePresence>
                    {selectedService && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
                        <div className="mt-3 flex items-center gap-4 p-4 rounded-xl bg-primary/6 border border-primary/20">
                          <div className="w-12 h-12 rounded-xl bg-muted/60 overflow-hidden shrink-0">
                            {selectedService.imageUrl ? (
                              <img src={selectedService.imageUrl} alt={selectedService.nameFr} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-5 w-5 text-muted-foreground/40" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-display font-600 text-sm">{selectedService.nameFr}</div>
                            <div className="text-xs text-muted-foreground mt-0.5 truncate">{selectedService.descriptionFr}</div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-display font-700 text-primary text-lg tabular-nums">{pricePerM2.toLocaleString()}</div>
                            <div className="text-[10px] text-muted-foreground">DA/m²</div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </FormStep>

                {/* Step 2 – Dimensions */}
                <FormStep number="2" title="Dimensions du support">
                  <div className="space-y-3">
                    {/* Unit toggle */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Unité :</span>
                      <div className="flex rounded-xl border border-border/60 overflow-hidden">
                        {(["cm", "m"] as Unit[]).map(u => (
                          <button key={u} type="button" onClick={() => setUnit(u)}
                            className={`px-5 py-2 text-sm font-600 transition-colors ${unit === u ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/60"}`}>
                            {u}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* W × H inputs */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Largeur ({unit})</label>
                        <input type="number" min="0.01" step="0.01" value={width} onChange={e => setWidth(e.target.value)}
                          placeholder={unit === "cm" ? "ex: 200" : "ex: 2.00"}
                          className="w-full px-4 py-3 rounded-xl border border-border/60 bg-background/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all tabular-nums"
                          data-testid="input-width" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Hauteur ({unit})</label>
                        <input type="number" min="0.01" step="0.01" value={height} onChange={e => setHeight(e.target.value)}
                          placeholder={unit === "cm" ? "ex: 150" : "ex: 1.50"}
                          className="w-full px-4 py-3 rounded-xl border border-border/60 bg-background/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all tabular-nums"
                          data-testid="input-height" />
                      </div>
                    </div>
                  </div>
                </FormStep>

                {/* Step 3 – File upload */}
                <FormStep number="3" title={`Fichier d'impression${selectedService?.requiresFileUpload ? " (requis)" : " (optionnel)"}`}>
                  {file ? (
                    <div className="flex items-center gap-3 border border-emerald-500/25 bg-emerald-500/6 rounded-xl px-4 py-3.5">
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
                        <CheckCircle className="h-4.5 w-4.5 text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB — Prêt à envoyer</p>
                      </div>
                      <button type="button" onClick={() => setFile(null)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleFileDrop}
                      onClick={() => fileRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl px-6 py-10 text-center cursor-pointer transition-all duration-200 ${isDragging ? "border-primary bg-primary/6 scale-[1.01]" : "border-border/50 hover:border-primary/40 hover:bg-muted/20"}`}
                    >
                      <Upload className={`h-8 w-8 mx-auto mb-3 transition-colors ${isDragging ? "text-primary" : "text-muted-foreground/40"}`} />
                      <p className="text-sm font-medium mb-1">Glisser-déposer votre fichier ici</p>
                      <p className="text-xs text-muted-foreground">ou <span className="text-primary underline">parcourir</span> — PDF, AI, PSD, PNG, JPG — max 50 MB</p>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept=".pdf,.ai,.psd,.png,.jpg,.jpeg,.tiff,.eps" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) setFile(f); }} data-testid="input-file" />
                </FormStep>

                {/* Step 4 – Note */}
                <FormStep number="4" title="Remarques (optionnel)">
                  <FormField control={form.control} name="note" render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Précisions sur la commande, couleurs pantone, finitions souhaitées, instructions de livraison..."
                          rows={3}
                          className="resize-none text-sm border-border/60"
                          data-testid="textarea-note"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </FormStep>

                {/* Step 5 – Payment */}
                <FormStep number="5" title="Mode de paiement">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {PAYMENT_METHODS.map(method => (
                      <button
                        key={method.key}
                        type="button"
                        onClick={() => setSelectedPayment(method.key)}
                        className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${selectedPayment === method.key ? "border-primary/50 bg-primary/8 shadow-lg shadow-primary/10" : "border-border/50 hover:border-border/80 hover:bg-muted/20"}`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${selectedPayment === method.key ? "bg-primary/15" : "bg-muted/60"}`}>
                          <method.icon className={`h-4 w-4 ${selectedPayment === method.key ? "text-primary" : "text-muted-foreground"}`} />
                        </div>
                        <div className={`font-display font-600 text-sm mb-0.5 ${selectedPayment === method.key ? "text-foreground" : "text-muted-foreground"}`}>{method.label}</div>
                        <div className="text-[11px] text-muted-foreground/70">{method.desc}</div>
                        {selectedPayment === method.key && (
                          <div className="mt-2 flex items-center gap-1 text-[10px] text-primary font-600">
                            <CheckCircle className="h-2.5 w-2.5" /> Sélectionné
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    Le paiement sera confirmé avec notre équipe après validation de votre commande.
                  </p>
                </FormStep>
              </div>

              {/* ── RIGHT COLUMN: Summary & CTA ── */}
              <div className="lg:col-span-2">
                <div className="lg:sticky lg:top-24 space-y-4">

                  {/* Price summary card */}
                  <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
                    <div className="px-5 py-4 border-b border-border/40 flex items-center gap-2">
                      <Calculator className="h-4 w-4 text-primary" />
                      <h3 className="font-display font-600 text-sm">Récapitulatif</h3>
                    </div>

                    <div className="p-5 space-y-4">
                      {/* Service */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Service</span>
                        <span className="font-medium truncate max-w-[160px] text-right">
                          {selectedService ? selectedService.nameFr : <span className="text-muted-foreground/50">Non sélectionné</span>}
                        </span>
                      </div>

                      {/* Dimensions */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Dimensions</span>
                        <span className={`font-medium tabular-nums ${hasValidDimensions ? "" : "text-muted-foreground/50"}`}>
                          {hasValidDimensions ? `${width} × ${height} ${unit}` : "—"}
                        </span>
                      </div>

                      {/* Area */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Surface</span>
                        <span className={`font-display font-600 tabular-nums ${hasValidDimensions ? "text-foreground" : "text-muted-foreground/50"}`}>
                          {hasValidDimensions ? `${areaM2.toFixed(4)} m²` : "—"}
                        </span>
                      </div>

                      {/* Price/m² */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Prix unitaire</span>
                        <span className={`font-display font-600 tabular-nums ${selectedService ? "" : "text-muted-foreground/50"}`}>
                          {selectedService ? `${pricePerM2.toLocaleString()} DA/m²` : "—"}
                        </span>
                      </div>

                      <div className="h-px bg-border/40" />

                      {/* Total */}
                      <AnimatePresence mode="wait">
                        {hasValidDimensions && selectedService ? (
                          <motion.div key="price" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
                            <div className="flex items-center justify-between">
                              <span className="font-display font-600 text-sm">Total estimé</span>
                              <div className="text-right">
                                <div className="font-display font-800 text-3xl text-primary tabular-nums leading-none">
                                  {Math.round(totalPrice).toLocaleString()}
                                </div>
                                <div className="text-xs text-muted-foreground mt-0.5">DA TTC</div>
                              </div>
                            </div>
                            <div className="mt-3 text-[11px] text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
                              {areaM2.toFixed(4)} m² × {pricePerM2.toLocaleString()} DA/m²
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="flex items-center justify-between">
                            <span className="font-display font-600 text-sm">Total estimé</span>
                            <span className="text-2xl font-display font-700 text-muted-foreground/30">— DA</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* CTA */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-13 text-base font-600 shadow-xl shadow-primary/20 hover:shadow-primary/35 transition-all"
                    disabled={isSubmitting || !selectedService || !hasValidDimensions}
                    data-testid="button-submit-order"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="mr-2 h-4.5 w-4.5 animate-spin" /> Envoi en cours...</>
                    ) : (
                      <>Confirmer la commande <ChevronRight className="ml-2 h-4.5 w-4.5" /></>
                    )}
                  </Button>

                  {(!selectedService || !hasValidDimensions) && (
                    <p className="text-center text-xs text-muted-foreground">
                      {!selectedService ? "Sélectionnez un service pour continuer" : "Entrez les dimensions pour voir le prix"}
                    </p>
                  )}

                  {/* Trust elements */}
                  <div className="rounded-xl border border-border/40 p-4 space-y-2.5">
                    {[
                      { icon: CheckCircle, text: "Devis confirmé par notre équipe sous 24h" },
                      { icon: CheckCircle, text: "Fichier BAT envoyé avant impression" },
                      { icon: CheckCircle, text: "Livraison dans les délais garantis" },
                    ].map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-center gap-2.5 text-xs text-muted-foreground">
                        <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
                        {text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
}

function FormStep({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border/40 flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <span className="font-display font-700 text-[11px] text-primary">{number}</span>
        </div>
        <h3 className="font-display font-600 text-sm">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
