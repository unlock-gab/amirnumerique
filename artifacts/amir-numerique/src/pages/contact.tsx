import { PublicLayout } from "@/components/layouts/public-layout";
import { useI18n } from "@/hooks/use-i18n";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useListSettings } from "@workspace/api-client-react";
import { Phone, Mail, MapPin, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { t } = useI18n();
  const { data: settings } = useListSettings();
  const { toast } = useToast();

  const getSetting = (key: string) => settings?.find(s => s.key === key)?.value || "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Message envoyé", description: "Nous vous répondrons dans les plus brefs délais." });
  };

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("contact")}</h1>
          <div className="h-1 w-20 bg-primary mx-auto rounded-full mb-6" />
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Notre équipe est disponible pour répondre à toutes vos questions
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div className="bg-card border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6">Envoyez-nous un message</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">{t("fullName")}</label>
                    <Input placeholder="Votre nom" data-testid="input-contact-name" required />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">{t("phone")}</label>
                    <Input placeholder="0555 123 456" data-testid="input-contact-phone" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t("email")}</label>
                  <Input type="email" placeholder="vous@exemple.com" data-testid="input-contact-email" required />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Sujet</label>
                  <Input placeholder="Objet de votre message" data-testid="input-contact-subject" required />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Message</label>
                  <Textarea placeholder="Votre message..." rows={5} data-testid="textarea-contact-message" required />
                </div>
                <Button type="submit" className="w-full h-11" data-testid="button-contact-submit">
                  Envoyer le message
                </Button>
              </form>
            </div>
          </motion.div>

          {/* Contact info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-6">Informations de contact</h2>
              <div className="space-y-4">
                {[
                  { icon: Phone, label: "Téléphone", value: getSetting("company_phone") || "+213 555 123 456" },
                  { icon: Mail, label: "Email", value: getSetting("company_email") || "contact@amirnumerique.dz" },
                  { icon: MapPin, label: "Adresse", value: getSetting("company_address") || "Zone Industrielle, Alger" },
                  { icon: MessageSquare, label: "WhatsApp", value: getSetting("company_whatsapp") || "+213 555 123 456" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                      <p className="font-medium">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-2 text-primary">Horaires d'ouverture</h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex justify-between"><span>Dimanche - Jeudi</span><span className="font-medium text-foreground">8h00 - 18h00</span></div>
                <div className="flex justify-between"><span>Samedi</span><span className="font-medium text-foreground">9h00 - 14h00</span></div>
                <div className="flex justify-between"><span>Vendredi</span><span className="text-destructive">Fermé</span></div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </PublicLayout>
  );
}
