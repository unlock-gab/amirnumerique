import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useListSettings } from "@workspace/api-client-react";
import { PublicLayout } from "@/components/layouts/public-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Handshake,
  Building2,
  Phone,
  MapPin,
  Layers,
  BarChart3,
  MessageSquare,
  User,
  CheckCircle2,
  ArrowRight,
  Star,
  Shield,
  Zap,
  Send,
} from "lucide-react";

const schema = z.object({
  fullName: z.string().min(2, "Nom requis (min. 2 caractères)"),
  companyName: z.string().min(1, "Nom de la société requis"),
  phone: z.string().min(8, "Numéro de téléphone invalide"),
  city: z.string().min(1, "Ville / Wilaya requise"),
  activityType: z.string().min(1, "Type d'activité requis"),
  estimatedVolume: z.string().min(1, "Volume estimé requis"),
  message: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const volumeOptions = [
  "Moins de 50 000 DA / mois",
  "50 000 – 150 000 DA / mois",
  "150 000 – 500 000 DA / mois",
  "Plus de 500 000 DA / mois",
];

const activityOptions = [
  "Agence de publicité",
  "Imprimerie",
  "Signalétique",
  "Communication visuelle",
  "Sérigraphie",
  "Distribution de flyers",
  "Décoration intérieure",
  "Autre",
];

const benefits = [
  { icon: Star, label: "Tarifs sous-traitants exclusifs", color: "text-amber-400" },
  { icon: Zap, label: "Livraison prioritaire", color: "text-sky-400" },
  { icon: Shield, label: "Qualité garantie", color: "text-emerald-400" },
];

function buildWhatsAppMessage(data: FormData): string {
  const lines = [
    "🤝 *Demande de sous-traitance — Amir Numerique*",
    "",
    `👤 *Nom :* ${data.fullName}`,
    `🏢 *Société :* ${data.companyName}`,
    `📞 *Téléphone :* ${data.phone}`,
    `📍 *Ville / Wilaya :* ${data.city}`,
    `🏭 *Activité :* ${data.activityType}`,
    `📊 *Volume estimé :* ${data.estimatedVolume}`,
  ];
  if (data.message) {
    lines.push(``, `💬 *Message :*`, data.message);
  }
  lines.push("", "---", "_Envoyé depuis amirNumerique.dz_");
  return lines.join("\n");
}

export default function SubcontractorPage() {
  const [submitted, setSubmitted] = useState(false);
  const [savedData, setSavedData] = useState<FormData | null>(null);
  const { toast } = useToast();

  const { data: settings } = useListSettings();
  const whatsappNumber =
    (settings as any[])?.find((s: any) => s.key === "company_whatsapp")?.value ?? "213XXXXXXXXX";

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch("/api/subcontractor-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erreur serveur");
      return res.json();
    },
    onSuccess: (_result, variables) => {
      setSavedData(variables);
      setSubmitted(true);
      reset();
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });

  const openWhatsApp = (data: FormData) => {
    const message = buildWhatsAppMessage(data);
    const encoded = encodeURIComponent(message);
    const number = whatsappNumber.replace(/\D/g, "");
    const url = `https://wa.me/${number}?text=${encoded}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <PublicLayout>
      <div className="min-h-screen bg-background">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-6 pb-20">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.25)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.25)_1px,transparent_1px)] bg-[size:48px_48px]" />
            <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-violet-500/8 blur-[100px]" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-amber-500/6 blur-[80px]" />
          </div>

          <div className="relative max-w-4xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-6">
                <Handshake className="h-3.5 w-3.5" />
                Programme partenaires
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
                Devenez{" "}
                <span className="bg-gradient-to-r from-violet-400 to-amber-400 bg-clip-text text-transparent">
                  sous-traitant
                </span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
                Rejoignez notre réseau de partenaires et bénéficiez de tarifs exclusifs,
                d'une priorité de production et d'un accompagnement personnalisé.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-6 mt-10"
            >
              {benefits.map(({ icon: Icon, label, color }) => (
                <div key={label} className="flex items-center gap-2.5 bg-card/60 border border-border/50 rounded-xl px-4 py-2.5">
                  <Icon className={`h-4 w-4 ${color}`} />
                  <span className="text-sm text-foreground/80 font-medium">{label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Form / Success ─────────────────────────────────────────── */}
        <section className="pb-24">
          <div className="max-w-2xl mx-auto px-6">
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-xl">
                    <div className="bg-gradient-to-r from-violet-500/10 to-amber-500/5 border-b border-border/40 px-8 py-6">
                      <h2 className="text-xl font-semibold text-foreground">
                        Demande de partenariat
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Remplissez le formulaire — nous vous contacterons dans les 24h.
                      </p>
                    </div>

                    <form
                      onSubmit={handleSubmit((data) => mutation.mutate(data))}
                      className="p-8 space-y-5"
                    >
                      {/* Full name */}
                      <Field
                        label="Nom complet"
                        icon={<User className="h-4 w-4" />}
                        error={errors.fullName?.message}
                      >
                        <Input
                          {...register("fullName")}
                          placeholder="Ex : Ahmed Benali"
                          data-testid="input-fullName"
                          className="bg-background/60"
                        />
                      </Field>

                      {/* Company */}
                      <Field
                        label="Nom de la société"
                        icon={<Building2 className="h-4 w-4" />}
                        error={errors.companyName?.message}
                      >
                        <Input
                          {...register("companyName")}
                          placeholder="Ex : ImprimPro SARL"
                          data-testid="input-companyName"
                          className="bg-background/60"
                        />
                      </Field>

                      {/* Phone + City row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field
                          label="Téléphone"
                          icon={<Phone className="h-4 w-4" />}
                          error={errors.phone?.message}
                        >
                          <Input
                            {...register("phone")}
                            placeholder="Ex : 0555 12 34 56"
                            type="tel"
                            data-testid="input-phone"
                            className="bg-background/60"
                          />
                        </Field>
                        <Field
                          label="Ville / Wilaya"
                          icon={<MapPin className="h-4 w-4" />}
                          error={errors.city?.message}
                        >
                          <Input
                            {...register("city")}
                            placeholder="Ex : Alger, Oran…"
                            data-testid="input-city"
                            className="bg-background/60"
                          />
                        </Field>
                      </div>

                      {/* Activity */}
                      <Field
                        label="Type d'activité"
                        icon={<Layers className="h-4 w-4" />}
                        error={errors.activityType?.message}
                      >
                        <select
                          {...register("activityType")}
                          data-testid="select-activityType"
                          className="w-full h-10 rounded-md border border-input bg-background/60 px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="">Sélectionnez votre activité</option>
                          {activityOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                        {errors.activityType && (
                          <p className="text-xs text-destructive mt-1">{errors.activityType.message}</p>
                        )}
                      </Field>

                      {/* Volume */}
                      <Field
                        label="Volume estimé mensuel"
                        icon={<BarChart3 className="h-4 w-4" />}
                        error={errors.estimatedVolume?.message}
                      >
                        <select
                          {...register("estimatedVolume")}
                          data-testid="select-estimatedVolume"
                          className="w-full h-10 rounded-md border border-input bg-background/60 px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="">Sélectionnez une fourchette</option>
                          {volumeOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                        {errors.estimatedVolume && (
                          <p className="text-xs text-destructive mt-1">{errors.estimatedVolume.message}</p>
                        )}
                      </Field>

                      {/* Message */}
                      <Field
                        label="Message (optionnel)"
                        icon={<MessageSquare className="h-4 w-4" />}
                        error={errors.message?.message}
                      >
                        <Textarea
                          {...register("message")}
                          placeholder="Décrivez vos besoins, vos clients types, votre zone d'activité…"
                          rows={4}
                          data-testid="textarea-message"
                          className="bg-background/60 resize-none"
                        />
                      </Field>

                      {/* Submit */}
                      <Button
                        type="submit"
                        disabled={mutation.isPending}
                        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white shadow-lg shadow-violet-500/20"
                        data-testid="btn-submit"
                      >
                        {mutation.isPending ? (
                          <span className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            Envoi en cours…
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Send className="h-4 w-4" />
                            Envoyer la demande
                          </span>
                        )}
                      </Button>
                    </form>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="bg-card border border-emerald-500/30 rounded-2xl p-10 text-center shadow-xl"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Demande envoyée !
                  </h2>
                  <p className="text-muted-foreground mb-8 leading-relaxed">
                    Votre demande a bien été enregistrée. Notre équipe vous contactera
                    dans les <span className="text-foreground font-medium">24 heures</span>.
                  </p>

                  <div className="bg-[#25D366]/10 border border-[#25D366]/30 rounded-xl p-5 mb-6">
                    <p className="text-sm text-foreground/80 mb-4 leading-relaxed">
                      Vous pouvez aussi nous contacter directement sur{" "}
                      <span className="text-[#25D366] font-semibold">WhatsApp</span>{" "}
                      pour un traitement encore plus rapide.
                    </p>
                    <Button
                      onClick={() => savedData && openWhatsApp(savedData)}
                      className="w-full h-11 font-semibold text-white"
                      style={{ backgroundColor: "#25D366" }}
                      data-testid="btn-whatsapp"
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5 mr-2 fill-white">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      Ouvrir WhatsApp
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    className="text-muted-foreground"
                    onClick={() => { setSubmitted(false); setSavedData(null); }}
                  >
                    Soumettre une autre demande
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}

/* ── Small helper component ─────────────────────────────────────────── */
function Field({
  label,
  icon,
  error,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-2 text-sm font-medium text-foreground/80">
        <span className="text-muted-foreground">{icon}</span>
        {label}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
