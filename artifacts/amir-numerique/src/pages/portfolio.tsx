import { PublicLayout } from "@/components/layouts/public-layout";
import { useListPortfolio } from "@workspace/api-client-react";
import { useI18n } from "@/hooks/use-i18n";
import { motion } from "framer-motion";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Portfolio() {
  const { language } = useI18n();
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const { data: items, isLoading } = useListPortfolio({});

  const categories = ["enseigne", "vehicule", "decoration", "evenement", "vitrophanie", "panneau"];
  const filtered = filter ? items?.filter(i => i.category === filter) : items;

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Nos Réalisations</h1>
          <div className="h-1 w-20 bg-primary mx-auto rounded-full mb-6" />
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Découvrez nos projets réalisés pour des entreprises de toutes tailles en Algérie
          </p>
        </motion.div>

        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          <Button
            variant={!filter ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(undefined)}
            data-testid="filter-all"
          >
            Tous
          </Button>
          {categories.map(cat => (
            <Button
              key={cat}
              variant={filter === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(cat)}
              data-testid={`filter-${cat}`}
              className="capitalize"
            >
              {cat}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered?.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="group relative overflow-hidden rounded-2xl bg-card border border-border aspect-[4/3] hover:border-primary/50 transition-all"
                data-testid={`card-portfolio-${item.id}`}
              >
                <img
                  src={item.imageUrl}
                  alt={language === "ar" ? item.titleAr : item.titleFr}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <h3 className="text-white font-bold text-lg leading-tight">
                    {language === "ar" ? item.titleAr : item.titleFr}
                  </h3>
                  {item.category && (
                    <span className="text-white/70 text-sm capitalize mt-1">{item.category}</span>
                  )}
                </div>
                {item.isFeatured && (
                  <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full">
                    Featured
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && filtered?.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            Aucune réalisation dans cette catégorie
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
