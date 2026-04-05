import { PublicLayout } from "@/components/layouts/public-layout";
import { Link } from "wouter";
import { useListServiceCategories } from "@workspace/api-client-react";
import { useI18n } from "@/hooks/use-i18n";
import { motion } from "framer-motion";
import { ArrowUpRight, Loader2, Sparkles, Search, X } from "lucide-react";
import { useRef, useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ── per-category visual config ───────────────────────────────────────── */
const CAT: Record<string, {
  color: string;      // tailwind color class (text, border, bg)
  glow: string;       // glow overlay gradient
  orb1: string;       // primary orb color
  orb2: string;       // secondary orb color
  lines: string;      // line accent color
  badge: string;      // badge text bg
  accent: string;     // thin accent bar
}> = {
  "impression-bache": {
    color: "sky",
    glow: "from-sky-500/25 via-sky-500/8 to-transparent",
    orb1: "bg-sky-500/30",
    orb2: "bg-sky-300/15",
    lines: "border-sky-500/20",
    badge: "bg-sky-500/15 border-sky-500/25 text-sky-300",
    accent: "bg-sky-400",
  },
  "enseignes-signaletique": {
    color: "violet",
    glow: "from-violet-500/25 via-violet-500/8 to-transparent",
    orb1: "bg-violet-500/30",
    orb2: "bg-violet-300/15",
    lines: "border-violet-500/20",
    badge: "bg-violet-500/15 border-violet-500/25 text-violet-300",
    accent: "bg-violet-400",
  },
  "adhesifs-vitrophanie": {
    color: "emerald",
    glow: "from-emerald-500/25 via-emerald-500/8 to-transparent",
    orb1: "bg-emerald-500/30",
    orb2: "bg-emerald-300/15",
    lines: "border-emerald-500/20",
    badge: "bg-emerald-500/15 border-emerald-500/25 text-emerald-300",
    accent: "bg-emerald-400",
  },
  "roll-up-plv": {
    color: "amber",
    glow: "from-amber-500/25 via-amber-500/8 to-transparent",
    orb1: "bg-amber-500/30",
    orb2: "bg-amber-300/15",
    lines: "border-amber-500/20",
    badge: "bg-amber-500/15 border-amber-500/25 text-amber-300",
    accent: "bg-amber-400",
  },
  "impression-papier": {
    color: "rose",
    glow: "from-rose-500/25 via-rose-500/8 to-transparent",
    orb1: "bg-rose-500/30",
    orb2: "bg-rose-300/15",
    lines: "border-rose-500/20",
    badge: "bg-rose-500/15 border-rose-500/25 text-rose-300",
    accent: "bg-rose-400",
  },
};

const DEFAULT_CAT = {
  glow: "from-primary/20 via-primary/6 to-transparent",
  orb1: "bg-primary/25",
  orb2: "bg-primary/10",
  lines: "border-primary/20",
  badge: "bg-primary/15 border-primary/25 text-primary",
  accent: "bg-primary",
};

export default function Services() {
  const { language } = useI18n();
  const { data: categories, isLoading } = useListServiceCategories({ active: true });
  const heroRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");

  const sorted = [...(categories ?? [])].sort((a, b) => a.displayOrder - b.displayOrder);

  const displayList = useMemo(() => {
    if (!search.trim()) return sorted;
    const q = search.toLowerCase();
    return sorted.filter((c: any) =>
      (language === "ar" ? c.nameAr : c.nameFr)?.toLowerCase().includes(q) ||
      c.nameFr?.toLowerCase().includes(q) ||
      c.descriptionFr?.toLowerCase().includes(q)
    );
  }, [sorted, search, language]);

  const isSearching = search.trim().length > 0;
  const [featured, second, third, ...extra] = sorted;

  return (
    <PublicLayout>
      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative pt-6 pb-14 overflow-hidden">
        <div className="absolute -top-40 left-1/3 w-[700px] h-[400px] bg-primary/5 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[350px] h-[350px] bg-violet-500/4 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px section-divider" />

        <div className="container mx-auto px-4 sm:px-6">
          <motion.div initial="hidden" animate="visible" className="max-w-3xl">
            <motion.div variants={fadeUp} custom={0}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-600 tracking-widest uppercase mb-5">
              <Sparkles className="h-3 w-3" />
              Gamme complète de services
            </motion.div>

            <motion.h1 variants={fadeUp} custom={1}
              className="font-display text-5xl md:text-6xl lg:text-7xl font-900 tracking-tight leading-none mb-4">
              Nos<br />
              <span className="text-gradient">Expertises</span>
            </motion.h1>

            <motion.div variants={fadeUp} custom={2} className="h-[3px] w-14 bg-primary rounded-full mb-5" />

            <motion.p variants={fadeUp} custom={3}
              className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-2xl">
              De l'impression grand format aux enseignes lumineuses — chaque catégorie regroupe des services spécialisés, conçus pour des professionnels exigeants.
            </motion.p>
          </motion.div>

          <motion.div variants={fadeUp} custom={4} initial="hidden" animate="visible"
            className="flex flex-wrap items-center gap-8 mt-8 pt-8 border-t border-border/20">
            {[
              { value: `${sorted.length}`, label: "Catégories" },
              { value: "20+", label: "Services spécialisés" },
              { value: "48h", label: "Délai de production" },
            ].map((s) => (
              <div key={s.label} className="flex items-baseline gap-2">
                <span className="font-display text-2xl md:text-3xl font-900 text-primary tabular-nums">{s.value}</span>
                <span className="text-sm text-muted-foreground font-500">{s.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ SEARCH BAR ════════════════════════════════════════════════════ */}
      <div className="container mx-auto px-4 sm:px-6 mb-8">
        <div className="flex items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
            <Input
              placeholder="Rechercher un service ou catégorie…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="services-index-search"
              className="pl-10 h-10 border-border/60 bg-card/60"
            />
          </div>
          {search && (
            <Button variant="ghost" size="sm" onClick={() => setSearch("")} className="h-10 gap-1.5 text-muted-foreground">
              <X className="h-3.5 w-3.5" /> Effacer
            </Button>
          )}
        </div>
        {isSearching && (
          <p className="text-xs text-muted-foreground mt-2">
            {displayList.length} catégorie{displayList.length !== 1 ? "s" : ""} trouvée{displayList.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* ══ CATEGORY GRID ═════════════════════════════════════════════════ */}
      <section className="container mx-auto px-4 sm:px-6 pb-28">
        {isLoading ? (
          <div className="flex justify-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isSearching && displayList.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-muted-foreground mb-4">Aucun service ne correspond à « {search} ».</p>
            <Button variant="outline" onClick={() => setSearch("")}>Voir tous les services</Button>
          </div>
        ) : isSearching ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayList.map((cat: any, i: number) => (
              <motion.div key={cat.id} variants={fadeUp} initial="hidden" animate="visible" custom={i}>
                <Link href={`/services/${cat.slug}`}>
                  <CategoryCard cat={cat} index={i} language={language} size="medium" />
                </Link>
              </motion.div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <p className="text-center py-32 text-muted-foreground">Aucune catégorie disponible pour le moment.</p>
        ) : (
          <div className="space-y-4">
            {/* ── Row 1: Featured full-width ─────────────────────────── */}
            {featured && (
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
                <Link href={`/services/${featured.slug}`}>
                  <CategoryCard cat={featured} index={0} language={language} size="featured" />
                </Link>
              </motion.div>
            )}

            {/* ── Row 2: Two equal columns ────────────────────────────── */}
            {(second || third) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[second, third].filter(Boolean).map((cat, i) => (
                  <motion.div key={cat!.id} variants={fadeUp} initial="hidden" animate="visible" custom={i + 1}>
                    <Link href={`/services/${cat!.slug}`}>
                      <CategoryCard cat={cat!} index={i + 1} language={language} size="medium" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

            {/* ── Row 3+: Extra categories in 3-col ──────────────────── */}
            {extra.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {extra.map((cat, i) => (
                  <motion.div key={cat.id} variants={fadeUp} initial="hidden" animate="visible" custom={i + 3}>
                    <Link href={`/services/${cat.slug}`}>
                      <CategoryCard cat={cat} index={i + 3} language={language} size="compact" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ══ BOTTOM CTA ════════════════════════════════════════════════════ */}
      <section className="border-t border-border/30">
        <div className="container mx-auto px-4 sm:px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-muted-foreground text-xs font-600 mb-1 tracking-widest uppercase">Vous ne trouvez pas ce qu'il vous faut ?</p>
            <h2 className="font-display text-2xl font-700">Parlez-nous de votre projet.</h2>
          </div>
          <Link href="/contact">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-premium inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-600 text-sm"
            >
              Demander un devis
              <ArrowUpRight className="h-4 w-4" />
            </motion.button>
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   CategoryCard — premium editorial card
════════════════════════════════════════════════════════════════════════ */

type CardSize = "featured" | "medium" | "compact";

interface CategoryCardProps {
  cat: {
    id: number; slug: string; nameFr: string; nameAr: string;
    descriptionFr?: string | null; descriptionAr?: string | null;
    imageUrl?: string | null; displayOrder: number;
  };
  index: number;
  language: string;
  size: CardSize;
}

const HEIGHTS: Record<CardSize, string> = {
  featured: "h-[440px] md:h-[520px]",
  medium:   "h-[340px] md:h-[400px]",
  compact:  "h-[280px] md:h-[320px]",
};

const TITLE_SIZE: Record<CardSize, string> = {
  featured: "text-3xl md:text-5xl",
  medium:   "text-2xl md:text-3xl",
  compact:  "text-xl md:text-2xl",
};

function CategoryCard({ cat, index, language, size }: CategoryCardProps) {
  const name = language === "ar" ? cat.nameAr : cat.nameFr;
  const desc = language === "ar" ? cat.descriptionAr : cat.descriptionFr;
  const cfg = CAT[cat.slug] ?? DEFAULT_CAT;
  const num = String(index + 1).padStart(2, "0");

  return (
    <div className={`group relative overflow-hidden rounded-2xl cursor-pointer ${HEIGHTS[size]} border border-border/50 hover:border-border transition-all duration-500 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-black/20`}>

      {/* ── Background: image or premium placeholder ──────────────── */}
      {cat.imageUrl ? (
        <>
          <img
            src={cat.imageUrl}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          {/* layered gradient over image */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
          <div className={`absolute inset-0 bg-gradient-to-br ${cfg.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
        </>
      ) : (
        /* ── Rich no-image placeholder ─────────────────────────── */
        <>
          {/* base dark surface */}
          <div className="absolute inset-0 bg-[#080c14]" />

          {/* large ambient orb — top right */}
          <div className={`absolute -top-1/3 -right-1/4 w-3/4 h-3/4 ${cfg.orb1} rounded-full blur-[80px] group-hover:scale-110 transition-transform duration-700`} />

          {/* secondary orb — bottom left */}
          <div className={`absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 ${cfg.orb2} rounded-full blur-[60px]`} />

          {/* animated glow on hover */}
          <div className={`absolute inset-0 bg-gradient-to-br ${cfg.glow} opacity-40 group-hover:opacity-70 transition-opacity duration-500`} />

          {/* geometric grid lines */}
          <div className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />

          {/* diagonal accent lines — top right decoration */}
          <div className="absolute top-0 right-0 w-1/2 h-full overflow-hidden">
            {[0,1,2,3].map((i) => (
              <div
                key={i}
                className={`absolute border-t ${cfg.lines} opacity-40`}
                style={{
                  width: "160%",
                  top: `${20 + i * 22}%`,
                  right: 0,
                  transform: `rotate(-${18 + i * 3}deg)`,
                  transformOrigin: "right center",
                }}
              />
            ))}
          </div>

          {/* large decorative number — background accent */}
          <div className="absolute inset-0 flex items-center justify-end pr-8 overflow-hidden pointer-events-none">
            <span
              className="font-display font-900 leading-none select-none opacity-[0.04] group-hover:opacity-[0.07] transition-opacity duration-700"
              style={{
                fontSize: size === "featured" ? "240px" : size === "medium" ? "180px" : "140px",
                letterSpacing: "-0.04em",
              }}
            >
              {num}
            </span>
          </div>

          {/* bottom gradient for content readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </>
      )}

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 flex items-start justify-between p-5 md:p-6">
        {/* index badge */}
        <span className={`inline-flex items-center text-[10px] font-700 tracking-[0.2em] px-2.5 py-1 rounded-lg border backdrop-blur-sm ${cfg.badge}`}>
          {num}
        </span>

        {/* top-right: arrow preview (visible on hover) */}
        <div className={`w-8 h-8 rounded-full border border-white/15 bg-black/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-1 group-hover:translate-y-0`}>
          <ArrowUpRight className="h-3.5 w-3.5 text-white/70" />
        </div>
      </div>

      {/* ── Bottom content ──────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7">
        {/* accent line — animates width on hover */}
        <div className={`h-[2px] ${cfg.accent} rounded-full mb-4 w-8 group-hover:w-16 transition-all duration-500`} />

        {/* category label */}
        <p className="text-white/40 text-[10px] font-600 tracking-[0.25em] uppercase mb-2">
          Catégorie · {num}
        </p>

        {/* title */}
        <h3 className={`font-display font-800 tracking-tight text-white leading-tight mb-3 group-hover:text-white/90 transition-colors duration-300 ${TITLE_SIZE[size]}`}>
          {name}
        </h3>

        {/* description — only on featured & medium */}
        {desc && size !== "compact" && (
          <p className="text-white/50 text-sm leading-relaxed line-clamp-2 mb-4 max-w-lg group-hover:text-white/65 transition-colors duration-300">
            {desc}
          </p>
        )}

        {/* bottom row */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-white/30 font-500 tracking-widest uppercase">
            Voir les services
          </span>
          <motion.div
            className={`flex items-center gap-1.5 text-xs font-600 ${cfg.badge} px-3 py-1.5 rounded-lg border backdrop-blur-sm transition-all duration-300`}
          >
            Explorer
            <ArrowUpRight className="h-3 w-3" />
          </motion.div>
        </div>
      </div>

      {/* ── Edge highlight (top border glow) ────────────────────── */}
      <div className={`absolute top-0 left-0 right-0 h-px ${cfg.accent} opacity-0 group-hover:opacity-60 transition-opacity duration-500`} />
    </div>
  );
}
