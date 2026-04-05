import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { useListServices, useGetMe, useCreateQuote, useUploadFile } from "@workspace/api-client-react";
import { useI18n } from "@/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, Upload, X, CheckCircle, ArrowRight, Layers, Calculator, FileText, Home } from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { PriceCalculator } from "@/components/price-calculator";

const schema = z.object({
  serviceId: z.string().min(1, "Sélectionnez un service"),
  note: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewQuote() {
  const { t, language } = useI18n();
  const { toast } = useToast();
  const { data: services } = useListServices({ active: true });
  const { data: user } = useGetMe();
  const createQuote = useCreateQuote();
  const uploadFile = useUploadFile();

  const [calcData, setCalcData] = useState<{ width: number; height: number; unit: string; area: number; totalPrice: number } | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submittedId, setSubmittedId] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { serviceId: "", note: "" },
  });

  const selectedServiceId = form.watch("serviceId");
  const selectedService = services?.find((s) => String(s.id) === selectedServiceId);

  const getPriceForUser = (service: any) => {
    if (!user) return service.publicPricePerM2;
    if (user.role === "subcontractor") return service.subcontractorPricePerM2;
    return service.clientPricePerM2;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }, []);

  const isSubmitting = createQuote.isPending || uploadingFile;

  const onSubmit = form.handleSubmit(async (data) => {
    if (!calcData || calcData.area === 0) {
      toast({ title: "Dimensions requises", description: "Veuillez entrer la largeur et la hauteur", variant: "destructive" });
      return;
    }

    let fileUrl: string | undefined;
    if (file) {
      setUploadingFile(true);
      try {
        const res = await uploadFile.mutateAsync({ data: { file } } as any);
        fileUrl = (res as any).url;
      } catch {
        toast({ title: "Erreur d'upload", description: "Impossible d'envoyer le fichier. Réessayez.", variant: "destructive" });
        setUploadingFile(false);
        return;
      }
      setUploadingFile(false);
    }

    createQuote.mutate(
      {
        data: {
          serviceId: parseInt(data.serviceId),
          widthInput: calcData.width,
          heightInput: calcData.height,
          unitInput: calcData.unit as "cm" | "m",
          note: data.note || undefined,
          fileUrl,
        },
      },
      {
        onSuccess: (quote: any) => {
          setSubmittedId(quote.id);
          setSuccess(true);
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.error || err?.message || "Erreur lors de l'envoi";
          toast({ title: "Erreur", description: msg, variant: "destructive" });
        },
      }
    );
  });

  const resetForm = () => {
    form.reset();
    setCalcData(null);
    setFile(null);
    setSuccess(false);
    setSubmittedId(null);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl">
        <Button variant="ghost" size="sm" asChild className="mb-6 text-muted-foreground hover:text-foreground">
          <Link href="/dashboard/quotes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("myQuotes")}
          </Link>
        </Button>

        <AnimatePresence mode="wait">
          {success ? (
            /* ── Success State ─────────────────────────────────── */
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-center py-8"
            >
              {/* animated check circle */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 18 }}
                className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-7"
              >
                <CheckCircle className="h-10 w-10 text-emerald-400" />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <h2 className="font-display text-2xl font-800 tracking-tight mb-3">
                  Votre demande a bien été envoyée
                </h2>
                <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto mb-2">
                  Nous avons reçu votre demande de devis. Notre équipe vous répondra dans les meilleurs délais.
                </p>
                <p className="text-xs text-muted-foreground/60 mb-8">
                  Délai de réponse habituel : 24 à 48h ouvrables
                </p>

                {/* reference number */}
                {submittedId && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/60 border border-border/40 text-sm mb-8">
                    <span className="text-muted-foreground">Référence :</span>
                    <span className="font-mono font-600 text-primary">DEV-{String(submittedId).padStart(4, "0")}</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button asChild variant="outline" className="gap-2">
                    <Link href="/">
                      <Home className="h-4 w-4" /> Accueil
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="gap-2">
                    <Link href="/services">
                      <Layers className="h-4 w-4" /> Voir les services
                    </Link>
                  </Button>
                  <Button onClick={resetForm} className="gap-2 btn-premium">
                    <FileText className="h-4 w-4" /> Nouvelle demande
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            /* ── Quote Form ────────────────────────────────────── */
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="mb-8">
                <h1 className="font-display text-2xl font-700 tracking-tight">{t("newQuote")}</h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Remplissez le formulaire ci-dessous et nous vous enverrons un devis personnalisé.
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={onSubmit} className="space-y-6">
                  {/* Service selector */}
                  <FormField
                    control={form.control}
                    name="serviceId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                          Service
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-service" className="h-11">
                              <SelectValue placeholder="Choisir un service" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {services?.map((s) => (
                              <SelectItem key={s.id} value={String(s.id)}>
                                {language === "ar" ? s.nameAr : s.nameFr}
                                {" — "}
                                {getPriceForUser(s).toLocaleString()} DA/m²
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Price calculator */}
                  {selectedService && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center gap-1.5 mb-2">
                        <Calculator className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm font-medium">Dimensions & calcul</span>
                      </div>
                      <PriceCalculator
                        pricePerM2={getPriceForUser(selectedService)}
                        onCalculated={setCalcData}
                      />
                    </motion.div>
                  )}

                  {/* File upload */}
                  <div>
                    <label className="text-sm font-medium flex items-center gap-1.5 mb-2">
                      <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                      Fichier de travail
                      <span className="text-xs text-muted-foreground font-normal ml-1">(optionnel)</span>
                    </label>

                    {file ? (
                      <div className="flex items-center gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5">
                        <FileText className="h-5 w-5 text-primary shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => setFile(null)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileRef.current?.click()}
                        className={`relative cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200 ${
                          isDragging
                            ? "border-primary bg-primary/5"
                            : "border-border/50 bg-muted/20 hover:border-primary/40 hover:bg-muted/30"
                        }`}
                      >
                        <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">
                          Glissez votre fichier ici ou{" "}
                          <span className="text-primary font-medium">parcourir</span>
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-1">PDF, AI, PNG, JPG — max 50 MB</p>
                        <input
                          ref={fileRef}
                          type="file"
                          className="hidden"
                          accept=".pdf,.ai,.png,.jpg,.jpeg,.eps,.svg"
                          onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
                        />
                      </div>
                    )}
                  </div>

                  {/* Note */}
                  <FormField
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                          Notes supplémentaires
                          <span className="text-xs text-muted-foreground font-normal ml-1">(optionnel)</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Détails du projet, finitions, délai souhaité..."
                            rows={4}
                            data-testid="textarea-note"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* info strip */}
                  <div className="rounded-xl border border-border/40 bg-muted/20 p-4 text-sm text-muted-foreground flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                    <span>Notre équipe validera votre demande et vous enverra un devis détaillé sous 24–48h ouvrables.</span>
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    className="w-full h-12 gap-2 btn-premium text-base font-600"
                    disabled={isSubmitting || !calcData || calcData.area === 0}
                    data-testid="button-submit-quote"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {uploadingFile ? "Upload en cours..." : "Envoi en cours..."}
                      </>
                    ) : (
                      <>
                        Envoyer la demande de devis
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
