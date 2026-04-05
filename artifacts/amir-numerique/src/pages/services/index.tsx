import { PublicLayout } from "@/components/layouts/public-layout";
import { Link } from "wouter";
import { useListServiceCategories } from "@workspace/api-client-react";
import { useI18n } from "@/hooks/use-i18n";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Layers } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] } }),
};

const CATEGORY_ICONS: Record<string, string> = {
  "impression-bache": "🏗",
  "enseignes-signaletique": "✨",
  "adhesifs-vitrophanie": "🪟",
  "roll-up-plv": "📋",
  "impression-papier": "📄",
};

export default function Services() {
  const { language } = useI18n();
  const { data: categories, isLoading } = useListServiceCategories({ active: true });

  return (
    <PublicLayout>
      {/* Header */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-card/60 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-px section-divider" />
        <div className="container relative mx-auto px-4">
          <motion.div initial="hidden" animate="visible" className="max-w-2xl">
            <motion.span variants={fadeUp} custom={0}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-600 tracking-wide mb-5">
              <Layers className="h-3 w-3" />
              Catalogue de services
            </motion.span>
            <motion.h1 variants={fadeUp} custom={1} className="font-display text-4xl md:text-5xl font-800 tracking-tight mb-4">
              Nos <span className="text-gradient">Services</span>
            </motion.h1>
            <div className="h-0.5 w-12 bg-primary rounded-full mb-5" />
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-lg leading-relaxed">
              Impression grand format, signalétique, adhésifs et bien plus — découvrez toutes nos gammes de services professionnels.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Categories grid */}
      <section className="container mx-auto px-4 pb-24">
        {isLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !categories || categories.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            Aucune catégorie disponible pour le moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, i) => {
              const name = language === "ar" ? cat.nameAr : cat.nameFr;
              const desc = language === "ar" ? cat.descriptionAr : cat.descriptionFr;
              return (
                <motion.div
                  key={cat.id}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={i}
                  className="group"
                >
                  <Link href={`/services/${cat.slug}`} className="block h-full">
                    <div className="card-premium h-full overflow-hidden cursor-pointer">
                      {/* Image / placeholder */}
                      <div className="aspect-[16/9] overflow-hidden relative bg-muted/40">
                        {cat.imageUrl ? (
                          <>
                            <img
                              src={cat.imageUrl}
                              alt={name}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/20 to-transparent" />
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/80 to-muted/40">
                            <span className="font-display text-6xl font-900 text-primary/12 group-hover:text-primary/22 transition-colors duration-500 select-none">
                              {name.charAt(0)}
                            </span>
                          </div>
                        )}
                        {/* Category order badge */}
                        <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-background/80 backdrop-blur-sm border border-border/40 text-[10px] font-600 text-muted-foreground tracking-widest uppercase">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                        </div>
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-500" />
                      </div>

                      {/* Content */}
                      <div className="p-6 space-y-3">
                        <h3 className="font-display font-700 text-xl group-hover:text-primary transition-colors duration-200 leading-tight">
                          {name}
                        </h3>
                        {desc && (
                          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">{desc}</p>
                        )}
                        <div className="flex items-center justify-between pt-3 border-t border-border/30">
                          <span className="text-xs text-muted-foreground/70 font-500 tracking-wide uppercase">
                            Voir les services
                          </span>
                          <div className="w-8 h-8 rounded-full bg-muted/60 group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center transition-all duration-300">
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
