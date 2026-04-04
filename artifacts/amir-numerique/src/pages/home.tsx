import { PublicLayout } from "@/components/layouts/public-layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useI18n } from "@/hooks/use-i18n";
import { motion } from "framer-motion";

export default function Home() {
  const { t } = useI18n();

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/hero-bg.png" 
            alt="Amir Numerique UV Printer" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
        </div>

        <div className="container relative z-10 px-4 py-32 mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl space-y-8"
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
              L'Excellence de <br/>
              <span className="text-primary">l'Impression Numérique</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl leading-relaxed">
              {t("heroSubtitle")}
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <Button size="lg" className="text-lg px-8 h-14" asChild>
                <Link href="/services">{t("orderNow")}</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 h-14 bg-background/50 backdrop-blur-sm border-primary/50 text-white hover:bg-primary/20" asChild>
                <Link href="/contact">{t("requestQuote")}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Preview Section */}
      <section className="py-24 bg-card">
        <div className="container px-4 mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("ourServices")}</h2>
            <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Impression Grand Format", img: "/service-wide.png" },
              { title: "Impression UV", img: "/service-uv.png" },
              { title: "Impression Offset", img: "/service-offset.png" },
              { title: "Enseignes & Signalétique", img: "/service-signage.png" }
            ].map((service, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative overflow-hidden rounded-xl bg-background border border-border"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src={service.img} 
                    alt={service.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                  <Button variant="link" className="px-0 text-primary group-hover:text-primary-foreground" asChild>
                    <Link href="/services">En savoir plus &rarr;</Link>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Prêt à concrétiser votre projet ?</h2>
          <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">Rejoignez des centaines de professionnels qui font confiance à Amir Numérique pour leur communication visuelle.</p>
          <Button size="lg" variant="secondary" className="text-lg px-10 h-14 text-primary bg-background hover:bg-background/90" asChild>
            <Link href="/auth/register">Créer un compte professionnel</Link>
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
