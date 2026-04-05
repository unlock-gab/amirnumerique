import { PublicLayout } from "@/components/layouts/public-layout";
import { useListServices, useGetMe } from "@workspace/api-client-react";
import { useI18n } from "@/hooks/use-i18n";
import { motion } from "framer-motion";
import { Loader2, CheckCircle, Star, Building2, Users, ArrowRight, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { PricingSimulator } from "@/components/pricing-simulator";

const TIERS = [
  {
    title: "Visiteur",
    desc: "Prix catalogue standard",
    key: "public",
    highlight: false,
    icon: Users,
    features: ["Calcul automatique m²", "Devis instantané", "Support par email"],
    cta: null,
  },
  {
    title: "Client Enregistré",
    desc: "Tarifs préférentiels exclusifs",
    key: "client",
    highlight: true,
    icon: Star,
    features: ["Calcul automatique m²", "Suivi commandes en ligne", "Devis instantané", "Tarifs réduits garantis", "Support prioritaire"],
    cta: { label: "Créer un compte", href: "/auth/register" },
  },
  {
    title: "Sous-Traitant",
    desc: "Tarifs professionnels compétitifs",
    key: "subcontractor",
    highlight: false,
    icon: Building2,
    features: ["Calcul automatique m²", "Suivi commandes en ligne", "Tarifs professionnels", "Facturation dédiée"],
    cta: { label: "Nous contacter", href: "/contact" },
  },
];

export default function Pricing() {
  useI18n();
  const { data: services, isLoading: servicesLoading } = useListServices({ active: true });
  const { data: user } = useGetMe();

  const simulatorServices = (services ?? []).filter(
    (s: any) => (s.publicPricePerM2 ?? 0) > 0 || (s.clientPricePerM2 ?? 0) > 0 || (s.subcontractorPricePerM2 ?? 0) > 0
  );

  return (
    <PublicLayout>
      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <section className="relative pt-6 pb-14 overflow-hidden">
        <div className="absolute -top-32 left-1/3 w-[600px] h-[350px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px section-divider" />
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-600 tracking-widest uppercase mb-5">
              <Calculator className="h-3 w-3" />
              Tarification transparente
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-800 tracking-tight mb-4">
              Nos <span className="text-gradient">Tarifs</span>
            </h1>
            <div className="h-[3px] w-12 bg-primary rounded-full mx-auto mb-5" />
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
              Tarifs transparents par m² selon votre profil. Inscrivez-vous pour bénéficier de tarifs préférentiels.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-24 space-y-16">
        {/* ══ TIER CARDS ════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {TIERS.map((tier, i) => (
            <motion.div
              key={tier.key}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className={`relative rounded-2xl p-8 border flex flex-col ${
                tier.highlight
                  ? "border-primary/50 bg-gradient-to-b from-primary/8 to-transparent shadow-xl shadow-primary/10"
                  : "border-border/60 bg-card"
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-[10px] font-700 font-display uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                    Recommandé
                  </span>
                </div>
              )}
              <div className="mb-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${tier.highlight ? "bg-primary/20" : "bg-muted"}`}>
                  <tier.icon className={`h-5 w-5 ${tier.highlight ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <h3 className="font-display font-700 text-xl mb-1">{tier.title}</h3>
                <p className="text-muted-foreground text-sm">{tier.desc}</p>
              </div>
              <div className="space-y-3 flex-1 mb-6">
                {tier.features.map((f) => (
                  <div key={f} className="flex items-center gap-2.5 text-sm">
                    <CheckCircle className={`h-4 w-4 shrink-0 ${tier.highlight ? "text-primary" : "text-green-500"}`} />
                    <span className="text-muted-foreground">{f}</span>
                  </div>
                ))}
              </div>
              {!user && tier.cta && (
                <Button
                  className={`w-full ${tier.highlight ? "shadow-lg shadow-primary/20" : ""}`}
                  variant={tier.highlight ? "default" : "outline"}
                  asChild
                >
                  <Link href={tier.cta.href}>
                    {tier.cta.label}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </motion.div>
          ))}
        </div>

        {/* ══ PRICING SIMULATOR ═════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-600 tracking-widest uppercase mb-4">
              <Calculator className="h-3 w-3" />
              Outil interactif
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-800 tracking-tight mb-3">
              Simulateur de <span className="text-gradient">prix</span>
            </h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
              Entrez vos dimensions et obtenez une estimation instantanée. Choisissez votre unité et le calcul se fait en temps réel.
            </p>
          </div>

          {servicesLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          ) : simulatorServices.length === 0 ? (
            <div className="rounded-2xl border border-border/40 bg-card p-12 text-center max-w-5xl mx-auto">
              <Calculator className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Aucun service disponible pour le simulateur pour le moment.</p>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto">
              <PricingSimulator services={simulatorServices as any} user={user as any} />
            </div>
          )}
        </motion.div>

        {/* ══ CUSTOM QUOTE CTA ══════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center py-10 max-w-2xl mx-auto"
        >
          <p className="text-muted-foreground mb-5 text-lg">Besoin d'un tarif spécial ou d'une grande quantité ?</p>
          <Button size="lg" variant="outline" className="border-border/60 hover:border-primary/50 hover:bg-primary/5" asChild>
            <Link href="/contact">
              Demander un devis sur mesure
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </PublicLayout>
  );
}
