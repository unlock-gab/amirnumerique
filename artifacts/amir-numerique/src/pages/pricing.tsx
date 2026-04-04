import { PublicLayout } from "@/components/layouts/public-layout";
import { useListServices, useGetMe } from "@workspace/api-client-react";
import { useI18n } from "@/hooks/use-i18n";
import { motion } from "framer-motion";
import { Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Pricing() {
  const { language } = useI18n();
  const { data: services, isLoading } = useListServices({ active: true });
  const { data: user } = useGetMe();

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Nos Tarifs</h1>
          <div className="h-1 w-20 bg-primary mx-auto rounded-full mb-6" />
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Tarifs transparents par m² selon votre profil. Inscrivez-vous pour bénéficier de tarifs préférentiels.
          </p>
        </motion.div>

        {/* Role cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            { title: "Visiteur", desc: "Prix catalogue standard", key: "public", highlight: false },
            { title: "Client enregistré", desc: "Tarifs préférentiels exclusifs", key: "client", highlight: true },
            { title: "Sous-traitant", desc: "Tarifs professionnels compétitifs", key: "subcontractor", highlight: false },
          ].map((tier, i) => (
            <motion.div key={tier.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className={`rounded-2xl p-8 border ${tier.highlight ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" : "border-border bg-card"}`}>
              {tier.highlight && <div className="text-xs font-semibold text-primary mb-3 uppercase tracking-wider">Recommandé</div>}
              <h3 className="text-xl font-bold mb-2">{tier.title}</h3>
              <p className="text-muted-foreground text-sm mb-4">{tier.desc}</p>
              <div className="space-y-2">
                {["Calcul automatique m²", "Suivi commandes en ligne", "Devis instantané"].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle className={`h-4 w-4 ${tier.highlight ? "text-primary" : "text-green-500"}`} />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              {!user && tier.key === "client" && (
                <Button className="w-full mt-6" asChild>
                  <Link href="/auth/register">Créer un compte</Link>
                </Button>
              )}
            </motion.div>
          ))}
        </div>

        {/* Pricing table */}
        {isLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-4 font-semibold">Service</th>
                    <th className="text-right p-4 font-semibold text-muted-foreground">Visiteur</th>
                    <th className="text-right p-4 font-semibold text-primary">Client</th>
                    <th className="text-right p-4 font-semibold text-amber-500">Sous-traitant</th>
                  </tr>
                </thead>
                <tbody>
                  {services?.map((service, i) => (
                    <tr key={service.id} className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                      <td className="p-4 font-medium">
                        <Link href={`/services/${service.slug}`} className="hover:text-primary transition-colors">
                          {language === "ar" ? service.nameAr : service.nameFr}
                        </Link>
                      </td>
                      <td className="text-right p-4 text-muted-foreground">{service.publicPricePerM2.toLocaleString()} DA/m²</td>
                      <td className="text-right p-4 font-semibold text-primary">{service.clientPricePerM2.toLocaleString()} DA/m²</td>
                      <td className="text-right p-4 font-semibold text-amber-500">{service.subcontractorPricePerM2.toLocaleString()} DA/m²</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">Besoin d'un tarif spécial ou d'une grande quantité?</p>
          <Button size="lg" asChild variant="outline">
            <Link href="/contact">Contactez-nous pour un devis sur mesure</Link>
          </Button>
        </div>
      </div>
    </PublicLayout>
  );
}
