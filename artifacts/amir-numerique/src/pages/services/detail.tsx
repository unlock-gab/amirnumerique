import { PublicLayout } from "@/components/layouts/public-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useRoute, useLocation } from "wouter";
import { useGetServiceBySlug, useGetMe } from "@workspace/api-client-react";
import { useI18n } from "@/hooks/use-i18n";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, Loader2, Upload } from "lucide-react";

export default function ServiceDetail() {
  const { language } = useI18n();
  const [, params] = useRoute("/services/:slug");
  const [, setLocation] = useLocation();
  const slug = params?.slug || "";
  const { data: service, isLoading } = useGetServiceBySlug(slug, { query: { enabled: !!slug } });
  const { data: user } = useGetMe();

  const getPrice = (s: any) => {
    if (!user) return s.publicPricePerM2;
    if (user.role === "subcontractor") return s.subcontractorPricePerM2;
    if (user.role === "client" || user.role === "admin") return s.clientPricePerM2;
    return s.publicPricePerM2;
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="flex justify-center py-40"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
      </PublicLayout>
    );
  }

  if (!service) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Service non trouvé</h1>
          <Button asChild><Link href="/services">Retour aux services</Link></Button>
        </div>
      </PublicLayout>
    );
  }

  const name = language === "ar" ? service.nameAr : service.nameFr;
  const description = language === "ar" ? service.descriptionAr : service.descriptionFr;
  const price = getPrice(service);

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" size="sm" asChild className="mb-8 text-muted-foreground">
          <Link href="/services"><ArrowLeft className="mr-2 h-4 w-4" /> Tous les services</Link>
        </Button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-muted">
              {service.imageUrl ? (
                <img src={service.imageUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                  <span className="text-6xl font-bold text-primary/30">AN</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              {service.active ? (
                <Badge variant="default" className="mb-3 bg-green-500/10 text-green-500 border-green-500/20">Disponible</Badge>
              ) : (
                <Badge variant="secondary" className="mb-3">Indisponible</Badge>
              )}
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{name}</h1>
              {description && <p className="text-muted-foreground leading-relaxed">{description}</p>}
            </div>

            <div className="border border-border rounded-xl p-6 bg-card space-y-4">
              <h3 className="font-semibold text-lg">Tarification</h3>
              <div>
                <span className="text-sm text-muted-foreground">Prix par m²</span>
                <div className="text-4xl font-bold text-primary mt-1">{price.toLocaleString()} DA<span className="text-base font-normal text-muted-foreground">/m²</span></div>
                {user && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Tarif {user.role === "subcontractor" ? "sous-traitant" : user.role === "admin" ? "admin (prix client)" : "client"}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                {service.requiresFileUpload && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Upload className="h-4 w-4 text-primary" />
                    <span>Fichier d'impression requis</span>
                  </div>
                )}
                {["Impression haute qualité", "Livraison sur devis", "Support technique inclus"].map((feat) => (
                  <div key={feat} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {user ? (
                <>
                  <Button size="lg" className="flex-1" onClick={() => setLocation(`/dashboard/orders/new?service=${service.id}`)}>
                    Commander maintenant
                  </Button>
                  <Button size="lg" variant="outline" className="flex-1" onClick={() => setLocation(`/dashboard/quotes/new?service=${service.id}`)}>
                    Demander un devis
                  </Button>
                </>
              ) : (
                <>
                  <Button size="lg" className="flex-1" asChild>
                    <Link href="/auth/register">Commander maintenant</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="flex-1" asChild>
                    <Link href="/auth/login">Se connecter</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </PublicLayout>
  );
}
