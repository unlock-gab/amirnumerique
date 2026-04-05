import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useListSettings } from "@workspace/api-client-react";
import { PublicLayout } from "@/components/layouts/public-layout";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Handshake, Building2, Phone, MapPin, Layers, BarChart3,
  MessageSquare, User, CheckCircle2, ArrowRight, Star, Shield,
  Zap, Send, Clock, Award, TrendingUp, ChevronRight,
  CheckCheck, Users2, Globe2, BadgeCheck,
} from "lucide-react";

/* ── Zod schema ─────────────────────────────────────────────────────────── */
const schema = z.object({
  fullName:        z.string().min(2, "Nom requis (min. 2 caractères)"),
  companyName:     z.string().min(1, "Nom de la société requis"),
  phone:           z.string().min(8, "Numéro de téléphone invalide"),
  city:            z.string().min(1, "Ville / Wilaya requise"),
  activityType:    z.string().min(1, "Type d'activité requis"),
  estimatedVolume: z.string().min(1, "Volume estimé requis"),
  message:         z.string().optional(),
});
type FormData = z.infer<typeof schema>;

/* ── Static data ─────────────────────────────────────────────────────────── */
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
  {
    icon: TrendingUp,
    color: "text-violet-400",
    bg: "bg-violet-400/10 border-violet-400/20",
    title: "Tarifs sous-traitants exclusifs",
    desc: "Accédez à nos grilles tarifaires professionnelles réservées aux partenaires certifiés.",
  },
  {
    icon: Zap,
    color: "text-amber-400",
    bg: "bg-amber-400/10 border-amber-400/20",
    title: "Production prioritaire",
    desc: "Vos commandes passent en priorité sur les plannings de production pour des délais optimaux.",
  },
  {
    icon: Shield,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10 border-emerald-400/20",
    title: "Qualité garantie",
    desc: "Matériaux premium et contrôle qualité rigoureux à chaque commande, sans exception.",
  },
  {
    icon: Award,
    color: "text-sky-400",
    bg: "bg-sky-400/10 border-sky-400/20",
    title: "Accompagnement dédié",
    desc: "Un interlocuteur unique pour vos commandes, devis et questions techniques.",
  },
];
const steps = [
  { num: "01", label: "Soumission", desc: "Remplissez le formulaire en 2 minutes" },
  { num: "02", label: "Examen",     desc: "Notre équipe étudie votre profil sous 24h" },
  { num: "03", label: "Contact",    desc: "Nous vous appelons pour finaliser l'accord" },
  { num: "04", label: "Accès",      desc: "Votre compte partenaire est activé" },
];
const stats = [
  { icon: Users2, value: "200+",  label: "Partenaires actifs" },
  { icon: Clock,  value: "24h",   label: "Délai de traitement" },
  { icon: Globe2, value: "15",    label: "Wilayas couvertes" },
  { icon: Star,   value: "5 ans", label: "D'expérience" },
];

/* ── WhatsApp helper ─────────────────────────────────────────────────────── */
const WA_ICON = (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current shrink-0">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

function buildWhatsAppUrl(data: FormData, number: string) {
  const lines = [
    "🤝 *Demande de sous-traitance — Amir Numérique*",
    "",
    `👤 *Nom :* ${data.fullName}`,
    `🏢 *Société :* ${data.companyName}`,
    `📞 *Téléphone :* ${data.phone}`,
    `📍 *Ville :* ${data.city}`,
    `🏭 *Activité :* ${data.activityType}`,
    `📊 *Volume :* ${data.estimatedVolume}`,
    ...(data.message ? ["", `💬 *Message :*`, data.message] : []),
    "", "---", "_amirNumerique.dz_",
  ];
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(lines.join("\n"))}`;
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function SubcontractorPage() {
  const [submitted, setSubmitted] = useState(false);
  const [savedData, setSavedData] = useState<FormData | null>(null);
  const { toast } = useToast();
  const { data: settings } = useListSettings();
  const whatsappNumber =
    (settings as any[])?.find((s: any) => s.key === "company_whatsapp")?.value ?? "213555123456";

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

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
    onSuccess: (_r, variables) => { setSavedData(variables); setSubmitted(true); reset(); },
    onError: () => toast({ title: "Erreur", description: "Veuillez réessayer.", variant: "destructive" }),
  });

  return (
    <PublicLayout>
      <div className="bg-background min-h-screen">

        {/* ── HERO ───────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-8 pb-16 md:pt-12 md:pb-20">
          {/* Background texture */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.18)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.18)_1px,transparent_1px)] bg-[size:56px_56px]" />
            <div className="absolute top-0 left-1/4 w-[500px] h-[400px] rounded-full bg-violet-500/6 blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] rounded-full bg-amber-500/5 blur-[100px]" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
          </div>

          <div className="relative container mx-auto px-4 max-w-5xl text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="inline-flex items-center gap-2 border border-violet-500/30 bg-violet-500/10 text-violet-300 text-[11px] font-700 tracking-[0.14em] uppercase px-4 py-2 rounded-full mb-7">
                <Handshake className="h-3.5 w-3.5" />
                Programme Partenaires Professionnels
              </div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-900 tracking-tight text-foreground mb-5 leading-[1.05]">
                Développez votre{" "}
                <span className="bg-gradient-to-r from-violet-400 via-violet-300 to-amber-400 bg-clip-text text-transparent">
                  activité d'impression
                </span>
                <br className="hidden md:block" />
                avec nous
              </h1>
              <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-10">
                Rejoignez le réseau de sous-traitants d'Amir Numérique et bénéficiez de tarifs
                professionnels exclusifs, d'une production prioritaire et d'un accès dédié.
              </p>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto"
            >
              {stats.map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 bg-white/[0.03] border border-white/[0.07] rounded-2xl px-4 py-4">
                  <Icon className="h-4 w-4 text-violet-400/70 mb-0.5" />
                  <span className="font-display text-2xl font-900 text-foreground">{value}</span>
                  <span className="text-[11px] text-muted-foreground/60 font-500 text-center leading-tight">{label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── MAIN: 2-column ─────────────────────────────────────────────── */}
        <section className="container mx-auto px-4 max-w-6xl pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-12 lg:gap-16 items-start">

            {/* ── LEFT: Trust content ────────────────────────────────────── */}
            <div className="space-y-12">

              {/* Benefits */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-6">
                  <p className="text-[10px] font-700 uppercase tracking-[0.16em] text-violet-400/70 mb-2">
                    Avantages exclusifs
                  </p>
                  <h2 className="font-display text-2xl md:text-3xl font-800 tracking-tight text-foreground">
                    Pourquoi rejoindre notre réseau ?
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {benefits.map(({ icon: Icon, color, bg, title, desc }) => (
                    <div
                      key={title}
                      className="group flex gap-4 p-5 rounded-2xl border border-white/[0.07] bg-white/[0.025] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-200"
                    >
                      <div className={cn("shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center", bg)}>
                        <Icon className={cn("h-4.5 w-4.5", color)} />
                      </div>
                      <div>
                        <div className="text-sm font-700 text-foreground mb-1">{title}</div>
                        <div className="text-xs text-muted-foreground/70 leading-relaxed">{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Process */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="mb-6">
                  <p className="text-[10px] font-700 uppercase tracking-[0.16em] text-violet-400/70 mb-2">
                    Comment ça marche
                  </p>
                  <h2 className="font-display text-2xl md:text-3xl font-800 tracking-tight text-foreground">
                    Un processus simple et rapide
                  </h2>
                </div>
                <div className="relative space-y-0">
                  {steps.map(({ num, label, desc }, i) => (
                    <div key={num} className="flex gap-5 relative">
                      {/* connector line */}
                      {i < steps.length - 1 && (
                        <div className="absolute left-[19px] top-10 w-px h-full bg-gradient-to-b from-violet-500/30 to-transparent" />
                      )}
                      {/* number bubble */}
                      <div className="shrink-0 w-10 h-10 rounded-full border border-violet-500/30 bg-violet-500/10 flex items-center justify-center z-10">
                        <span className="text-[11px] font-800 text-violet-400">{num}</span>
                      </div>
                      <div className="pb-7">
                        <div className="text-sm font-700 text-foreground mb-0.5 flex items-center gap-2">
                          {label}
                          {i === 0 && <span className="text-[10px] font-600 text-amber-400/70 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">2 min</span>}
                        </div>
                        <div className="text-xs text-muted-foreground/60 leading-relaxed">{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* WhatsApp direct CTA */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="rounded-2xl border border-[#25D366]/20 bg-[#25D366]/[0.06] p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-[#25D366]/15 border border-[#25D366]/25 flex items-center justify-center text-[#25D366]">
                    {WA_ICON}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-700 text-foreground mb-1">
                      Vous préférez discuter directement ?
                    </div>
                    <div className="text-xs text-muted-foreground/70 leading-relaxed mb-4">
                      Contactez-nous sur WhatsApp pour un premier échange rapide.
                      Notre équipe répond généralement en moins d'une heure.
                    </div>
                    <a
                      href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-600 text-sm text-white transition-all hover:opacity-90 active:scale-[0.98]"
                      style={{ backgroundColor: "#25D366" }}
                    >
                      {WA_ICON}
                      Discuter sur WhatsApp
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </a>
                  </div>
                </div>
              </motion.div>

              {/* Trust badges */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="flex flex-wrap gap-3"
              >
                {[
                  { icon: BadgeCheck, label: "Partenaires vérifiés" },
                  { icon: Shield,     label: "Données confidentielles" },
                  { icon: CheckCheck, label: "Réponse garantie 24h" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-xs text-muted-foreground/60 font-500">
                    <Icon className="h-3.5 w-3.5 text-emerald-400/60" />
                    {label}
                  </div>
                ))}
              </motion.div>
            </div>

            {/* ── RIGHT: Form ────────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:sticky lg:top-20"
            >
              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="rounded-3xl border border-white/[0.09] bg-[hsl(222,30%,7%)] overflow-hidden shadow-2xl shadow-black/40"
                  >
                    {/* Form header */}
                    <div className="relative px-7 py-6 border-b border-white/[0.07]">
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-500/8 via-transparent to-amber-500/5" />
                      <div className="relative">
                        <h2 className="font-display text-lg font-800 tracking-tight text-foreground mb-1">
                          Demande de partenariat
                        </h2>
                        <p className="text-[12px] text-muted-foreground/60 leading-relaxed">
                          Remplissez ce formulaire — nous vous contactons sous 24h.
                        </p>
                      </div>
                    </div>

                    {/* Form body */}
                    <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="p-7 space-y-4">

                      {/* Name */}
                      <FormField label="Nom complet" icon={<User className="h-3.5 w-3.5" />} error={errors.fullName?.message}>
                        <PremiumInput
                          {...register("fullName")}
                          placeholder="Ahmed Benali"
                          data-testid="input-fullName"
                        />
                      </FormField>

                      {/* Company */}
                      <FormField label="Société" icon={<Building2 className="h-3.5 w-3.5" />} error={errors.companyName?.message}>
                        <PremiumInput
                          {...register("companyName")}
                          placeholder="ImprimPro SARL"
                          data-testid="input-companyName"
                        />
                      </FormField>

                      {/* Phone + City */}
                      <div className="grid grid-cols-2 gap-3">
                        <FormField label="Téléphone" icon={<Phone className="h-3.5 w-3.5" />} error={errors.phone?.message}>
                          <PremiumInput
                            {...register("phone")}
                            placeholder="0555 12 34 56"
                            type="tel"
                            data-testid="input-phone"
                          />
                        </FormField>
                        <FormField label="Ville / Wilaya" icon={<MapPin className="h-3.5 w-3.5" />} error={errors.city?.message}>
                          <PremiumInput
                            {...register("city")}
                            placeholder="Alger"
                            data-testid="input-city"
                          />
                        </FormField>
                      </div>

                      {/* Activity */}
                      <FormField label="Type d'activité" icon={<Layers className="h-3.5 w-3.5" />} error={errors.activityType?.message}>
                        <PremiumSelect {...register("activityType")} data-testid="select-activityType">
                          <option value="">Sélectionnez votre activité</option>
                          {activityOptions.map(o => <option key={o} value={o} className="bg-[#1a1f2e]">{o}</option>)}
                        </PremiumSelect>
                        {errors.activityType && <FieldError msg={errors.activityType.message!} />}
                      </FormField>

                      {/* Volume */}
                      <FormField label="Volume mensuel estimé" icon={<BarChart3 className="h-3.5 w-3.5" />} error={errors.estimatedVolume?.message}>
                        <PremiumSelect {...register("estimatedVolume")} data-testid="select-estimatedVolume">
                          <option value="">Sélectionnez une fourchette</option>
                          {volumeOptions.map(o => <option key={o} value={o} className="bg-[#1a1f2e]">{o}</option>)}
                        </PremiumSelect>
                        {errors.estimatedVolume && <FieldError msg={errors.estimatedVolume.message!} />}
                      </FormField>

                      {/* Message */}
                      <FormField label="Message (optionnel)" icon={<MessageSquare className="h-3.5 w-3.5" />}>
                        <textarea
                          {...register("message")}
                          rows={3}
                          placeholder="Décrivez vos besoins, votre zone d'activité, vos clients types…"
                          data-testid="textarea-message"
                          className={cn(
                            "w-full rounded-xl px-4 py-3 text-sm font-500 resize-none",
                            "bg-white/[0.04] border border-white/[0.09] text-foreground",
                            "placeholder:text-muted-foreground/30",
                            "hover:border-violet-500/30 focus:border-violet-500/50 focus:outline-none",
                            "transition-colors duration-200"
                          )}
                        />
                      </FormField>

                      {/* Submit */}
                      <motion.button
                        type="submit"
                        disabled={mutation.isPending}
                        whileHover={{ scale: 1.015 }}
                        whileTap={{ scale: 0.985 }}
                        className={cn(
                          "w-full h-12 rounded-xl font-700 text-sm text-white mt-2",
                          "flex items-center justify-center gap-2.5",
                          "bg-gradient-to-r from-violet-600 to-violet-500",
                          "hover:from-violet-500 hover:to-violet-400",
                          "shadow-xl shadow-violet-500/20",
                          "transition-all duration-200",
                          "disabled:opacity-60 disabled:cursor-not-allowed"
                        )}
                        data-testid="btn-submit"
                      >
                        {mutation.isPending ? (
                          <>
                            <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            Envoi en cours…
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Envoyer la demande
                            <ArrowRight className="h-4 w-4 ml-auto" />
                          </>
                        )}
                      </motion.button>

                      {/* Or WhatsApp */}
                      <div className="relative flex items-center gap-3 py-1">
                        <div className="flex-1 h-px bg-white/[0.06]" />
                        <span className="text-[11px] text-muted-foreground/40 font-500">ou</span>
                        <div className="flex-1 h-px bg-white/[0.06]" />
                      </div>
                      <a
                        href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "w-full h-11 rounded-xl font-600 text-sm",
                          "flex items-center justify-center gap-2.5",
                          "border border-[#25D366]/25 text-[#25D366]",
                          "hover:bg-[#25D366]/10 hover:border-[#25D366]/40",
                          "transition-all duration-200"
                        )}
                        data-testid="btn-whatsapp"
                      >
                        {WA_ICON}
                        Contacter sur WhatsApp
                      </a>

                      <p className="text-[10px] text-muted-foreground/35 text-center leading-relaxed">
                        Vos informations sont confidentielles et ne seront jamais partagées.
                      </p>
                    </form>
                  </motion.div>
                ) : (
                  /* ── Success state ── */
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="rounded-3xl border border-emerald-500/25 bg-[hsl(222,30%,7%)] overflow-hidden shadow-2xl shadow-black/40"
                  >
                    {/* Glow top */}
                    <div className="relative h-2 bg-gradient-to-r from-violet-500 via-emerald-400 to-violet-500" />

                    <div className="p-8 text-center">
                      {/* Icon */}
                      <div className="relative inline-flex mb-6">
                        <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
                          <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                        </div>
                        <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                          <Handshake className="h-3.5 w-3.5 text-violet-400" />
                        </div>
                      </div>

                      <h2 className="font-display text-2xl font-800 text-foreground mb-2">
                        Demande envoyée !
                      </h2>
                      <p className="text-muted-foreground/70 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
                        Notre équipe examine votre profil et vous contactera dans les{" "}
                        <span className="text-foreground font-600">24 heures</span>.
                      </p>

                      {/* Next steps */}
                      <div className="text-left rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 mb-6 space-y-3">
                        <div className="text-[10px] font-700 uppercase tracking-[0.14em] text-muted-foreground/50 mb-4">
                          Prochaines étapes
                        </div>
                        {[
                          "Votre demande a été reçue et enregistrée",
                          "Un responsable examine votre profil",
                          "Vous recevrez un appel ou un message WhatsApp",
                          "Votre compte partenaire sera activé",
                        ].map((s, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <div className="shrink-0 w-5 h-5 rounded-full bg-violet-500/15 border border-violet-500/25 flex items-center justify-center mt-0.5">
                              <span className="text-[9px] font-800 text-violet-400">{i + 1}</span>
                            </div>
                            <span className="text-xs text-muted-foreground/70 leading-relaxed">{s}</span>
                          </div>
                        ))}
                      </div>

                      {/* WhatsApp CTA */}
                      {savedData && (
                        <a
                          href={buildWhatsAppUrl(savedData, whatsappNumber)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2.5 w-full h-12 rounded-xl font-700 text-sm text-white mb-3 transition-opacity hover:opacity-90"
                          style={{ backgroundColor: "#25D366" }}
                          data-testid="btn-whatsapp"
                        >
                          {WA_ICON}
                          Confirmer sur WhatsApp
                        </a>
                      )}

                      <button
                        onClick={() => { setSubmitted(false); setSavedData(null); }}
                        className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                      >
                        Soumettre une autre demande
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────────── */
import React from "react";

function FormField({ label, icon, error, children }: {
  label: string; icon?: React.ReactNode; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        {icon && <span className="text-muted-foreground/50">{icon}</span>}
        <label className="text-[11px] font-600 uppercase tracking-[0.1em] text-muted-foreground/60">
          {label}
        </label>
      </div>
      {children}
      {error && <FieldError msg={error} />}
    </div>
  );
}

function FieldError({ msg }: { msg: string }) {
  return <p className="text-[11px] text-red-400 flex items-center gap-1 mt-1">{msg}</p>;
}

const PremiumInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  (props, ref) => (
    <input
      ref={ref}
      {...props}
      className={cn(
        "w-full rounded-xl px-4 py-3 text-sm font-500",
        "bg-white/[0.04] border border-white/[0.09] text-foreground",
        "placeholder:text-muted-foreground/30",
        "hover:border-violet-500/30 focus:border-violet-500/50 focus:outline-none",
        "transition-colors duration-200",
        props.className
      )}
    />
  )
);
PremiumInput.displayName = "PremiumInput";

const PremiumSelect = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  (props, ref) => (
    <div className="relative">
      <select
        ref={ref}
        {...props}
        className={cn(
          "w-full appearance-none rounded-xl px-4 py-3 text-sm font-500 pr-9",
          "bg-white/[0.04] border border-white/[0.09] text-foreground",
          "hover:border-violet-500/30 focus:border-violet-500/50 focus:outline-none",
          "transition-colors duration-200 cursor-pointer",
          props.className
        )}
      />
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-[2px]">
        <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-b-[4px] border-l-transparent border-r-transparent border-b-muted-foreground/40" />
        <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-muted-foreground/40" />
      </div>
    </div>
  )
);
PremiumSelect.displayName = "PremiumSelect";
