import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  Calculator, ArrowRight, ShoppingCart, FileText,
  AlertCircle, Ruler, SquareIcon, Zap, UserCheck, X,
} from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { cn } from "@/lib/utils";

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
interface User { role: "visitor" | "client" | "subcontractor" | "admin"; }
interface PricingSimulatorProps { services: Service[]; user?: User | null; }
type Unit = "cm" | "m";

/* ── Helpers ────────────────────────────────────────────────────────────── */
function toMeters(v: number, u: Unit) { return u === "cm" ? v / 100 : v; }

function getPricePerM2(s: Service, role?: string) {
  if (role === "client") return s.clientPricePerM2;
  if (role === "subcontractor" || role === "admin") return s.subcontractorPricePerM2;
  return s.publicPricePerM2;
}

const ROLE_META: Record<string, { label: string; color: string }> = {
  client:        { label: "Tarif Client",       color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  subcontractor: { label: "Tarif Pro",          color: "text-violet-700  bg-violet-50  border-violet-200"  },
  admin:         { label: "Tarif Admin",        color: "text-amber-700   bg-amber-50   border-amber-200"   },
  visitor:       { label: "Tarif Visiteur",     color: "text-blue-700    bg-blue-50    border-blue-200"    },
};

/* ── Animated number ────────────────────────────────────────────────────── */
function AnimatedPrice({ value }: { value: number }) {
  const prevRef = useRef(value);
  useEffect(() => { prevRef.current = value; }, [value]);

  const formatted = value.toLocaleString("fr-DZ", { maximumFractionDigits: 0 });
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={Math.round(value)}
        initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="inline-block"
      >
        {formatted}
      </motion.span>
    </AnimatePresence>
  );
}

/* ── Dimension preview rectangle ────────────────────────────────────────── */
function DimensionPreview({ wm, hm }: { wm: number; hm: number }) {
  const maxW = 192, maxH = 128;
  const ratio = wm / hm;
  let pw: number, ph: number;
  if (ratio > maxW / maxH) { pw = maxW; ph = Math.max(28, Math.round(maxW / ratio)); }
  else { ph = maxH; pw = Math.max(28, Math.round(maxH * ratio)); }

  return (
    <div className="relative flex items-center justify-center py-4 select-none">
      <motion.div
        layout
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: pw, height: ph }}
        className="relative border border-primary/40 rounded-[3px] bg-primary/[0.06] overflow-hidden"
      >
        {/* subtle grid */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: [
              "repeating-linear-gradient(0deg,hsl(var(--primary)/0.35) 0 1px,transparent 1px 100%)",
              "repeating-linear-gradient(90deg,hsl(var(--primary)/0.35) 0 1px,transparent 1px 100%)",
            ].join(","),
            backgroundSize: "24px 24px",
          }}
        />
        {/* corner marks */}
        {[["top-0 left-0","border-t-2 border-l-2"],["top-0 right-0","border-t-2 border-r-2"],["bottom-0 left-0","border-b-2 border-l-2"],["bottom-0 right-0","border-b-2 border-r-2"]].map(([pos,cls]) => (
          <div key={pos} className={cn("absolute w-3 h-3 border-primary/70", pos, cls)} />
        ))}
      </motion.div>
      {/* Width label */}
      <div className="absolute left-1/2 -translate-x-1/2"
        style={{ top: `calc(50% + ${ph / 2}px + 6px)` }}>
        <span className="text-[10px] font-600 text-primary/70 tabular-nums">{wm.toFixed(2)} m</span>
      </div>
      {/* Height label */}
      <div className="absolute top-1/2 -translate-y-1/2"
        style={{ left: `calc(50% + ${pw / 2}px + 6px)` }}>
        <span className="text-[10px] font-600 text-primary/70 tabular-nums"
          style={{ writingMode: "vertical-rl" }}>
          {hm.toFixed(2)} m
        </span>
      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────────── */
export function PricingSimulator({ services, user }: PricingSimulatorProps) {
  const { language } = useI18n();
  const [selectedId, setSelectedId] = useState<number>(services[0]?.id ?? 0);
  const [width, setWidth]   = useState("");
  const [height, setHeight] = useState("");
  const [unit, setUnit]     = useState<Unit>("cm");

  const selectedService = services.find(s => s.id === selectedId) ?? null;
  const serviceName     = (s: Service) => language === "ar" ? s.nameAr : s.nameFr;
  const roleMeta        = ROLE_META[user?.role ?? "visitor"];

  const calc = useMemo(() => {
    if (!selectedService) return null;
    const w = parseFloat(width), h = parseFloat(height);
    if (!w || !h || w <= 0 || h <= 0) return null;
    const wm = toMeters(w, unit), hm = toMeters(h, unit);
    const area = wm * hm;
    const pricePerM2 = getPricePerM2(selectedService, user?.role);
    return { wm, hm, area, pricePerM2, total: area * pricePerM2 };
  }, [selectedService, width, height, unit, user]);

  const wError = width  && (isNaN(parseFloat(width))  || parseFloat(width)  <= 0) ? true : false;
  const hError = height && (isNaN(parseFloat(height)) || parseFloat(height) <= 0) ? true : false;

  return (
    <div className="relative rounded-3xl border border-border bg-card overflow-hidden shadow-xl">
      {/* ambient glow */}
      <div className="pointer-events-none absolute -top-32 -left-20 w-[500px] h-[300px] bg-primary/[0.07] rounded-full blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 w-[400px] h-[260px] bg-primary/[0.05] rounded-full blur-[100px]" />

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="relative flex flex-wrap items-center justify-between gap-4 px-6 md:px-8 py-5 border-b border-border/60 bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/10">
            <Calculator className="h-4.5 w-4.5 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-base font-700 tracking-tight text-foreground">
              Simulateur de tarif
            </h2>
            <p className="text-[11px] text-muted-foreground/70 font-500 mt-px">
              Calcul instantané • Sans engagement
            </p>
          </div>
        </div>
        {/* Role badge */}
        <div className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-600",
          roleMeta.color
        )}>
          <UserCheck className="h-3 w-3" />
          {roleMeta.label}
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_1px_1fr] gap-0">

        {/* LEFT — Inputs */}
        <div className="p-6 md:p-8 space-y-6">

          {/* Service selector */}
          <div>
            <label className="block text-[10px] font-700 uppercase tracking-[0.12em] text-muted-foreground/60 mb-2.5">
              Service
            </label>
            <div className="relative group">
              <select
                value={selectedId}
                onChange={e => setSelectedId(Number(e.target.value))}
                className={cn(
                  "w-full appearance-none rounded-xl px-4 py-3 text-sm font-500 text-foreground",
                  "bg-background border border-border",
                  "hover:border-primary/40 focus:border-primary/60 focus:outline-none",
                  "transition-all duration-200 cursor-pointer pr-10"
                )}
              >
                {services.map(s => (
                  <option key={s.id} value={s.id}>
                    {serviceName(s)}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex flex-col gap-[2px]">
                <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-b-[4px] border-l-transparent border-r-transparent border-b-muted-foreground/50" />
                <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-muted-foreground/50" />
              </div>
            </div>
          </div>

          {/* Unit pill toggle */}
          <div>
            <label className="block text-[10px] font-700 uppercase tracking-[0.12em] text-muted-foreground/60 mb-2.5">
              Unité de mesure
            </label>
            <div className="relative flex rounded-xl bg-muted/40 border border-border p-1 gap-1">
              {(["cm", "m"] as Unit[]).map(u => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  className="relative flex-1 rounded-lg py-2.5 text-sm font-600 transition-colors duration-200 z-10"
                  style={{ color: unit === u ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))" }}
                >
                  {unit === u && (
                    <motion.div
                      layoutId="unit-pill"
                      className="absolute inset-0 rounded-lg bg-primary shadow-lg shadow-primary/25"
                      transition={{ type: "spring", damping: 20, stiffness: 300 }}
                    />
                  )}
                  <span className="relative z-10">{u === "cm" ? "Centimètres (cm)" : "Mètres (m)"}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dimension inputs */}
          <div>
            <label className="block text-[10px] font-700 uppercase tracking-[0.12em] text-muted-foreground/60 mb-2.5">
              Dimensions
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Largeur", val: width, set: setWidth, err: wError, ph: unit === "cm" ? "200" : "2.00" },
                { label: "Hauteur", val: height, set: setHeight, err: hError, ph: unit === "cm" ? "100" : "1.00" },
              ].map(({ label, val, set, err, ph }) => (
                <div key={label}>
                  <div className="text-[10px] text-muted-foreground/50 font-500 mb-1.5">{label}</div>
                  <div className="relative">
                    <input
                      type="number" min="0.01" step="0.01"
                      value={val}
                      onChange={e => set(e.target.value)}
                      placeholder={ph}
                      className={cn(
                        "w-full rounded-xl px-4 py-3 text-sm font-500 pr-10",
                        "bg-background border text-foreground",
                        "placeholder:text-muted-foreground/30",
                        "focus:outline-none transition-all duration-200",
                        err
                          ? "border-red-400 focus:border-red-500"
                          : "border-border hover:border-primary/40 focus:border-primary/60"
                      )}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-600 text-muted-foreground/40">
                      {unit}
                    </span>
                  </div>
                  {err && (
                    <p className="text-red-400 text-[11px] mt-1.5 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      Valeur invalide
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Dimension preview + stats */}
          <AnimatePresence>
            {calc && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="rounded-xl border border-border bg-muted/20 overflow-hidden">
                  <DimensionPreview wm={calc.wm} hm={calc.hm} />
                  <div className="grid grid-cols-2 divide-x divide-border/60 border-t border-border/60">
                    <div className="flex items-center gap-2.5 px-4 py-2.5">
                      <Ruler className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                      <div>
                        <div className="text-[9px] font-600 uppercase tracking-widest text-muted-foreground/40">Format</div>
                        <div className="text-xs font-600 tabular-nums text-foreground/80 mt-px">
                          {calc.wm.toFixed(2)} × {calc.hm.toFixed(2)} m
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 px-4 py-2.5">
                      <SquareIcon className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                      <div>
                        <div className="text-[9px] font-600 uppercase tracking-widest text-muted-foreground/40">Surface</div>
                        <div className="text-xs font-600 tabular-nums text-foreground/80 mt-px">
                          {calc.area.toFixed(4)} m²
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Vertical divider */}
        <div className="hidden lg:block w-px bg-border/60 self-stretch" />

        {/* RIGHT — Result */}
        <div className="p-6 md:p-8 flex flex-col">
          <AnimatePresence mode="wait">
            {calc ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col flex-1 gap-5"
              >
                {/* Calculation breakdown */}
                <div className="rounded-xl border border-border bg-muted/20 overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-border/60 flex items-center gap-2">
                    <Zap className="h-3 w-3 text-primary/70" />
                    <span className="text-[10px] font-700 uppercase tracking-[0.12em] text-muted-foreground/50">
                      Détail du calcul
                    </span>
                  </div>
                  <div className="divide-y divide-border/50">
                    {[
                      { label: "Surface calculée", value: `${calc.area.toFixed(4)} m²` },
                      { label: `Prix au m² (${roleMeta.label})`, value: `${calc.pricePerM2.toLocaleString("fr-DZ")} DA` },
                    ].map(row => (
                      <div key={row.label} className="flex items-center justify-between px-4 py-3">
                        <span className="text-xs text-muted-foreground/60 font-500">{row.label}</span>
                        <span className="text-sm font-600 text-foreground/80 tabular-nums">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price hero */}
                <div className="relative rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/[0.05] to-transparent overflow-hidden flex-1 flex flex-col items-center justify-center py-8 px-6">
                  {/* glow */}
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/20 rounded-full blur-[60px] pointer-events-none" />
                  <div className="relative text-center">
                    <div className="text-[10px] font-700 uppercase tracking-[0.18em] text-primary/70 mb-3">
                      Estimation totale
                    </div>
                    <div className="font-display font-900 leading-none text-primary mb-2"
                      style={{ fontSize: "clamp(2.4rem, 6vw, 3.5rem)" }}>
                      <AnimatedPrice value={calc.total} />
                    </div>
                    <div className="text-sm font-500 text-muted-foreground/60 tracking-wide">
                      dinars algériens
                    </div>
                  </div>
                </div>

                {/* CTAs */}
                <div className="space-y-2.5">
                  <Link href={`/dashboard/orders/new?serviceId=${selectedId}`}>
                    <motion.div
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.985 }}
                      className="btn-premium w-full inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl font-600 text-sm cursor-pointer"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Commander maintenant
                      <ArrowRight className="h-4 w-4 ml-auto" />
                    </motion.div>
                  </Link>
                  <Link href={`/dashboard/quotes/new?serviceId=${selectedId}`}>
                    <motion.div
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.985 }}
                      className={cn(
                        "w-full inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl font-600 text-sm cursor-pointer",
                        "border border-border text-muted-foreground",
                        "hover:border-primary/30 hover:text-foreground hover:bg-primary/[0.04]",
                        "transition-all duration-200"
                      )}
                    >
                      <FileText className="h-4 w-4" />
                      Demander un devis
                    </motion.div>
                  </Link>
                </div>

                <p className="text-[10px] text-muted-foreground/40 text-center leading-relaxed">
                  * Estimation indicative hors finitions et pose.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center min-h-[320px] rounded-2xl border border-dashed border-border p-8 text-center gap-4"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center">
                    <Calculator className="h-7 w-7 text-muted-foreground/25" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                    <ArrowRight className="h-3 w-3 text-primary/60" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-600 text-foreground/40 mb-1">
                    Entrez vos dimensions
                  </p>
                  <p className="text-xs text-muted-foreground/30 max-w-[180px] leading-relaxed">
                    Le prix s'affichera ici en temps réel
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground/25 font-500">
                  <span className="px-2 py-1 rounded-md bg-muted border border-border">Largeur</span>
                  <X className="h-3 w-3" />
                  <span className="px-2 py-1 rounded-md bg-muted border border-border">Hauteur</span>
                  <span className="mx-1 text-muted-foreground/20">=</span>
                  <span className="px-2 py-1 rounded-md bg-primary/[0.08] border border-primary/20 text-primary/50">Prix</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
