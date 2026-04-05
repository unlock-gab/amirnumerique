import { PublicLayout } from "@/components/layouts/public-layout";
import { Link, useParams } from "wouter";
import { useGetServicesByCategorySlug, useGetServiceCategoryBySlug, useGetMe } from "@workspace/api-client-react";
import { useI18n } from "@/hooks/use-i18n";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Loader2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] } }),
};

export default function ServiceCategory() {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useI18n();
  const { data: category, isLoading: catLoading } = useGetServiceCategoryBySlug(slug ?? "");
  const { data: services, isLoading: svcLoading } = useGetServicesByCategorySlug(slug ?? "");
  const { data: user } = useGetMe();

  const isLoading = catLoading || svcLoading;

  const getPrice = (service: any) => {
    if (!user) return service.publicPricePerM2;
    if (user.role === "subcontractor") return service.subcontractorPricePerM2;
    if (user.role === "client" || user.role === "admin") return service.clientPricePerM2;
    return service.publicPricePerM2;
  };

  const catName = category ? (language === "ar" ? category.nameAr : category.nameFr) : "";
  const catDesc = category ? (language === "ar" ? category.descriptionAr : category.descriptionFr) : "";

  return (
    <PublicLayout>
      {/* Breadcrumb + header */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-card/60 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-px section-divider" />
        {category?.imageUrl && (
          <>
            <img
              src={category.imageUrl}
              alt={catName}
              className="absolute inset-0 w-full h-full object-cover object-center opacity-10"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/60" />
          </>
        )}
        <div className="container relative mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
            <Link href="/services" className="hover:text-foreground transition-colors">Services</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-500">{catName || slug}</span>
          </nav>

          {isLoading ? (
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-muted-foreground text-sm">Chargement...</span>
            </div>
          ) : category ? (
            <motion.div initial="hidden" animate="visible" className="max-w-2xl">
              <motion.h1 variants={fadeUp} custom={0} className="font-display text-4xl md:text-5xl font-800 tracking-tight mb-4">
                {catName}
              </motion.h1>
              <div className="h-0.5 w-12 bg-primary rounded-full mb-5" />
              {catDesc && (
                <motion.p variants={fadeUp} custom={1} className="text-muted-foreground text-lg leading-relaxed">
                  {catDesc}
                </motion.p>
              )}
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Catégorie introuvable.</p>
              <Button variant="outline" asChild>
                <Link href="/services">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux services
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Services grid */}
      {!isLoading && category && (
        <section className="container mx-auto px-4 pb-24">
          {!services || services.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p className="mb-4">Aucun service dans cette catégorie pour le moment.</p>
              <Button variant="outline" asChild>
                <Link href="/services">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux catégories
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <p className="text-sm text-muted-foreground">
                  <span className="font-600 text-foreground">{services.length}</span> service{services.length > 1 ? "s" : ""} disponible{services.length > 1 ? "s" : ""}
                </p>
                <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
                  <Link href="/services">
                    <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Toutes les catégories
                  </Link>
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service, i) => {
                  const name = language === "ar" ? service.nameAr : service.nameFr;
                  const desc = language === "ar" ? service.descriptionAr : service.descriptionFr;
                  const price = getPrice(service);
                  return (
                    <motion.div
                      key={service.id}
                      variants={fadeUp}
                      initial="hidden"
                      animate="visible"
                      custom={i}
                      className="group"
                    >
                      <Link href={`/services/${slug}/${service.slug}`} className="block h-full">
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
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/60">
                                <span className="font-display text-5xl font-800 text-primary/15 group-hover:text-primary/25 transition-colors duration-500">AN</span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-500" />
                          </div>

                          {/* Content */}
                          <div className="p-6 space-y-3">
                            <h3 className="font-display font-600 text-lg group-hover:text-primary transition-colors duration-200">{name}</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">{desc}</p>
                            <div className="flex items-center justify-between pt-2">
                              <div>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">À partir de</span>
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
            </>
          )}
        </section>
      )}
    </PublicLayout>
  );
}
