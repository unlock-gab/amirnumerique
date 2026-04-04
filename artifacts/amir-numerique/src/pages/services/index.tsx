import { PublicLayout } from "@/components/layouts/public-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useListServices, useGetMe } from "@workspace/api-client-react";
import { useI18n } from "@/hooks/use-i18n";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";

export default function Services() {
  const { t, language } = useI18n();
  const { data: services, isLoading } = useListServices({ active: true });
  const { data: user } = useGetMe();

  const getPrice = (service: any) => {
    if (!user) return service.publicPricePerM2;
    if (user.role === "subcontractor") return service.subcontractorPricePerM2;
    if (user.role === "client" || user.role === "admin") return service.clientPricePerM2;
    return service.publicPricePerM2;
  };

  return (
    <PublicLayout>
      {/* Header */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-card/60 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-px section-divider" />
        <div className="container relative mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <h1 className="font-display text-4xl md:text-5xl font-700 tracking-tight mb-4">
              {t("ourServices")}
            </h1>
            <div className="h-0.5 w-12 bg-primary rounded-full mb-5" />
            <p className="text-muted-foreground text-lg leading-relaxed mb-5">
              Solutions d'impression grand format, UV et éco-solvant pour tous vos besoins de communication visuelle
            </p>
            {user && user.role !== "visitor" && (
              <Badge className="bg-primary/10 text-primary border-primary/20 gap-1.5">
                <Sparkles className="h-3 w-3" />
                Tarif {user.role === "subcontractor" ? "sous-traitant" : "client"} appliqué
              </Badge>
            )}
          </motion.div>
        </div>
      </section>

      {/* Grid */}
      <section className="container mx-auto px-4 pb-24">
        {isLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services?.map((service, i) => {
              const name = language === "ar" ? service.nameAr : service.nameFr;
              const desc = language === "ar" ? service.descriptionAr : service.descriptionFr;
              const price = getPrice(service);
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                  className="group"
                  data-testid={`card-service-${service.id}`}
                >
                  <Link href={`/services/${service.slug}`} className="block h-full">
                    <div className="card-premium h-full overflow-hidden">
                      {/* Image */}
                      <div className="aspect-[16/9] overflow-hidden relative bg-muted/50">
                        {service.imageUrl ? (
                          <>
                            <img
                              src={service.imageUrl}
                              alt={name}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/60 relative">
                            <span className="font-display text-5xl font-800 text-primary/15 group-hover:text-primary/25 transition-colors duration-500">AN</span>
                            <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
                          </div>
                        )}
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-500" />
                      </div>

                      {/* Content */}
                      <div className="p-6 space-y-3">
                        <h3 className="font-display font-600 text-lg group-hover:text-primary transition-colors duration-200">{name}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">{desc}</p>
                        <div className="flex items-center justify-between pt-2">
                          <div>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("startingAt")}</span>
                            <div className="font-display font-700 text-xl text-primary">
                              {price.toLocaleString()} DA
                              <span className="text-xs font-normal text-muted-foreground">/m²</span>
                            </div>
                          </div>
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
