import { AdminLayout } from "@/components/layouts/admin-layout";
import { useListSettings, useUpdateSetting } from "@workspace/api-client-react";
import { useI18n } from "@/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2, Save } from "lucide-react";

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
  const updateSetting = useUpdateSetting();
  const [values, setValues] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);

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
      <div className="max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold">{t("settings")}</h1>

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
      </div>
    </AdminLayout>
  );
}
