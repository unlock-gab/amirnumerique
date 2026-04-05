import { PublicLayout } from "@/components/layouts/public-layout";
import { useI18n } from "@/hooks/use-i18n";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useListSettings } from "@workspace/api-client-react";
import { Phone, Mail, MapPin, MessageSquare, CheckCircle, Loader2, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Contact() {
  const { t } = useI18n();
  const { data: settings } = useListSettings();

  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const getSetting = (key: string) => settings?.find((s) => s.key === key)?.value || "";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending || submitted) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 900));
    setSending(false);
    setSubmitted(true);
  };

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("contact")}</h1>
          <div className="h-1 w-20 bg-primary mx-auto rounded-full mb-6" />
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Notre équipe est disponible pour répondre à toutes vos questions
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left — form or success */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-card border border-border rounded-2xl p-8 min-h-[420px] flex flex-col">
              <AnimatePresence mode="wait">
                {submitted ? (
                  /* ── Success state ── */
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 24, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col items-center justify-center text-center flex-1 py-6"
                  >
                    {/* Animated check */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: "spring", stiffness: 220, damping: 18 }}
                      className="w-20 h-20 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center mb-7"
                    >
                      <CheckCircle className="h-10 w-10 text-primary" />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                    >
                      <h2 className="font-display text-2xl font-800 tracking-tight mb-4 leading-snug">
                        Votre demande a bien été envoyée
                      </h2>
                      <p className="text-muted-foreground leading-relaxed max-w-sm mb-4">
                        Merci pour votre confiance. Nous avons bien reçu votre demande et notre équipe vous contactera dans les plus brefs délais.
                      </p>
                      <p className="text-sm text-muted-foreground/60 mb-8">
                        En attendant, découvrez quelques-unes de nos réalisations.
                      </p>

                      <Button asChild className="gap-2 btn-premium">
                        <Link href="/portfolio">
                          Voir nos réalisations
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </motion.div>
                  </motion.div>
                ) : (
                  /* ── Contact form ── */
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col flex-1">
                    <h2 className="text-2xl font-bold mb-6">Envoyez-nous un message</h2>
                    <form onSubmit={handleSubmit} className="space-y-5 flex flex-col flex-1">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-1.5 block">{t("fullName")}</label>
                          <Input placeholder="Votre nom" data-testid="input-contact-name" required disabled={sending} />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1.5 block">{t("phone")}</label>
                          <Input placeholder="0555 123 456" data-testid="input-contact-phone" disabled={sending} />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">{t("email")}</label>
                        <Input type="email" placeholder="vous@exemple.com" data-testid="input-contact-email" required disabled={sending} />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Sujet</label>
                        <Input placeholder="Objet de votre message" data-testid="input-contact-subject" required disabled={sending} />
                      </div>
                      <div className="flex-1">
                        <label className="text-sm font-medium mb-1.5 block">Message</label>
                        <Textarea placeholder="Votre message..." rows={5} data-testid="textarea-contact-message" required disabled={sending} className="resize-none" />
                      </div>
                      <Button
                        type="submit"
                        className="w-full h-11 gap-2 btn-premium font-600"
                        disabled={sending}
                        data-testid="button-contact-submit"
                      >
                        {sending ? (
                          <><Loader2 className="h-4 w-4 animate-spin" /> Envoi en cours...</>
                        ) : (
                          <>Envoyer le message <ArrowRight className="h-4 w-4" /></>
                        )}
                      </Button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Right — contact info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
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
