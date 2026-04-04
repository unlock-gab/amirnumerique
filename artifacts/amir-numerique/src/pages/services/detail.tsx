import { useState, useRef, useCallback } from "react";
import { PublicLayout } from "@/components/layouts/public-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useRoute, useLocation } from "wouter";
import {
  useGetServiceBySlug, useGetMe, useCreateOrder, useUploadFile,
} from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, CheckCircle, Loader2, Upload, FileText, X, AlertCircle,
  Calculator, ShieldCheck, Clock, Zap, ChevronDown, ChevronUp,
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

const BENEFITS = [
  { icon: Zap, text: "Impression haute résolution" },
  { icon: ShieldCheck, text: "Garantie qualité professionnelle" },
  { icon: Clock, text: "Production en 48h" },
  { icon: CheckCircle, text: "Fichier BAT inclus" },
];

export default function ServiceDetail() {
  const [, params] = useRoute("/services/:slug");
  const [, setLocation] = useLocation();
  const slug = params?.slug || "";

  const { data: service, isLoading } = useGetServiceBySlug(slug, { query: { enabled: !!slug } });
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
    if (!width || !height) { setErrorMsg("Veuillez saisir les dimensions."); return; }
    if (!user) { setLocation("/auth/login"); return; }

    try {
      let fileUrl: string | undefined;
      if (file) {
        const uploaded = await uploadFile.mutateAsync({ data: { file } });
        fileUrl = (uploaded as any).url;
      }
      await createOrder.mutateAsync({
        data: { serviceId: service.id, widthInput: parseFloat(width), heightInput: parseFloat(height), unitInput: unit, note: note || undefined, fileUrl },
      });
      setSuccessMsg("Commande envoyée avec succès !");
      setWidth(""); setHeight(""); setNote(""); setFile(null); setShowForm(false);
    } catch (err: any) {
      setErrorMsg(err?.message || "Erreur lors de l'envoi de la commande.");
    }
  };

  if (isLoading) return (
    <PublicLayout>
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Chargement du service...</p>
      </div>
    </PublicLayout>
  );

  if (!service) return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-700 mb-4">Service introuvable</h1>
        <Button asChild><Link href="/services">Retour aux services</Link></Button>
      </div>
    </PublicLayout>
  );

  const name = service.nameFr;
  const description = service.descriptionFr;
  const isSubmitting = createOrder.isPending || uploadFile.isPending;

  return (
    <PublicLayout>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-card/60 to-transparent" />

        <div className="container mx-auto px-4 pt-8 pb-0 relative">
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground mb-6">
            <Link href="/services"><ArrowLeft className="mr-2 h-4 w-4" /> Tous les services</Link>
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pb-16 items-center">
            {/* Image */}
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-muted relative shadow-2xl shadow-black/30">
                {service.imageUrl ? (
                  <>
                    <img src={service.imageUrl} alt={name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 via-muted to-muted/60">
                    <span className="font-display text-8xl font-800 text-primary/15">AN</span>
                  </div>
                )}
                {service.active ? (
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs font-600 backdrop-blur-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Disponible
                    </span>
                  </div>
                ) : null}
              </div>
            </motion.div>

            {/* Info panel */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="space-y-6">
              <div>
                <h1 className="font-display text-4xl md:text-5xl font-700 tracking-tight mb-4">{name}</h1>
                {description && <p className="text-muted-foreground leading-relaxed text-base">{description}</p>}
              </div>

              {/* Price card */}
              <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Prix par m²</div>
                    <div className="font-display font-800 text-4xl text-primary">
                      {pricePerM2.toLocaleString()}
                      <span className="text-base font-normal text-muted-foreground ml-1">DA/m²</span>
                    </div>
                    {user && (
                      <div className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/60 px-2 py-1 rounded-md">
                        <CheckCircle className="h-3 w-3 text-primary" />
                        Tarif {user.role === "subcontractor" ? "sous-traitant" : "client"} appliqué
                      </div>
                    )}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Calculator className="h-6 w-6 text-primary" />
                  </div>
                </div>

                {/* Benefits */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  {BENEFITS.map((b) => (
                    <div key={b.text} className="flex items-center gap-2 text-[12px] text-muted-foreground">
                      <b.icon className="h-3.5 w-3.5 text-primary shrink-0" />
                      {b.text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Success */}
              {successMsg && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-sm">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  {successMsg}
                </motion.div>
              )}

              {/* CTA buttons */}
              {user ? (
                <div className="flex flex-col gap-2.5">
                  <Button size="lg" className="h-12 font-600 shadow-lg shadow-primary/20" onClick={() => { setShowForm((v) => !v); setSuccessMsg(""); setErrorMsg(""); }}>
                    {showForm ? <><ChevronUp className="mr-2 h-4 w-4" /> Masquer le formulaire</> : <><ChevronDown className="mr-2 h-4 w-4" /> Commander maintenant</>}
                  </Button>
                  <Button size="lg" variant="outline" className="h-12 border-border/60 hover:border-primary/50" onClick={() => setLocation(`/dashboard/quotes/new?service=${service.id}`)}>
                    Demander un devis personnalisé
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  <Button size="lg" className="h-12 font-600 shadow-lg shadow-primary/20" asChild>
                    <Link href="/auth/register">Commander maintenant</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="h-12 border-border/60 hover:border-primary/50" asChild>
                    <Link href="/auth/login">Se connecter pour commander</Link>
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── INFO SECTIONS ── */}
      <section className="border-t border-border/30 bg-card/20 py-16">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
          {[
            { title: "Formats acceptés", items: ["PDF HD (300 DPI minimum)", "AI / Illustrator", "PSD (calques aplatis)", "PNG / JPG haute résolution", "EPS vectoriel"] },
            { title: "Finitions disponibles", items: ["Œillets toutes les 50cm", "Couture périphérique", "Mat ou brillant", "Plastification disponible", "Contre-collage possible"] },
            { title: "Délais & Livraison", items: ["Production : 24h à 72h", "Express disponible sur demande", "Livraison Alger même jour", "Envoi national via transporteur", "Retrait en atelier possible"] },
          ].map((block) => (
            <div key={block.title}>
              <h3 className="font-display font-600 text-base mb-4">{block.title}</h3>
              <ul className="space-y-2">
                {block.items.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── ORDER FORM ── */}
      <div className="container mx-auto px-4 py-10 max-w-4xl">
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
              <form onSubmit={handleSubmit} className="rounded-2xl border border-border/60 bg-card p-8 space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calculator className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="font-display text-xl font-700">Passer une commande</h2>
                </div>

                {/* Dimensions */}
                <div className="space-y-4">
                  <h3 className="font-600 text-sm text-muted-foreground uppercase tracking-wider">Dimensions du support</h3>
                  <div className="flex gap-3 items-end flex-wrap">
                    <div className="flex rounded-xl border border-border/60 overflow-hidden">
                      {(["cm", "m"] as Unit[]).map((u) => (
                        <button key={u} type="button" onClick={() => setUnit(u)}
                          className={`px-5 py-2.5 text-sm font-600 transition-colors ${unit === u ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/60"}`}>
                          {u}
                        </button>
                      ))}
                    </div>
                    <div className="flex-1 min-w-[110px]">
                      <label className="text-xs text-muted-foreground mb-1.5 block">Largeur ({unit})</label>
                      <input type="number" min="0.01" step="0.01" value={width} onChange={(e) => setWidth(e.target.value)}
                        placeholder={unit === "cm" ? "ex: 200" : "ex: 2"}
                        className="w-full px-3 py-2.5 rounded-xl border border-border/60 bg-background/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
                        data-testid="input-width" />
                    </div>
                    <span className="text-muted-foreground pb-2 font-600">×</span>
                    <div className="flex-1 min-w-[110px]">
                      <label className="text-xs text-muted-foreground mb-1.5 block">Hauteur ({unit})</label>
                      <input type="number" min="0.01" step="0.01" value={height} onChange={(e) => setHeight(e.target.value)}
                        placeholder={unit === "cm" ? "ex: 100" : "ex: 1"}
                        className="w-full px-3 py-2.5 rounded-xl border border-border/60 bg-background/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
                        data-testid="input-height" />
                    </div>
                  </div>

                  <AnimatePresence>
                    {areaM2 > 0 && (
                      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                        className="flex items-center justify-between bg-primary/6 border border-primary/20 rounded-xl px-5 py-4">
                        <div className="text-sm text-muted-foreground">
                          Surface: <span className="font-600 text-foreground">{areaM2.toFixed(2)} m²</span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground mb-0.5">Prix estimé</div>
                          <div className="font-display font-700 text-2xl text-primary">
                            {totalPrice.toLocaleString("fr-DZ", { maximumFractionDigits: 0 })} DA
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* File upload */}
                <div className="space-y-3">
                  <h3 className="font-600 text-sm text-muted-foreground uppercase tracking-wider">
                    Fichier d'impression{" "}
                    <span className="normal-case font-normal text-muted-foreground/60">
                      {service.requiresFileUpload ? "(requis)" : "(optionnel)"}
                    </span>
                  </h3>
                  {file ? (
                    <div className="flex items-center gap-3 border border-border/60 rounded-xl px-4 py-3.5 bg-muted/30">
                      <FileText className="h-5 w-5 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button type="button" onClick={() => setFile(null)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleFileDrop}
                      onClick={() => fileRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl px-6 py-10 text-center cursor-pointer transition-all ${isDragging ? "border-primary bg-primary/6 scale-[1.01]" : "border-border/50 hover:border-primary/40 hover:bg-muted/20"}`}>
                      <Upload className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
                      <p className="text-sm font-medium mb-1">Glisser-déposer ou cliquer</p>
                      <p className="text-xs text-muted-foreground">PDF, AI, PSD, PNG, JPG, EPS — max 50 MB</p>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept=".pdf,.ai,.psd,.png,.jpg,.jpeg,.tiff,.eps" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); }} data-testid="input-file" />
                </div>

                {/* Note */}
                <div className="space-y-2">
                  <label className="font-600 text-sm text-muted-foreground uppercase tracking-wider block">
                    Remarques <span className="normal-case font-normal text-muted-foreground/60">(optionnel)</span>
                  </label>
                  <textarea value={note} onChange={(e) => setNote(e.target.value)}
                    placeholder="Précisions sur la commande, couleurs, finitions..."
                    rows={3} data-testid="input-note"
                    className="w-full px-3.5 py-3 rounded-xl border border-border/60 bg-background/60 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all" />
                </div>

                {errorMsg && (
                  <div className="flex items-center gap-2 text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 text-sm">
                    <AlertCircle className="h-4 w-4 shrink-0" />{errorMsg}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button type="submit" size="lg" className="flex-1 h-11 font-600 shadow-lg shadow-primary/15" disabled={isSubmitting} data-testid="button-submit-order">
                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Envoi en cours...</> : "Confirmer la commande"}
                  </Button>
                  <Button type="button" size="lg" variant="outline" className="border-border/60" onClick={() => setShowForm(false)}>Annuler</Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── OTHER SERVICES ── */}
      <section className="border-t border-border/30 py-16 bg-card/20">
        <div className="container px-4 mx-auto">
          <h2 className="font-display font-600 text-xl mb-6">Autres services</h2>
          <div className="flex gap-3 flex-wrap">
            {[
              { label: "Bâche Publicitaire", href: "/services/bache-publicitaire" },
              { label: "Panneau Aluminium", href: "/services/panneau-aluminium" },
              { label: "Flyers & Dépliants", href: "/services/flyers-depliants" },
              { label: "Stickers & Adhésifs", href: "/services/stickers-adhesifs" },
            ].filter((s) => !s.href.includes(slug)).map((s) => (
              <Button key={s.href} variant="outline" size="sm" asChild className="border-border/60 hover:border-primary/50">
                <Link href={s.href}>{s.label}</Link>
              </Button>
            ))}
            <Button variant="outline" size="sm" asChild className="border-border/60 hover:border-primary/50">
              <Link href="/services">Voir tous les services</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
