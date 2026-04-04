import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { useGetMe, useUpdateProfile } from "@workspace/api-client-react";
import { useI18n } from "@/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const schema = z.object({
  fullName: z.string().min(2, "Nom requis"),
  phone: z.string().optional(),
  preferredLanguage: z.enum(["fr", "ar"]),
});

const ROLE_LABELS: Record<string, string> = {
  visitor: "Visiteur", client: "Client", subcontractor: "Sous-traitant", admin: "Administrateur",
};
const ROLE_COLORS: Record<string, string> = {
  visitor: "bg-muted text-muted-foreground", client: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  subcontractor: "bg-amber-500/10 text-amber-600 border-amber-500/20", admin: "bg-primary/10 text-primary border-primary/20",
};

export default function DashboardProfile() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { data: user, isLoading } = useGetMe();
  const updateProfile = useUpdateProfile();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", phone: "", preferredLanguage: "fr" as "fr" | "ar" },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        fullName: user.fullName,
        phone: user.phone || "",
        preferredLanguage: (user.preferredLanguage as "fr" | "ar") || "fr",
      });
    }
  }, [user]);

  const onSubmit = form.handleSubmit((data) => {
    updateProfile.mutate({ data }, {
      onSuccess: () => toast({ title: "Profil mis à jour" }),
      onError: () => toast({ title: "Erreur", variant: "destructive" }),
    });
  });

  if (isLoading) {
    return <DashboardLayout><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="max-w-xl">
        <h1 className="text-2xl font-bold mb-8">{t("profile")}</h1>

        <div className="bg-card border border-border rounded-xl p-6 mb-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <User className="h-7 w-7 text-primary" />
          </div>
          <div>
            <div className="font-bold text-lg">{user?.fullName}</div>
            <div className="text-sm text-muted-foreground">{user?.email}</div>
            <Badge className={`mt-1 border text-xs ${ROLE_COLORS[user?.role || "visitor"] || ""}`} variant="outline">
              {ROLE_LABELS[user?.role || "visitor"] || user?.role}
            </Badge>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-semibold mb-5">Modifier mes informations</h2>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-5">
              <FormField control={form.control} name="fullName" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fullName")}</FormLabel>
                  <FormControl><Input data-testid="input-fullname" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div>
                <FormLabel className="block mb-1.5 text-sm font-medium">{t("email")}</FormLabel>
                <Input value={user?.email || ""} disabled className="opacity-60" />
                <p className="text-xs text-muted-foreground mt-1">L'email ne peut pas être modifié</p>
              </div>

              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("phone")}</FormLabel>
                  <FormControl><Input placeholder="0555 123 456" data-testid="input-phone" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="preferredLanguage" render={({ field }) => (
                <FormItem>
                  <FormLabel>Langue préférée</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="ar">العربية</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <Button type="submit" disabled={updateProfile.isPending} data-testid="button-save-profile">
                {updateProfile.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sauvegarde...</> : t("save")}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </DashboardLayout>
  );
}
