import { PublicLayout } from "@/components/layouts/public-layout";
import { useListPortfolio } from "@workspace/api-client-react";
import { useI18n } from "@/hooks/use-i18n";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Loader2, Award, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const CATEGORIES = [
  { key: undefined, label: "Tout voir" },
  { key: "enseigne", label: "Enseignes" },
  { key: "vehicule", label: "Véhicules" },
  { key: "evenement", label: "Événementiel" },
  { key: "vitrophanie", label: "Vitrophanie" },
  { key: "panneau", label: "Panneaux" },
  { key: "decoration", label: "Décoration" },
];

const MOCK_PROJECTS = [
  { id: 1, titleFr: "Enseigne Lumineuse — Centre Commercial", titleAr: "لافتة مضيئة — مركز تجاري", category: "enseigne", imageUrl: "/portfolio-enseignes.png", isFeatured: true, descriptionFr: "Installation complète de signalétique lumineuse pour un centre commercial à Alger. Fabrication aluminium 3mm, impression UV.", size: "featured" },
  { id: 2, titleFr: "Covering Flotte Véhicules", titleAr: "تغليف أسطول السيارات", category: "vehicule", imageUrl: "/portfolio-vehicule.png", isFeatured: false, descriptionFr: "Covering complet d'une flotte de 12 véhicules de livraison avec identité visuelle corporate.", size: "large" },
  { id: 3, titleFr: "Stand Salon International", titleAr: "جناح المعرض الدولي", category: "evenement", imageUrl: "/portfolio-evenement.png", isFeatured: true, descriptionFr: "Conception et réalisation d'un stand de 24m² pour le Salon de l'Industrie d'Alger.", size: "medium" },
  { id: 4, titleFr: "Vitrine Boutique Mode", titleAr: "واجهة متجر الأزياء", category: "vitrophanie", imageUrl: "/portfolio-vitrophanie.png", isFeatured: false, descriptionFr: "Décoration complète de vitrine avec vinyle imprimé et sablé pour une enseigne mode.", size: "medium" },
  { id: 5, titleFr: "Panneau Routier Grand Format", titleAr: "لوحة طريق كبيرة الحجم", category: "panneau", imageUrl: "/portfolio-panneau.png", isFeatured: false, descriptionFr: "Panneau aluminium dibond 6x4m, impression UV grand format, installation en bordure d'autoroute.", size: "large" },
  { id: 6, titleFr: "Décoration Murale Bureau", titleAr: "ديكور جداري مكتب", category: "decoration", imageUrl: "/portfolio-decoration.png", isFeatured: false, descriptionFr: "Mural panoramique en impression grand format pour l'espace de travail d'une startup tech.", size: "medium" },
];

export default function Portfolio() {
  const { language } = useI18n();
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const { data: apiItems, isLoading } = useListPortfolio({});

  const rawItems = (apiItems && apiItems.length > 0) ? apiItems : MOCK_PROJECTS;
  const filtered = filter ? rawItems.filter((i: any) => i.category === filter) : rawItems;
  const featured = filtered.filter((i: any) => i.isFeatured);
  const rest = filtered.filter((i: any) => !i.isFeatured);

  return (
    <PublicLayout>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-6 pb-24 border-b border-border/30">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/4 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px section-divider" />
        <div className="container mx-auto px-4 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-600 tracking-wide mb-6">
              <Award className="h-3 w-3" />
              Projets réalisés — Preuves de qualité
            </span>
            <h1 className="font-display text-5xl md:text-6xl font-800 tracking-tight leading-[1.04] mb-5">
              Nos <span className="text-gradient">Réalisations</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-xl">
              Plus de 1 200 projets d'impression grand format livrés en Algérie. Chaque projet est une référence d'excellence.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── FILTER BAR ── */}
      <section className="sticky top-16 z-20 bg-background/80 backdrop-blur-xl border-b border-border/40 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const isActive = filter === cat.key;
              return (
                <button
                  key={cat.label}
                  onClick={() => setFilter(cat.key)}
                  data-testid={`filter-${cat.key ?? "all"}`}
                  className={`px-4 py-2 rounded-xl text-sm font-600 font-display transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground border border-border/40"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── GALLERY ── */}
      <div className="container mx-auto px-4 py-14 space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-32">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-32">
            <div className="text-5xl mb-6 font-display font-800 text-muted-foreground/10">AN</div>
            <h3 className="font-display text-xl font-600 mb-2">Aucune réalisation dans cette catégorie</h3>
            <p className="text-muted-foreground text-sm mb-6">Sélectionnez une autre catégorie ou consultez tout notre portfolio</p>
            <Button variant="outline" onClick={() => setFilter(undefined)} className="border-border/60">Voir tous les projets</Button>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={filter ?? "all"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

              {/* Featured strip */}
              {featured.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-px flex-1 bg-border/30" />
                    <span className="text-[11px] font-600 text-primary uppercase tracking-widest px-3 flex items-center gap-1.5">
                      <Award className="h-3 w-3" /> Projets vedettes
                    </span>
                    <div className="h-px flex-1 bg-border/30" />
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {featured.map((item: any, i: number) => (
                      <PortfolioCard key={item.id} item={item} language={language} index={i} featured />
                    ))}
                  </div>
                </div>
              )}

              {/* Regular grid — masonry-like with CSS columns */}
              {rest.length > 0 && (
                <>
                  {featured.length > 0 && (
                    <div className="flex items-center gap-3 mb-5">
                      <div className="h-px flex-1 bg-border/30" />
                      <span className="text-[11px] font-600 text-muted-foreground uppercase tracking-widest px-3">Toutes les réalisations</span>
                      <div className="h-px flex-1 bg-border/30" />
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {rest.map((item: any, i: number) => (
                      <PortfolioCard key={item.id} item={item} language={language} index={i} featured={false} />
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-16 py-16 text-center border-t border-border/30">
          <div className="max-w-xl mx-auto space-y-5">
            <h2 className="font-display text-3xl font-700">Votre projet, notre prochain chef-d'œuvre</h2>
            <p className="text-muted-foreground">Rejoignez les 500+ entreprises qui nous font confiance pour leur communication visuelle.</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" className="h-11 px-8 shadow-lg shadow-primary/20" asChild>
                <Link href="/services">Voir nos services <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="h-11 border-border/60 hover:border-primary/50" asChild>
                <Link href="/contact">Demander un devis</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </PublicLayout>
  );
}

function PortfolioCard({ item, language, index, featured }: { item: any; language: string; index: number; featured: boolean }) {
  const title = language === "ar" ? item.titleAr : item.titleFr;
  const catLabel = CATEGORIES.find(c => c.key === item.category)?.label ?? item.category;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      data-testid={`card-portfolio-${item.id}`}
    >
      <div className={`group relative overflow-hidden rounded-2xl bg-card border border-border/60 hover:border-primary/40 transition-all duration-500 hover:shadow-2xl hover:shadow-black/40 ${featured ? "aspect-[16/9]" : "aspect-[4/3]"}`}>

        {/* Image */}
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/12 via-muted/40 to-muted/80 flex items-center justify-center">
            <span className="font-display font-800 text-6xl text-primary/15">{catLabel?.[0] ?? "A"}</span>
          </div>
        )}

        {/* Always-on gradient bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Hover darkening overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />

        {/* Featured badge */}
        {item.isFeatured && (
          <div className="absolute top-4 left-4 z-10">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary text-primary-foreground text-[10px] font-700 font-display shadow-lg backdrop-blur-sm">
              <Award className="h-2.5 w-2.5" /> Vedette
            </span>
          </div>
        )}

        {/* Category pill */}
        <div className="absolute top-4 right-4 z-10">
          <span className="inline-flex px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-white/80 text-[10px] font-600 uppercase tracking-wide border border-white/10">
            {catLabel}
          </span>
        </div>

        {/* Bottom info — always visible */}
        <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
          <h3 className="font-display font-700 text-white text-lg leading-tight mb-1 drop-shadow-lg">{title}</h3>
          <p className="text-white/60 text-xs leading-relaxed line-clamp-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-400">
            {language === "ar" ? (item.descriptionAr || item.descriptionFr) : item.descriptionFr}
          </p>

          {/* Hover action */}
          <div className="flex items-center justify-between mt-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-400 delay-75">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-primary" />
              <span className="text-[11px] text-white/70 font-500">{catLabel}</span>
            </div>
            <div className="flex items-center gap-1.5 text-primary text-xs font-600">
              Voir le projet <ArrowRight className="h-3 w-3" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
