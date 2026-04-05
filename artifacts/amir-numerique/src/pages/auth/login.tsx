import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useLogin, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/hooks/use-i18n";
import { Loader2, PrinterCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export default function Login() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const login = useLogin();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit((data) => {
    login.mutate({ data }, {
      onSuccess: (res) => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        setLocation(res.user.role === "admin" ? "/admin" : "/dashboard");
      },
      onError: (err: any) => {
        toast({ title: "Erreur de connexion", description: err?.response?.data?.error || "Identifiants incorrects", variant: "destructive" });
      },
    });
  });

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary/10 via-card to-card items-center justify-center p-16">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)", backgroundSize: "50px 50px" }} />
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="relative max-w-sm text-center space-y-6">
          <img src="/logo.jpg" alt="Amir Numérique" className="h-20 w-auto object-contain mx-auto rounded-xl" />
          <h2 className="font-display text-3xl font-700 tracking-tight">
            Bienvenue sur<br /><span className="text-gradient">Amir Numérique</span>
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            La plateforme de référence pour l'impression numérique professionnelle en Algérie.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-4">
            {[{ v: "500+", l: "Clients" }, { v: "1200+", l: "Projets" }, { v: "+20 ans", l: "Expérience" }, { v: "48h", l: "Livraison" }].map((s) => (
              <div key={s.l} className="bg-muted/40 rounded-xl p-3 text-center">
                <div className="font-display font-700 text-primary text-lg">{s.v}</div>
                <div className="text-xs text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm space-y-8"
        >
          <div className="text-center lg:text-left">
            <Link href="/" className="inline-flex items-center gap-2 mb-6 lg:hidden">
              <img src="/logo.jpg" alt="Amir Numérique" className="h-9 w-auto object-contain rounded" />
            </Link>
            <h1 className="font-display text-2xl font-700 tracking-tight mb-1">{t("login")}</h1>
            <p className="text-sm text-muted-foreground">
              Pas encore de compte ?{" "}
              <Link href="/auth/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
                {t("register")}
              </Link>
            </p>
          </div>

          <div className="space-y-5">
            <Form {...form}>
              <form onSubmit={onSubmit} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">{t("email")}</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="vous@exemple.com"
                          data-testid="input-email"
                          className="h-11 bg-muted/40 border-border/60 focus:border-primary/50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">{t("password")}</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          data-testid="input-password"
                          className="h-11 bg-muted/40 border-border/60 focus:border-primary/50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full h-11 font-semibold shadow-lg shadow-primary/20 mt-1"
                  disabled={login.isPending}
                  data-testid="button-login"
                >
                  {login.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connexion en cours...</>
                  ) : (
                    <>{t("login")} <ArrowRight className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
              </form>
            </Form>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
