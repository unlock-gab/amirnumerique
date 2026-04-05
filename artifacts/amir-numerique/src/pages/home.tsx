import { PublicLayout } from "@/components/layouts/public-layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useI18n } from "@/hooks/use-i18n";
import { useListServices } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import {
  ArrowRight, Award, Clock, Shield, Zap, Printer, CheckCircle,
  Star, ChevronRight, Package, Phone, FileText, Truck
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] } }),
};

const STATS = [
  { value: "500+", label: "Clients satisfaits" },
  { value: "1 200+", label: "Projets réalisés" },
  { value: "+20 ans", label: "D'expérience" },
  { value: "48h", label: "Délai livraison" },
];

const FEATURES = [
  { icon: Zap, title: "Devis en 24h", desc: "Réponse rapide et précise pour chaque projet professionnel." },
  { icon: Award, title: "Qualité Premium", desc: "Encres HP et supports certifiés résistants aux UV." },
  { icon: Clock, title: "Livraison Express", desc: "Délais respectés, production cadencée et optimisée." },
  { icon: Shield, title: "Satisfaction Garantie", desc: "Reprise ou remboursement, sans questions." },
];

const HOW_IT_WORKS = [
  { step: "01", icon: FileText, title: "Choisissez un service", desc: "Parcourez notre catalogue et sélectionnez le service adapté à votre projet." },
  { step: "02", icon: Package, title: "Obtenez un devis", desc: "Entrez vos dimensions et obtenez un prix instantané ou demandez un devis personnalisé." },
  { step: "03", icon: Printer, title: "Confirmez la commande", desc: "Envoyez votre fichier et validez votre commande en ligne en quelques clics." },
  { step: "04", icon: Truck, title: "Recevez votre impression", desc: "Livraison rapide à Alger et dans toute l'Algérie, dans les délais convenus." },
];

const TESTIMONIALS = [
  { name: "Karim B.", role: "Directeur commercial", text: "Qualité d'impression exceptionnelle. Les bâches sont arrivées à temps pour notre événement.", stars: 5 },
  { name: "Samia A.", role: "Responsable marketing", text: "Tarifs compétitifs, équipe réactive. Nous utilisons Amir Numérique pour tous nos supports.", stars: 5 },
  { name: "Rachid M.", role: "Gérant d'agence", text: "Interface professionnelle, les commandes en ligne sont un gain de temps énorme.", stars: 5 },
];

export default function Home() {
  const { t } = useI18n();
  const { data: services } = useListServices({ active: true });
  const topServices = services?.slice(0, 4) || [];

  return (
    <PublicLayout>
      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden -mt-[72px] pt-[72px]">
        {/* BG layers */}
        <div className="absolute inset-0 z-0">
          {/* Machine UV background image */}
          <img
            src="/hero-printer.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{ opacity: 0.52 }}
          />
          {/* Dark gradient overlays — left side stronger for text readability, right side lighter to reveal image */}
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/65 to-background/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
          <div className="absolute -top-60 right-0 w-[800px] h-[800px] rounded-full bg-primary/4 blur-[120px]" />
          <div className="absolute bottom-0 -left-40 w-96 h-96 bg-primary/3 blur-3xl rounded-full" />
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }} />
        </div>

        <div className="container relative z-10 px-4 py-24 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left content */}
            <motion.div initial="hidden" animate="visible" className="space-y-8">
              <motion.div variants={fadeUp} custom={0}>
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-600 tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Agence d'impression numérique N°1 — Algérie
                </span>
              </motion.div>

              <motion.h1 variants={fadeUp} custom={1} className="font-display text-5xl md:text-6xl xl:text-[70px] font-800 leading-[1.03] tracking-tight">
                L'Excellence<br />
                de <span className="text-gradient">l'Impression</span><br />
                <span className="text-foreground/90">Numérique</span>
              </motion.h1>

              <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-[480px]">
                Bâches, panneaux, flyers, enseignes — tout ce dont votre entreprise a besoin pour s'afficher avec impact, livré dans toute l'Algérie.
              </motion.p>

              <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-3">
                <Button size="lg" className="h-12 px-7 text-base font-600 shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all" asChild>
                  <Link href="/services">
                    Voir les services
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-7 text-base border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all" asChild>
                  <Link href="/contact">Demander un devis</Link>
                </Button>
              </motion.div>

              <motion.div variants={fadeUp} custom={4} className="flex items-center gap-4 pt-1">
                <div className="flex -space-x-2">
                  {["K", "S", "R", "M"].map((l) => (
                    <div key={l} className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                      <span className="text-[10px] font-bold text-muted-foreground">{l}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex text-primary text-sm leading-none mb-1">★★★★★</div>
                  <p className="text-xs text-muted-foreground">+500 professionnels nous font confiance</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Right: stats grid */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.65, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="hidden lg:grid grid-cols-2 gap-4"
            >
              {STATS.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + i * 0.1 }}
                  className={`glass rounded-2xl p-7 ${i % 2 === 1 ? "mt-8" : ""}`}
                >
                  <div className="font-display text-4xl font-800 text-gradient mb-2">{s.value}</div>
                  <div className="text-sm text-muted-foreground">{s.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Mobile stats strip */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="lg:hidden mt-12 grid grid-cols-4 gap-2 border-t border-border/30 pt-6">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display font-700 text-primary text-lg leading-none">{s.value}</div>
                <div className="text-[10px] text-muted-foreground mt-1 leading-tight">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ FEATURES / TRUST ═══════════════════ */}
      <section className="py-16 bg-card/40 border-y border-border/30">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="flex items-start gap-4 p-5 rounded-2xl bg-background/60 border border-border/40 hover:border-primary/30 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-600 text-sm mb-1">{f.title}</h3>
                  <p className="text-[12px] text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ SERVICES PREVIEW ═══════════════════ */}
      <section className="py-24">
        <div className="container px-4 mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
            <div>
              <span className="text-[11px] text-primary font-600 uppercase tracking-widest mb-3 block">Catalogue</span>
              <h2 className="font-display text-3xl md:text-4xl font-700 tracking-tight">Nos Services d'Impression</h2>
              <div className="h-0.5 w-10 bg-primary rounded-full mt-3" />
            </div>
            <Button variant="outline" size="sm" asChild className="self-start sm:self-auto border-border/60 hover:border-primary/50 shrink-0">
              <Link href="/services">Tout voir <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Link>
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {(topServices.length > 0 ? topServices : [
              { id: 1, nameFr: "Bâche Publicitaire", descriptionFr: "Impression grand format sur PVC 510g — idéale pour les événements.", slug: "bache-publicitaire", publicPricePerM2: 1200, imageUrl: null },
              { id: 2, nameFr: "Panneau Aluminium", descriptionFr: "Impression UV directe sur dibond — rendu premium et durabilité.", slug: "panneau-aluminium", publicPricePerM2: 2500, imageUrl: null },
              { id: 3, nameFr: "Flyers & Dépliants", descriptionFr: "Papier couché 170g — idéal pour vos campagnes commerciales.", slug: "flyers-depliants", publicPricePerM2: 800, imageUrl: null },
              { id: 4, nameFr: "Stickers & Adhésifs", descriptionFr: "Vinyle haute durabilité pour vitrine, véhicule ou signalétique.", slug: "stickers-adhesifs", publicPricePerM2: 1500, imageUrl: null },
            ] as any[]).map((service: any, i: number) => (
              <motion.div key={service.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <Link href={`/services/${service.slug}`} className="group block h-full">
                  <div className="card-premium h-full overflow-hidden">
                    <div className="aspect-[4/3] overflow-hidden relative bg-muted/50">
                      {service.imageUrl ? (
                        <>
                          <img src={service.imageUrl} alt={service.nameFr} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-106" />
                          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-muted/40 to-muted/60" />
                          <span className="font-display text-6xl font-800 text-primary/12 group-hover:text-primary/20 transition-colors duration-500 relative z-10">AN</span>
                          <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/4 transition-colors duration-500" />
                    </div>
                    <div className="p-5 space-y-3">
                      <h3 className="font-display font-600 text-base group-hover:text-primary transition-colors">{service.nameFr}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{service.descriptionFr}</p>
                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">À partir de</div>
                          <div className="font-display font-700 text-lg text-primary">
                            {service.publicPricePerM2?.toLocaleString() ?? "—"} <span className="text-xs font-normal text-muted-foreground">DA/m²</span>
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-muted/60 group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center transition-all duration-300">
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
      <section className="py-24 bg-card/30 border-y border-border/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent pointer-events-none" />
        <div className="container px-4 mx-auto relative">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="text-[11px] text-primary font-600 uppercase tracking-widest mb-3 block">Processus</span>
            <h2 className="font-display text-3xl md:text-4xl font-700 tracking-tight">Comment ça marche ?</h2>
            <p className="text-muted-foreground mt-3 max-w-md mx-auto text-sm">Commander votre impression en ligne est simple, rapide, et entièrement sécurisé.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Connector line */}
            <div className="absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-border to-transparent hidden lg:block" />

            {HOW_IT_WORKS.map((step, i) => (
              <motion.div key={step.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center group">
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-card border border-border/60 flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary/5 transition-all">
                    <step.icon className="h-7 w-7 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-[9px] font-800 font-display text-primary-foreground">{i + 1}</span>
                  </div>
                </div>
                <h3 className="font-display font-600 text-sm mb-2">{step.title}</h3>
                <p className="text-[12px] text-muted-foreground leading-relaxed max-w-[180px]">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ TESTIMONIALS ═══════════════════ */}
      <section className="py-24">
        <div className="container px-4 mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="text-[11px] text-primary font-600 uppercase tracking-widest mb-3 block">Témoignages</span>
            <h2 className="font-display text-3xl md:text-4xl font-700 tracking-tight">Ce que disent nos clients</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="card-premium p-6 h-full space-y-4">
                  <div className="flex text-primary text-sm">{"★".repeat(t.stars)}</div>
                  <p className="text-sm text-muted-foreground leading-relaxed italic">"{t.text}"</p>
                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary">{t.name.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="text-sm font-600">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.role}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ PRICING PREVIEW ═══════════════════ */}
      <section className="py-16 bg-card/30 border-y border-border/30">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            <motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex-1 max-w-xl">
              <span className="text-[11px] text-primary font-600 uppercase tracking-widest mb-3 block">Tarification</span>
              <h2 className="font-display text-3xl font-700 tracking-tight mb-4">Tarifs transparents, adaptés à votre profil</h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Profitez de tarifs spéciaux en créant un compte client ou sous-traitant. Calcul automatique au m² pour chaque service.
              </p>
              <div className="space-y-3">
                {[
                  { icon: CheckCircle, text: "Prix calculés automatiquement (largeur × hauteur × prix/m²)" },
                  { icon: CheckCircle, text: "Tarifs réduits pour les clients enregistrés" },
                  { icon: CheckCircle, text: "Prix professionnels pour sous-traitants" },
                  { icon: Star, text: "Devis personnalisé sur demande pour grands volumes" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Icon className="h-4 w-4 text-primary shrink-0" />
                    {text}
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-8">
                <Button asChild className="shadow-lg shadow-primary/20">
                  <Link href="/auth/register">Créer un compte</Link>
                </Button>
                <Button variant="outline" asChild className="border-border/60 hover:border-primary/50">
                  <Link href="/pricing">Voir les tarifs</Link>
                </Button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex-1 w-full max-w-sm">
              <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
                <div className="px-5 py-4 border-b border-border/40 bg-muted/20">
                  <div className="text-xs font-600 text-muted-foreground uppercase tracking-widest">Bâche Publicitaire — Exemple</div>
                </div>
                <div className="p-5 space-y-4">
                  {[
                    { label: "Visiteur", price: "1 200", color: "text-muted-foreground" },
                    { label: "Client enregistré", price: "1 000", color: "text-blue-400", badge: true },
                    { label: "Sous-traitant", price: "750", color: "text-amber-400" },
                  ].map((tier) => (
                    <div key={tier.label} className={`flex items-center justify-between py-2 border-b border-border/30 last:border-0 ${tier.badge ? "relative" : ""}`}>
                      <span className="text-sm text-muted-foreground">{tier.label}</span>
                      <div className="flex items-center gap-2">
                        {tier.badge && (
                          <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded font-600">Recommandé</span>
                        )}
                        <span className={`font-display font-700 text-base tabular-nums ${tier.color}`}>{tier.price} DA/m²</span>
                      </div>
                    </div>
                  ))}
                  <div className="pt-1 text-[11px] text-muted-foreground">
                    Exemple : 2m × 3m = 6m² — Client: <strong className="text-blue-400">6 000 DA</strong>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ CTA ═══════════════════ */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/6 via-transparent to-transparent" />
        <div className="absolute -top-40 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 right-0 h-px section-divider" />
        <div className="absolute bottom-0 left-0 right-0 h-px section-divider" />
        <div className="container px-4 mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto space-y-6">
            <span className="text-[11px] text-primary font-600 uppercase tracking-widest">Commençons ensemble</span>
            <h2 className="font-display text-4xl md:text-5xl font-700 tracking-tight">
              Prêt à concrétiser{" "}
              <span className="text-gradient">votre projet ?</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Rejoignez plus de 500 professionnels qui font confiance à Amir Numérique pour leur communication visuelle en Algérie.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Button size="lg" className="h-12 px-9 text-base font-600 shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all w-full sm:w-auto" asChild>
                <Link href="/auth/register">
                  Créer un compte professionnel
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-9 text-base border-border/60 hover:border-primary/50 hover:bg-primary/5 w-full sm:w-auto" asChild>
                <Link href="/contact">
                  <Phone className="mr-2 h-4 w-4" />
                  Nous contacter
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}
