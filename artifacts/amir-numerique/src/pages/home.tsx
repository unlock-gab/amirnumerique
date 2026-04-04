import { PublicLayout } from "@/components/layouts/public-layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useI18n } from "@/hooks/use-i18n";
import { motion } from "framer-motion";
import { ArrowRight, Award, Clock, Shield, Zap } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] } }),
};

const STATS = [
  { value: "500+", label: "Clients satisfaits" },
  { value: "1 200+", label: "Projets réalisés" },
  { value: "10 ans", label: "D'expérience" },
  { value: "48h", label: "Délai livraison" },
];

const SERVICES = [
  { title: "Impression Grand Format", slug: "bache-publicitaire", desc: "Bâches, bannières et supports XXL haute résolution." },
  { title: "Impression UV Directe", slug: "panneau-aluminium", desc: "Rendu premium sur aluminium, plexiglas et plus." },
  { title: "Flyers & Dépliants", slug: "flyers-depliants", desc: "Communication print élégante pour vos campagnes." },
  { title: "Enseignes & Signalétique", slug: "stickers-adhesifs", desc: "Stickers, enseignes et adhésifs professionnels." },
];

const FEATURES = [
  { icon: Zap, title: "Devis en 24h", desc: "Réponse rapide et précise pour chaque projet." },
  { icon: Award, title: "Qualité Premium", desc: "Encres haut de gamme et supports certifiés." },
  { icon: Clock, title: "Livraison Express", desc: "Délais respectés, production optimisée." },
  { icon: Shield, title: "Satisfaction Garantie", desc: "Reprise ou remboursement sans question." },
];

export default function Home() {
  const { t } = useI18n();

  return (
    <PublicLayout>
      {/* ─── HERO ─── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/60" />
          <div className="absolute top-0 right-0 w-3/4 h-full bg-gradient-to-l from-primary/4 to-transparent" />
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-primary/3 blur-3xl" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="container relative z-10 px-4 py-20 mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div variants={fadeUp} custom={0}>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Agence d'impression numérique — Algérie
              </span>
            </motion.div>

            {/* Headline */}
            <motion.div variants={fadeUp} custom={1} className="space-y-2">
              <h1 className="font-display text-5xl md:text-6xl xl:text-7xl font-800 leading-[1.05] tracking-tight">
                <span className="text-foreground">L'Excellence de</span>
                <br />
                <span className="text-gradient">l'Impression</span>
                <br />
                <span className="text-foreground">Numérique</span>
              </h1>
            </motion.div>

            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-lg">
              {t("heroSubtitle")}
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-3">
              <Button size="lg" className="h-12 px-7 text-base font-semibold shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all" asChild>
                <Link href="/services">
                  {t("orderNow")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-7 text-base border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all" asChild>
                <Link href="/contact">{t("requestQuote")}</Link>
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div variants={fadeUp} custom={4} className="flex items-center gap-4 pt-2">
              <div className="flex -space-x-2">
                {["A","B","C","D"].map((l) => (
                  <div key={l} className="w-7 h-7 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                    <span className="text-[9px] font-bold text-muted-foreground">{l}</span>
                  </div>
                ))}
              </div>
              <div>
                <div className="flex text-primary text-sm">{"★★★★★"}</div>
                <p className="text-xs text-muted-foreground">+500 clients professionnels</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Stats grid */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="hidden lg:grid grid-cols-2 gap-4"
          >
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className={`glass rounded-2xl p-6 ${i === 1 ? "mt-6" : ""} ${i === 2 ? "-mt-6" : ""}`}
              >
                <div className="font-display text-4xl font-800 text-gradient mb-1">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Stats on mobile */}
        <div className="absolute bottom-0 left-0 right-0 lg:hidden border-t border-border/30 bg-card/40 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 grid grid-cols-4 gap-2">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display font-700 text-primary text-base">{s.value}</div>
                <div className="text-[10px] text-muted-foreground leading-tight">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="py-20 bg-card/30">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-4 p-5 rounded-xl bg-background/50 border border-border/50"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-600 text-sm text-foreground mb-1">{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SERVICES PREVIEW ─── */}
      <section className="py-24">
        <div className="container px-4 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12"
          >
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-700 tracking-tight">{t("ourServices")}</h2>
              <div className="h-0.5 w-12 bg-primary rounded-full mt-3" />
            </div>
            <Button variant="outline" size="sm" asChild className="self-start sm:self-auto border-border/60 hover:border-primary/50">
              <Link href="/services">Voir tous les services <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Link>
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {SERVICES.map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Link href={`/services/${service.slug}`} className="group block">
                  <div className="card-premium overflow-hidden h-full">
                    <div className="aspect-[4/3] bg-muted/60 overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/15 to-primary/5 group-hover:from-primary/20 transition-colors duration-500" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-display text-4xl font-800 text-primary/20 group-hover:text-primary/30 transition-colors">AN</span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-display font-600 text-base mb-1.5 group-hover:text-primary transition-colors">{service.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3">{service.desc}</p>
                      <span className="text-xs font-medium text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Voir le service <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-px section-divider" />
        <div className="absolute bottom-0 left-0 right-0 h-px section-divider" />
        <div className="container px-4 mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto space-y-6"
          >
            <h2 className="font-display text-3xl md:text-5xl font-700 tracking-tight">
              Prêt à concrétiser{" "}
              <span className="text-gradient">votre projet ?</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Rejoignez des centaines de professionnels qui font confiance à Amir Numérique pour leur communication visuelle.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button size="lg" className="h-12 px-8 text-base font-semibold shadow-xl shadow-primary/25" asChild>
                <Link href="/auth/register">Créer un compte professionnel</Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base border-border/60 hover:border-primary/50 hover:bg-primary/5" asChild>
                <Link href="/pricing">Voir les tarifs</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}
