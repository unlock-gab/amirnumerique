import { PublicLayout } from "@/components/layouts/public-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useListServices, useGetMe } from "@workspace/api-client-react";
import { useI18n } from "@/hooks/use-i18n";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";

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
      <div className="container mx-auto px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("ourServices")}</h1>
          <div className="h-1 w-20 bg-primary mx-auto rounded-full mb-6" />
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Solutions d'impression grand format, UV et éco-solvant pour tous vos besoins de communication visuelle
          </p>
          {user && user.role !== "visitor" && (
            <Badge variant="secondary" className="mt-4 text-sm">
              Tarif affiché: {user.role === "subcontractor" ? "Sous-traitant" : user.role === "admin" ? "Admin (prix client)" : "Client"}
            </Badge>
          )}
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services?.map((service, i) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
                data-testid={`card-service-${service.id}`}
              >
                <div className="aspect-[16/9] bg-muted overflow-hidden">
                  {service.imageUrl ? (
                    <img src={service.imageUrl} alt={language === "ar" ? service.nameAr : service.nameFr} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                      <span className="text-4xl font-bold text-primary/30">AN</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{language === "ar" ? service.nameAr : service.nameFr}</h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{language === "ar" ? service.descriptionAr : service.descriptionFr}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-muted-foreground">{t("startingAt")}</span>
                      <div className="text-2xl font-bold text-primary">
                        {getPrice(service).toLocaleString()} DA<span className="text-sm font-normal text-muted-foreground">/m²</span>
                      </div>
                    </div>
                    <Button asChild variant="outline" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors">
                      <Link href={`/services/${service.slug}`}>Voir <ArrowRight className="ml-1 h-4 w-4" /></Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
