import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Calculator, ChevronDown, ArrowRight, ShoppingCart, FileText, AlertCircle, Ruler, SquareIcon } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";

/* ── Types ─────────────────────────────────────────────────────────────── */
interface Service {
  id: number;
  slug: string;
  nameFr: string;
  nameAr: string;
  publicPricePerM2: number;
  clientPricePerM2: number;
  subcontractorPricePerM2: number;
}

interface User {
  role: "visitor" | "client" | "subcontractor" | "admin";
}

interface PricingSimulatorProps {
  services: Service[];
  user?: User | null;
}

type Unit = "cm" | "m";

/* ── Utility ────────────────────────────────────────────────────────────── */
function toMeters(value: number, unit: Unit): number {
  return unit === "cm" ? value / 100 : value;
}

function getPricePerM2(service: Service, role?: string): number {
  if (role === "client") return service.clientPricePerM2;
  if (role === "subcontractor" || role === "admin") return service.subcontractorPricePerM2;
  return service.publicPricePerM2;
}

function getRoleLabel(role?: string): string {
  if (role === "client") return "Client enregistré";
  if (role === "subcontractor") return "Sous-traitant";
  if (role === "admin") return "Admin";
  return "Visiteur";
}

/* ── Component ──────────────────────────────────────────────────────────── */
export function PricingSimulator({ services, user }: PricingSimulatorProps) {
  const { language } = useI18n();
  const [selectedId, setSelectedId] = useState<number | "">(services[0]?.id ?? "");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [unit, setUnit] = useState<Unit>("cm");

  const selectedService = services.find((s) => s.id === selectedId) ?? null;

  /* ── Calculation ───────────────────────────────────────────────────── */
  const calc = useMemo(() => {
    if (!selectedService) return null;
    const w = parseFloat(width);
    const h = parseFloat(height);
    if (!w || !h || w <= 0 || h <= 0) return null;

    const wm = toMeters(w, unit);
    const hm = toMeters(h, unit);
    const area = wm * hm;
    const pricePerM2 = getPricePerM2(selectedService, user?.role);
    const total = area * pricePerM2;

    return { wm, hm, area, pricePerM2, total };
  }, [selectedService, width, height, unit, user]);

  /* ── Validation ────────────────────────────────────────────────────── */
  const wNum = parseFloat(width);
  const hNum = parseFloat(height);
  const wError = width && (isNaN(wNum) || wNum <= 0) ? "Valeur invalide" : null;
  const hError = height && (isNaN(hNum) || hNum <= 0) ? "Valeur invalide" : null;

  const serviceName = (s: Service) => language === "ar" ? s.nameAr : s.nameFr;

  return (
    <div className="rounded-3xl border border-border/40 bg-card overflow-hidden shadow-2xl shadow-black/20">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="px-6 md:px-8 pt-7 pb-5 border-b border-border/30 bg-gradient-to-r from-primary/6 via-transparent to-transparent">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
            <Calculator className="h-4.5 w-4.5 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-lg font-700 tracking-tight">Simulateur de tarif</h2>
            <p className="text-xs text-muted-foreground font-500">
              Estimation instantanée &mdash; Tarif <span className="text-primary font-600">{getRoleLabel(user?.role)}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── LEFT: Inputs ─────────────────────────────────────────── */}
        <div className="space-y-5">
          {/* Service selector */}
          <div>
            <label className="block text-xs font-600 text-muted-foreground uppercase tracking-widest mb-2">
              Service
            </label>
            <div className="relative">
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(Number(e.target.value))}
                className="w-full appearance-none bg-background border border-border/60 hover:border-primary/40 focus:border-primary focus:outline-none rounded-xl px-4 py-3 text-sm font-500 text-foreground transition-colors pr-10 cursor-pointer"
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {serviceName(s)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Unit switcher */}
          <div>
            <label className="block text-xs font-600 text-muted-foreground uppercase tracking-widest mb-2">
              Unité
            </label>
            <div className="flex gap-2">
              {(["cm", "m"] as Unit[]).map((u) => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-600 border transition-all duration-200 ${
                    unit === u
                      ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                      : "bg-background border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {u === "cm" ? "Centimètres (cm)" : "Mètres (m)"}
                </button>
              ))}
            </div>
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-2 gap-4">
            {/* Width */}
            <div>
              <label className="block text-xs font-600 text-muted-foreground uppercase tracking-widest mb-2">
                Largeur ({unit})
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  placeholder={unit === "cm" ? "ex: 200" : "ex: 2"}
                  className={`w-full bg-background border rounded-xl px-4 py-3 text-sm font-500 text-foreground placeholder:text-muted-foreground/40 focus:outline-none transition-colors ${
                    wError ? "border-red-500/60 focus:border-red-500" : "border-border/60 hover:border-primary/40 focus:border-primary"
                  }`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/50 font-500">{unit}</span>
              </div>
              {wError && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{wError}</p>}
            </div>

            {/* Height */}
            <div>
              <label className="block text-xs font-600 text-muted-foreground uppercase tracking-widest mb-2">
                Hauteur ({unit})
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder={unit === "cm" ? "ex: 100" : "ex: 1"}
                  className={`w-full bg-background border rounded-xl px-4 py-3 text-sm font-500 text-foreground placeholder:text-muted-foreground/40 focus:outline-none transition-colors ${
                    hError ? "border-red-500/60 focus:border-red-500" : "border-border/60 hover:border-primary/40 focus:border-primary"
                  }`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/50 font-500">{unit}</span>
              </div>
              {hError && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{hError}</p>}
            </div>
          </div>

          {/* Info row */}
          {calc && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 gap-3"
            >
              <div className="flex items-center gap-2.5 rounded-xl bg-muted/40 border border-border/30 px-3.5 py-2.5">
                <Ruler className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <div>
                  <div className="text-[10px] text-muted-foreground font-500 uppercase tracking-wider">Dimensions</div>
                  <div className="text-sm font-600 tabular-nums">{calc.wm.toFixed(2)}m × {calc.hm.toFixed(2)}m</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl bg-muted/40 border border-border/30 px-3.5 py-2.5">
                <SquareIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <div>
                  <div className="text-[10px] text-muted-foreground font-500 uppercase tracking-wider">Surface</div>
                  <div className="text-sm font-600 tabular-nums">{calc.area.toFixed(4)} m²</div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* ── RIGHT: Result ─────────────────────────────────────────── */}
        <div className="flex flex-col">
          <AnimatePresence mode="wait">
            {calc ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col flex-1"
              >
                {/* Price breakdown card */}
                <div className="flex-1 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/8 via-primary/4 to-transparent p-6 mb-4 relative overflow-hidden">
                  {/* ambient glow */}
                  <div className="absolute -top-8 -right-8 w-32 h-32 bg-primary/15 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative">
                    {/* Unit price */}
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-primary/15">
                      <span className="text-xs text-muted-foreground font-600 uppercase tracking-wider">Prix / m²</span>
                      <span className="font-display text-base font-700 text-foreground tabular-nums">
                        {calc.pricePerM2.toLocaleString("fr-DZ")} DA
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-primary/15">
                      <span className="text-xs text-muted-foreground font-600 uppercase tracking-wider">Surface</span>
                      <span className="font-display text-base font-700 text-foreground tabular-nums">
                        {calc.area.toFixed(4)} m²
                      </span>
                    </div>

                    {/* Total */}
                    <div className="text-center pt-2">
                      <p className="text-xs text-primary font-600 uppercase tracking-widest mb-2">Prix estimé total</p>
                      <div className="font-display text-4xl md:text-5xl font-900 text-primary leading-none tabular-nums mb-1">
                        {calc.total.toLocaleString("fr-DZ", { maximumFractionDigits: 0 })}
                      </div>
                      <div className="text-sm text-muted-foreground font-500">dinars algériens</div>
                    </div>
                  </div>
                </div>

                {/* CTAs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link href={`/dashboard/orders/new?serviceId=${selectedId}`}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="btn-premium w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-600 text-sm"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Commander
                    </motion.button>
                  </Link>
                  <Link href={`/dashboard/quotes/new?serviceId=${selectedId}`}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-600 text-sm border border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all"
                    >
                      <FileText className="h-4 w-4" />
                      Demander un devis
                    </motion.button>
                  </Link>
                </div>

                <p className="text-[11px] text-muted-foreground/60 text-center mt-3 leading-relaxed">
                  * Estimation indicative hors finitions et pose. Contactez-nous pour un devis précis.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/40 p-8 text-center min-h-[240px]"
              >
                <div className="w-14 h-14 rounded-2xl bg-muted/40 border border-border/30 flex items-center justify-center mb-4">
                  <Calculator className="h-6 w-6 text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground font-500 mb-1">Entrez les dimensions</p>
                <p className="text-xs text-muted-foreground/50">Le prix s'affichera ici en temps réel</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
