import { AdminLayout } from "@/components/layouts/admin-layout";
import { useListSettings, useUpdateSetting, useGetMe } from "@workspace/api-client-react";
import { useI18n } from "@/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2, Save, Mail, Lock, User } from "lucide-react";

const SETTINGS_CONFIG = [
  { key: "company_name", label: "Nom de l'entreprise", type: "text", placeholder: "Amir Numérique" },
  { key: "company_phone", label: "Téléphone", type: "text", placeholder: "+213 555 123 456" },
  { key: "company_email", label: "Email", type: "email", placeholder: "contact@amirnumerique.dz" },
  { key: "company_address", label: "Adresse", type: "text", placeholder: "Zone Industrielle, Alger" },
  { key: "company_whatsapp", label: "WhatsApp", type: "text", placeholder: "+213 555 123 456" },
  { key: "company_facebook", label: "Facebook URL", type: "url", placeholder: "https://facebook.com/..." },
  { key: "company_instagram", label: "Instagram URL", type: "url", placeholder: "https://instagram.com/..." },
  { key: "hero_title_fr", label: "Titre hero (FR)", type: "text", placeholder: "L'Excellence de l'Impression Numérique" },
  { key: "hero_title_ar", label: "عنوان البانر (AR)", type: "text", placeholder: "التميز في الطباعة الرقمية" },
  { key: "about_text_fr", label: "À propos (FR)", type: "textarea", placeholder: "Texte de présentation..." },
  { key: "about_text_ar", label: "نص عن الشركة (AR)", type: "textarea", placeholder: "نص التعريف..." },
];

export default function AdminSettings() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { data: settings, isLoading, refetch } = useListSettings();
  const { data: me } = useGetMe();
  const updateSetting = useUpdateSetting();
  const [values, setValues] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);

  // Account section state
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountLoading, setAccountLoading] = useState(false);

  const handleEmailChange = async () => {
    if (!newEmail || !emailPassword) {
      toast({ title: "Champs requis", description: "Email et mot de passe actuel requis", variant: "destructive" });
      return;
    }
    setAccountLoading(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: newEmail, currentPassword: emailPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Erreur", description: data.error || "Échec de la mise à jour", variant: "destructive" });
        return;
      }
      toast({ title: "Email mis à jour", description: `Nouvel email : ${data.email}` });
      setNewEmail("");
      setEmailPassword("");
    } catch {
      toast({ title: "Erreur réseau", variant: "destructive" });
    } finally {
      setAccountLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ title: "Champs requis", description: "Remplissez tous les champs", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Erreur", description: "Les mots de passe ne correspondent pas", variant: "destructive" });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: "Erreur", description: "Le mot de passe doit contenir au moins 8 caractères", variant: "destructive" });
      return;
    }
    setAccountLoading(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Erreur", description: data.error || "Mot de passe actuel incorrect", variant: "destructive" });
        return;
      }
      toast({ title: "Mot de passe mis à jour" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast({ title: "Erreur réseau", variant: "destructive" });
    } finally {
      setAccountLoading(false);
    }
  };

  if (settings && !initialized && Array.isArray(settings)) {
    const map: Record<string, string> = {};
    settings.forEach((s: any) => { map[s.key] = s.value; });
    setValues(map);
    setInitialized(true);
  }

  const handleSave = (key: string) => {
    const setting = Array.isArray(settings) ? settings.find((s: any) => s.key === key) : null;
    if (!setting) {
      toast({ title: "Paramètre introuvable", description: "Ce paramètre n'existe pas encore dans la base.", variant: "destructive" });
      return;
    }
    updateSetting.mutate({ id: setting.id, data: { value: values[key] || "" } }, {
      onSuccess: () => { toast({ title: "Paramètre sauvegardé" }); refetch(); },
      onError: () => toast({ title: "Erreur", variant: "destructive" }),
    });
  };

  if (isLoading) {
    return <AdminLayout><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl space-y-8">
        <h1 className="text-2xl font-bold">{t("settings")}</h1>

        {/* Company settings */}
        <div className="space-y-4">
          {SETTINGS_CONFIG.map(config => (
            <div key={config.key} className="bg-card border border-border rounded-xl p-5">
              <label className="text-sm font-medium block mb-2">{config.label}</label>
              {config.type === "textarea" ? (
                <Textarea
                  value={values[config.key] || ""}
                  onChange={e => setValues(v => ({ ...v, [config.key]: e.target.value }))}
                  placeholder={config.placeholder}
                  rows={3}
                  dir={config.key.endsWith("_ar") ? "rtl" : "ltr"}
                  data-testid={`setting-${config.key}`}
                />
              ) : (
                <Input
                  type={config.type}
                  value={values[config.key] || ""}
                  onChange={e => setValues(v => ({ ...v, [config.key]: e.target.value }))}
                  placeholder={config.placeholder}
                  dir={config.key.endsWith("_ar") ? "rtl" : "ltr"}
                  data-testid={`setting-${config.key}`}
                />
              )}
              <div className="flex justify-end mt-3">
                <Button size="sm" variant="outline" onClick={() => handleSave(config.key)} disabled={updateSetting.isPending}>
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                  {t("save")}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Admin account section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pt-2">
            <User className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-semibold">Compte administrateur</h2>
          </div>
          {me && (
            <p className="text-sm text-muted-foreground">
              Email actuel : <span className="text-foreground font-medium">{(me as any).email}</span>
            </p>
          )}

          {/* Change email */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium">Changer l'adresse email</label>
            </div>
            <Input
              type="email"
              placeholder="Nouvel email"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Mot de passe actuel (confirmation)"
              value={emailPassword}
              onChange={e => setEmailPassword(e.target.value)}
            />
            <div className="flex justify-end">
              <Button size="sm" onClick={handleEmailChange} disabled={accountLoading}>
                {accountLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
                Mettre à jour l'email
              </Button>
            </div>
          </div>

          {/* Change password */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium">Changer le mot de passe</label>
            </div>
            <Input
              type="password"
              placeholder="Mot de passe actuel"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Nouveau mot de passe (min. 8 caractères)"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Confirmer le nouveau mot de passe"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
            <div className="flex justify-end">
              <Button size="sm" onClick={handlePasswordChange} disabled={accountLoading}>
                {accountLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
                Changer le mot de passe
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
