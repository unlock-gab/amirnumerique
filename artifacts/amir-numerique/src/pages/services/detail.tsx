import { useState, useRef, useCallback } from "react";
import { PublicLayout } from "@/components/layouts/public-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useRoute, useLocation } from "wouter";
import {
  useGetServiceBySlug,
  useGetMe,
  useCreateOrder,
  useUploadFile,
} from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle,
  Loader2,
  Upload,
  FileText,
  X,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";

type Unit = "cm" | "m";

function getPrice(service: any, user: any): number {
  if (!user) return service.publicPricePerM2;
  if (user.role === "subcontractor") return service.subcontractorPricePerM2;
  return service.clientPricePerM2;
}

function toMeters(val: number, unit: Unit): number {
  return unit === "cm" ? val / 100 : val;
}

export default function ServiceDetail() {
  const [, params] = useRoute("/services/:slug");
  const [, setLocation] = useLocation();
  const slug = params?.slug || "";

  const { data: service, isLoading } = useGetServiceBySlug(slug, {
    query: { enabled: !!slug },
  });
  const { data: user } = useGetMe();

  const createOrder = useCreateOrder();
  const uploadFile = useUploadFile();

  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [unit, setUnit] = useState<Unit>("cm");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const pricePerM2 = service ? getPrice(service, user) : 0;

  const wM = toMeters(parseFloat(width) || 0, unit);
  const hM = toMeters(parseFloat(height) || 0, unit);
  const areaM2 = wM * hM;
  const totalPrice = areaM2 * pricePerM2;

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!service) return;
    if (!width || !height) {
      setErrorMsg("Veuillez saisir les dimensions.");
      return;
    }
    if (!user) {
      setLocation("/auth/login");
      return;
    }

    try {
      let fileUrl: string | undefined;

      if (file) {
        const uploaded = await uploadFile.mutateAsync({ data: { file } });
        fileUrl = (uploaded as any).url;
      }

      await createOrder.mutateAsync({
        data: {
          serviceId: service.id,
          widthInput: parseFloat(width),
          heightInput: parseFloat(height),
          unitInput: unit,
          note: note || undefined,
          fileUrl,
        },
      });

      setSuccessMsg("Commande envoyée avec succès !");
      setWidth("");
      setHeight("");
      setNote("");
      setFile(null);
      setShowForm(false);
    } catch (err: any) {
      setErrorMsg(err?.message || "Erreur lors de l'envoi de la commande.");
    }
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="flex justify-center py-40">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </PublicLayout>
    );
  }

  if (!service) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Service non trouvé</h1>
          <Button asChild>
            <Link href="/services">Retour aux services</Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }

  const name = service.nameFr;
  const description = service.descriptionFr;
  const isSubmitting = createOrder.isPending || uploadFile.isPending;

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="mb-8 text-muted-foreground"
        >
          <Link href="/services">
            <ArrowLeft className="mr-2 h-4 w-4" /> Tous les services
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-muted">
              {service.imageUrl ? (
                <img
                  src={service.imageUrl}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                  <span className="text-6xl font-bold text-primary/30">AN</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right: Info + Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Header */}
            <div>
              {service.active ? (
                <Badge className="mb-3 bg-green-500/10 text-green-500 border-green-500/20">
                  Disponible
                </Badge>
              ) : (
                <Badge variant="secondary" className="mb-3">
                  Indisponible
                </Badge>
              )}
              <h1 className="text-3xl md:text-4xl font-bold mb-3">{name}</h1>
              {description && (
                <p className="text-muted-foreground leading-relaxed">
                  {description}
                </p>
              )}
            </div>

            {/* Tarif card — shows price, NO calculation details */}
            <div className="border border-border rounded-xl p-6 bg-card space-y-4">
              <h3 className="font-semibold text-lg">Tarification</h3>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Prix par m²
                </p>
                <p className="text-4xl font-bold text-primary">
                  {pricePerM2.toLocaleString()} DA
                  <span className="text-base font-normal text-muted-foreground">
                    /m²
                  </span>
                </p>
                {user && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Tarif{" "}
                    {user.role === "subcontractor"
                      ? "sous-traitant"
                      : "client"}
                  </p>
                )}
              </div>
              <div className="space-y-2 pt-1">
                {service.requiresFileUpload && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Upload className="h-4 w-4 text-primary" />
                    <span>Fichier d'impression requis</span>
                  </div>
                )}
                {[
                  "Impression haute qualité",
                  "Livraison sur devis",
                  "Support technique inclus",
                ].map((feat) => (
                  <div
                    key={feat}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Success message */}
            {successMsg && (
              <div className="flex items-center gap-2 text-green-500 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3 text-sm">
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                {successMsg}
              </div>
            )}

            {/* CTA: Toggle order form */}
            {user ? (
              <div className="space-y-3">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    setShowForm((v) => !v);
                    setSuccessMsg("");
                    setErrorMsg("");
                  }}
                >
                  {showForm ? (
                    <>
                      <ChevronUp className="mr-2 h-4 w-4" /> Masquer le
                      formulaire
                    </>
                  ) : (
                    <>
                      <ChevronDown className="mr-2 h-4 w-4" /> Commander
                      maintenant
                    </>
                  )}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    setLocation(
                      `/dashboard/quotes/new?service=${service.id}`
                    )
                  }
                >
                  Demander un devis
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Button size="lg" className="w-full" asChild>
                  <Link href="/auth/register">Commander maintenant</Link>
                </Button>
                <Button size="lg" variant="outline" className="w-full" asChild>
                  <Link href="/auth/login">Se connecter</Link>
                </Button>
              </div>
            )}
          </motion.div>
        </div>

        {/* Order Form — expands below the grid */}
        <AnimatePresence>
          {showForm && user && (
            <motion.div
              key="order-form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <form
                onSubmit={handleSubmit}
                className="mt-10 border border-border rounded-2xl bg-card p-8 space-y-8"
              >
                <h2 className="text-xl font-bold">Passer une commande</h2>

                {/* Dimensions */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-base">
                    Dimensions du support
                  </h3>
                  <div className="flex gap-3 items-center flex-wrap">
                    {/* Unit toggle */}
                    <div className="flex rounded-lg border border-border overflow-hidden">
                      {(["cm", "m"] as Unit[]).map((u) => (
                        <button
                          key={u}
                          type="button"
                          onClick={() => setUnit(u)}
                          className={`px-4 py-2 text-sm font-medium transition-colors ${
                            unit === u
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {u}
                        </button>
                      ))}
                    </div>

                    {/* Width */}
                    <div className="flex-1 min-w-[120px]">
                      <label className="text-xs text-muted-foreground mb-1 block">
                        Largeur ({unit})
                      </label>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                        placeholder={`ex: ${unit === "cm" ? "200" : "2"}`}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        data-testid="input-width"
                      />
                    </div>

                    <span className="text-muted-foreground mt-5">×</span>

                    {/* Height */}
                    <div className="flex-1 min-w-[120px]">
                      <label className="text-xs text-muted-foreground mb-1 block">
                        Hauteur ({unit})
                      </label>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        placeholder={`ex: ${unit === "cm" ? "100" : "1"}`}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        data-testid="input-height"
                      />
                    </div>
                  </div>

                  {/* Price preview — shows total only, no formula */}
                  {areaM2 > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-primary/5 border border-primary/20 rounded-xl px-5 py-4 flex items-center justify-between"
                    >
                      <span className="text-sm text-muted-foreground">
                        Prix estimé
                      </span>
                      <span className="text-2xl font-bold text-primary">
                        {totalPrice.toLocaleString("fr-DZ", {
                          maximumFractionDigits: 0,
                        })}{" "}
                        DA
                      </span>
                    </motion.div>
                  )}
                </div>

                {/* File upload */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-base">
                    Fichier d'impression{" "}
                    {service.requiresFileUpload ? (
                      <span className="text-primary text-sm font-normal">
                        (requis)
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm font-normal">
                        (optionnel)
                      </span>
                    )}
                  </h3>

                  {file ? (
                    <div className="flex items-center gap-3 border border-border rounded-xl px-4 py-3 bg-muted/40">
                      <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleFileDrop}
                      onClick={() => fileRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl px-6 py-10 text-center cursor-pointer transition-colors ${
                        isDragging
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-muted/30"
                      }`}
                    >
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm font-medium">
                        Glisser-déposer ou cliquer pour sélectionner
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PDF, AI, PSD, PNG, JPG — max 50 MB
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,.ai,.psd,.png,.jpg,.jpeg,.tiff,.eps"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setFile(f);
                    }}
                    data-testid="input-file"
                  />
                </div>

                {/* Note */}
                <div className="space-y-2">
                  <label className="font-semibold text-base block">
                    Remarques{" "}
                    <span className="text-muted-foreground text-sm font-normal">
                      (optionnel)
                    </span>
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Précisions sur la commande, couleurs, finitions..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                    data-testid="input-note"
                  />
                </div>

                {/* Error */}
                {errorMsg && (
                  <div className="flex items-center gap-2 text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 text-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {errorMsg}
                  </div>
                )}

                {/* Submit */}
                <div className="flex gap-3">
                  <Button
                    type="submit"
                    size="lg"
                    className="flex-1"
                    disabled={isSubmitting}
                    data-testid="button-submit-order"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      "Confirmer la commande"
                    )}
                  </Button>
                  <Button
                    type="button"
                    size="lg"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PublicLayout>
  );
}
