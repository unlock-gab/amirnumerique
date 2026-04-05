import { PublicLayout } from "@/components/layouts/public-layout";
import { Link } from "wouter";
import { useListServiceCategories } from "@workspace/api-client-react";
import { useI18n } from "@/hooks/use-i18n";
import { motion } from "framer-motion";
import { ArrowUpRight, Loader2, Sparkles } from "lucide-react";
import { useRef } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.65, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const CATEGORY_GRADIENT: Record<string, string> = {
  "impression-bache": "from-sky-900/80 via-background/60 to-background",
  "enseignes-signaletique": "from-violet-900/80 via-background/60 to-background",
  "adhesifs-vitrophanie": "from-emerald-900/80 via-background/60 to-background",
  "roll-up-plv": "from-amber-900/80 via-background/60 to-background",
  "impression-papier": "from-rose-900/80 via-background/60 to-background",
};

const CATEGORY_ACCENT: Record<string, string> = {
  "impression-bache": "bg-sky-400",
  "enseignes-signaletique": "bg-violet-400",
  "adhesifs-vitrophanie": "bg-emerald-400",
  "roll-up-plv": "bg-amber-400",
  "impression-papier": "bg-rose-400",
};

const CATEGORY_LETTER_BG: Record<string, string> = {
  "impression-bache": "from-sky-600/20 to-sky-800/10",
  "enseignes-signaletique": "from-violet-600/20 to-violet-800/10",
  "adhesifs-vitrophanie": "from-emerald-600/20 to-emerald-800/10",
  "roll-up-plv": "from-amber-600/20 to-amber-800/10",
  "impression-papier": "from-rose-600/20 to-rose-800/10",
};

export default function Services() {
  const { language } = useI18n();
  const { data: categories, isLoading } = useListServiceCategories({ active: true });
  const heroRef = useRef<HTMLDivElement>(null);

  const sorted = [...(categories ?? [])].sort((a, b) => a.displayOrder - b.displayOrder);
  const [featured, ...rest] = sorted;

  return (
    <PublicLayout>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative pt-6 pb-16 overflow-hidden">
        {/* ambient orbs */}
        <div className="absolute -top-32 left-1/4 w-[600px] h-[400px] bg-primary/6 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-violet-500/4 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px section-divider" />

        <div className="container mx-auto px-4 sm:px-6">
          <motion.div initial="hidden" animate="visible" className="max-w-3xl">
            <motion.div variants={fadeUp} custom={0}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-600 tracking-widest uppercase mb-6">
              <Sparkles className="h-3 w-3" />
              Gamme complète de services
            </motion.div>

            <motion.h1 variants={fadeUp} custom={1}
              className="font-display text-5xl md:text-6xl lg:text-7xl font-900 tracking-tight leading-none mb-5">
              Nos
              <br />
              <span className="text-gradient">Expertises</span>
            </motion.h1>

            <motion.div variants={fadeUp} custom={2} className="h-[3px] w-16 bg-primary rounded-full mb-6" />

            <motion.p variants={fadeUp} custom={3}
              className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-xl">
              De l'impression grand format aux enseignes lumineuses — chaque catégorie regroupe des services spécialisés, conçus pour des professionnels exigeants.
            </motion.p>
          </motion.div>

          {/* stat row */}
          <motion.div variants={fadeUp} custom={4} initial="hidden" animate="visible"
            className="flex flex-wrap items-center gap-8 mt-10">
            {[
              { value: `${sorted.length}`, label: "Catégories" },
              { value: "20+", label: "Services spécialisés" },
              { value: "48h", label: "Délai de production" },
            ].map((s) => (
              <div key={s.label} className="flex items-baseline gap-2">
                <span className="font-display text-3xl font-900 text-primary">{s.value}</span>
                <span className="text-sm text-muted-foreground font-500">{s.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Category Showcase ─────────────────────────────────── */}
      <section className="container mx-auto px-4 sm:px-6 pb-28 space-y-5">
        {isLoading ? (
          <div className="flex justify-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : sorted.length === 0 ? (
          <p className="text-center py-32 text-muted-foreground">Aucune catégorie disponible pour le moment.</p>
        ) : (
          <>
            {/* ── Featured card (first category, full-width tall) ── */}
            {featured && (
              <motion.div
                variants={fadeUp} initial="hidden" animate="visible" custom={0}
              >
                <Link href={`/services/${featured.slug}`}>
                  <CategoryCard
                    cat={featured}
                    index={0}
                    language={language}
                    size="featured"
                  />
                </Link>
              </motion.div>
            )}

            {/* ── 2-column row (categories 2 & 3) ── */}
            {rest.length >= 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {rest.slice(0, 2).map((cat, i) => (
                  <motion.div key={cat.id} variants={fadeUp} initial="hidden" animate="visible" custom={i + 1}>
                    <Link href={`/services/${cat.slug}`}>
                      <CategoryCard cat={cat} index={i + 1} language={language} size="medium" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

            {/* ── 3-column row (categories 4, 5, 6…) ── */}
            {rest.length > 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {rest.slice(2).map((cat, i) => (
                  <motion.div key={cat.id} variants={fadeUp} initial="hidden" animate="visible" custom={i + 3}>
                    <Link href={`/services/${cat.slug}`}>
                      <CategoryCard cat={cat} index={i + 3} language={language} size="compact" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* ── Bottom CTA strip ─────────────────────────────────── */}
      <section className="border-t border-border/30">
        <div className="container mx-auto px-4 sm:px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-muted-foreground text-sm font-500 mb-1 tracking-wide uppercase">Vous ne trouvez pas ce qu'il vous faut ?</p>
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

/* ─── Category Card component ─────────────────────────────────────────── */

type CardSize = "featured" | "medium" | "compact";

interface CategoryCardProps {
  cat: { id: number; slug: string; nameFr: string; nameAr: string; descriptionFr?: string | null; descriptionAr?: string | null; imageUrl?: string | null; displayOrder: number };
  index: number;
  language: string;
  size: CardSize;
}

const HEIGHTS: Record<CardSize, string> = {
  featured: "h-[480px] md:h-[560px]",
  medium: "h-[360px] md:h-[420px]",
  compact: "h-[300px] md:h-[340px]",
};

function CategoryCard({ cat, index, language, size }: CategoryCardProps) {
  const name = language === "ar" ? cat.nameAr : cat.nameFr;
  const desc = language === "ar" ? cat.descriptionAr : cat.descriptionFr;
  const gradient = CATEGORY_GRADIENT[cat.slug] ?? "from-background/90 via-background/70 to-background/30";
  const accent = CATEGORY_ACCENT[cat.slug] ?? "bg-primary";
  const letterBg = CATEGORY_LETTER_BG[cat.slug] ?? "from-primary/20 to-primary/10";
  const num = String(index + 1).padStart(2, "0");

  return (
    <div className={`group relative overflow-hidden rounded-2xl cursor-pointer ${HEIGHTS[size]} bg-card border border-border/30 hover:border-primary/30 transition-all duration-500`}>

      {/* background image / placeholder */}
      {cat.imageUrl ? (
        <>
          <img
            src={cat.imageUrl}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </>
      ) : (
        <>
          {/* gradient placeholder */}
          <div className={`absolute inset-0 bg-gradient-to-br ${letterBg}`} />
          {/* decorative large initial letter */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            <span
              className="font-display text-[220px] font-900 leading-none select-none text-primary/6 group-hover:text-primary/10 transition-colors duration-700"
              style={{ letterSpacing: "-0.05em" }}
            >
              {name.charAt(0)}
            </span>
          </div>
          {/* bottom gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent" />
        </>
      )}

      {/* subtle grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      {/* hover glow */}
      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/4 transition-colors duration-500 rounded-2xl" />

      {/* number badge — top left */}
      <div className="absolute top-5 left-5">
        <span className="inline-block font-display text-xs font-700 tracking-[0.2em] text-muted-foreground/60 bg-background/60 backdrop-blur-sm border border-border/30 px-3 py-1.5 rounded-lg">
          {num}
        </span>
      </div>

      {/* accent dot — top right */}
      <div className={`absolute top-5 right-5 w-2.5 h-2.5 rounded-full ${accent} opacity-80 group-hover:opacity-100 transition-opacity`} />

      {/* content — bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
        {/* accent line */}
        <div className={`h-[2px] w-8 ${accent} rounded-full mb-4 group-hover:w-14 transition-all duration-500`} />

        <h3 className={`font-display font-800 tracking-tight text-white leading-tight mb-2 group-hover:text-primary/90 transition-colors duration-300 ${size === "featured" ? "text-3xl md:text-4xl" : size === "medium" ? "text-2xl md:text-3xl" : "text-xl md:text-2xl"}`}>
          {name}
        </h3>

        {desc && size !== "compact" && (
          <p className="text-white/60 text-sm leading-relaxed line-clamp-2 max-w-xl mb-5">
            {desc}
          </p>
        )}

        {/* bottom row */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/40 font-500 tracking-widest uppercase">
            Plusieurs services disponibles
          </span>
          <div className="w-9 h-9 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-300">
            <ArrowUpRight className="h-4 w-4 text-white group-hover:text-primary-foreground transition-colors duration-300" />
          </div>
        </div>
      </div>
    </div>
  );
}
