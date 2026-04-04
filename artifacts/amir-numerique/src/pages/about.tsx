import { PublicLayout } from "@/components/layouts/public-layout";
import { useI18n } from "@/hooks/use-i18n";
import { Building2, Mail, MapPin, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function About() {
  const { t } = useI18n();

  return (
    <PublicLayout>
      {/* Hero */}
      <div className="bg-muted py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        <div className="container px-4 mx-auto relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              <span className="text-primary">Amir Numérique</span><br/>
              L'Expertise Visuelle
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Depuis plus de 10 ans, nous accompagnons les entreprises algériennes dans leur communication visuelle avec des solutions d'impression de pointe.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container px-4 py-16 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold">Notre Parc Machines</h2>
            <p className="text-muted-foreground leading-relaxed">
              Pour garantir une qualité irréprochable et des délais respectés, nous avons investi dans un parc de machines dernière génération.
            </p>
            
            <div className="space-y-8 mt-8">
              <div>
                <h3 className="text-xl font-bold text-primary mb-2">Impression UV à Plat (Flatbed)</h3>
                <p className="text-muted-foreground mb-4">Impression directe sur supports rigides (Forex, Alucobond, Plexiglass, Verre, Bois) avec une résolution photographique et une résistance maximale en extérieur.</p>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-primary mb-2">Impression Eco-Solvant Grand Format</h3>
                <p className="text-muted-foreground mb-4">Laize jusqu'à 3.20m pour bâches, autocollants, one way vision et papier peint. Couleurs éclatantes et durabilité garantie.</p>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-primary mb-2">Découpe Numérique CNC & Laser</h3>
                <p className="text-muted-foreground mb-4">Pour la réalisation d'enseignes lumineuses, lettres en relief et PLV sur mesure avec une précision millimétrique.</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4"
          >
            <img src="/service-uv.png" alt="Machine UV" className="w-full h-64 object-cover rounded-lg" />
            <img src="/service-wide.png" alt="Machine Eco Solvant" className="w-full h-64 object-cover rounded-lg mt-8" />
            <img src="/service-signage.png" alt="Découpe" className="w-full h-64 object-cover rounded-lg" />
            <img src="/service-offset.png" alt="Finition" className="w-full h-64 object-cover rounded-lg mt-8" />
          </motion.div>
        </div>
      </div>

      {/* Values */}
      <div className="bg-card py-16">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Pourquoi nous choisir ?</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Qualité Premium", desc: "Des encres originales et des supports de premier choix pour un rendu optimal." },
              { title: "Délais Express", desc: "Une capacité de production importante permettant de répondre aux urgences." },
              { title: "Prix Compétitifs", desc: "Des tarifs étudiés pour les professionnels et des remises pour les revendeurs." }
            ].map((v, i) => (
              <Card key={i} className="bg-background border-border/50">
                <CardContent className="pt-6 text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{v.title}</h3>
                  <p className="text-muted-foreground">{v.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
