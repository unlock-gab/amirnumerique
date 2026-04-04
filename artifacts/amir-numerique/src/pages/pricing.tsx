import { PublicLayout } from "@/components/layouts/public-layout";
import { useListServices, useGetMe } from "@workspace/api-client-react";
import { useI18n } from "@/hooks/use-i18n";
import { motion } from "framer-motion";
import { Loader2, CheckCircle, Star, Building2, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

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
  const { language } = useI18n();
  const { data: services, isLoading } = useListServices({ active: true });
  const { data: user } = useGetMe();

  return (
    <PublicLayout>
      {/* Header */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-card/60 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-px section-divider" />
        <div className="container relative mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
            <h1 className="font-display text-4xl md:text-5xl font-700 tracking-tight mb-4">Nos Tarifs</h1>
            <div className="h-0.5 w-12 bg-primary rounded-full mx-auto mb-5" />
            <p className="text-muted-foreground text-lg leading-relaxed">
              Tarifs transparents par m² selon votre profil. Inscrivez-vous pour bénéficier de tarifs préférentiels.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-24 space-y-16">
        {/* Tier cards */}
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

        {/* Pricing table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          <h2 className="font-display font-700 text-2xl mb-6">Grille tarifaire complète</h2>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-2xl border border-border/60 overflow-hidden bg-card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/30">
                      <th className="text-left px-5 py-4 font-display font-600 text-sm text-foreground">Service</th>
                      <th className="text-right px-5 py-4 font-display font-600 text-sm text-muted-foreground">Visiteur</th>
                      <th className="text-right px-5 py-4 font-display font-600 text-sm text-primary">Client</th>
                      <th className="text-right px-5 py-4 font-display font-600 text-sm" style={{ color: "hsl(38 80% 60%)" }}>Sous-traitant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services?.map((service, i) => (
                      <tr
                        key={service.id}
                        className="border-b border-border/30 hover:bg-muted/20 transition-colors group"
                      >
                        <td className="px-5 py-4">
                          <Link
                            href={`/services/${service.slug}`}
                            className="font-medium text-sm hover:text-primary transition-colors group-hover:text-primary"
                          >
                            {language === "ar" ? service.nameAr : service.nameFr}
                          </Link>
                        </td>
                        <td className="text-right px-5 py-4 text-sm text-muted-foreground tabular-nums">
                          {service.publicPricePerM2.toLocaleString()} DA/m²
                        </td>
                        <td className="text-right px-5 py-4 text-sm font-semibold text-primary tabular-nums">
                          {service.clientPricePerM2.toLocaleString()} DA/m²
                        </td>
                        <td className="text-right px-5 py-4 text-sm font-semibold tabular-nums" style={{ color: "hsl(38 80% 60%)" }}>
                          {service.subcontractorPricePerM2.toLocaleString()} DA/m²
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>

        {/* Custom quote CTA */}
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
