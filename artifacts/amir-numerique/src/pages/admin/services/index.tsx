import { AdminLayout } from "@/components/layouts/admin-layout";
import { useListServices, useCreateService, useUpdateService, useDeleteService, useUploadFile, useListServiceCategories } from "@workspace/api-client-react";
import { useI18n } from "@/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useRef, useState } from "react";
import { Plus, Loader2, Pencil, Trash2, CheckCircle, XCircle, ImagePlus, X, Globe, Hash, Layers } from "lucide-react";
import { motion } from "framer-motion";

const serviceSchema = z.object({
  categoryId: z.coerce.number().optional(),
  nameFr: z.string().min(1, "Nom FR requis"),
  nameAr: z.string().min(1, "Nom AR requis"),
  descriptionFr: z.string().optional(),
  descriptionAr: z.string().optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  imageUrl: z.string().optional(),
  publicPricePerM2: z.coerce.number().min(0),
  clientPricePerM2: z.coerce.number().min(0),
  subcontractorPricePerM2: z.coerce.number().min(0),
  requiresFileUpload: z.boolean().default(false),
  active: z.boolean().default(true),
});
type ServiceForm = z.infer<typeof serviceSchema>;

const PRICE_TIERS = [
  { key: "publicPricePerM2" as const, label: "Public", color: "text-muted-foreground", bg: "bg-muted/60", border: "border-border/60" },
  { key: "clientPricePerM2" as const, label: "Client", color: "text-blue-400", bg: "bg-blue-500/8", border: "border-blue-500/20" },
  { key: "subcontractorPricePerM2" as const, label: "Sous-trait.", color: "text-amber-400", bg: "bg-amber-500/8", border: "border-amber-500/20" },
];

export default function AdminServices() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { data: services, isLoading, refetch } = useListServices({});
  const { data: categories } = useListServiceCategories({});
  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();
  const uploadFile = useUploadFile();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ServiceForm>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { categoryId: undefined, nameFr: "", nameAr: "", descriptionFr: "", descriptionAr: "", slug: "", imageUrl: "", publicPricePerM2: 0, clientPricePerM2: 0, subcontractorPricePerM2: 0, requiresFileUpload: false, active: true },
  });

  const openCreate = () => {
    form.reset({ categoryId: undefined, nameFr: "", nameAr: "", descriptionFr: "", descriptionAr: "", slug: "", imageUrl: "", publicPricePerM2: 0, clientPricePerM2: 0, subcontractorPricePerM2: 0, requiresFileUpload: false, active: true });
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (service: any) => {
    form.reset({
      categoryId: service.categoryId ?? undefined,
      nameFr: service.nameFr, nameAr: service.nameAr,
      descriptionFr: service.descriptionFr || "", descriptionAr: service.descriptionAr || "",
      slug: service.slug, imageUrl: service.imageUrl || "",
      publicPricePerM2: service.publicPricePerM2,
      clientPricePerM2: service.clientPricePerM2,
      subcontractorPricePerM2: service.subcontractorPricePerM2,
      requiresFileUpload: service.requiresFileUpload ?? false,
      active: service.active,
    });
    setEditingId(service.id);
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const res = await uploadFile.mutateAsync({ data: { file } });
      form.setValue("imageUrl", (res as any).url);
      toast({ title: "Image téléchargée" });
    } catch {
      toast({ title: "Erreur d'upload", variant: "destructive" });
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const onSubmit = form.handleSubmit((data) => {
    const payload = { ...data, imageUrl: data.imageUrl || undefined };
    if (editingId) {
      updateService.mutate({ id: editingId, data: payload }, {
        onSuccess: () => { toast({ title: "Service modifié" }); setDialogOpen(false); refetch(); },
        onError: () => toast({ title: "Erreur", variant: "destructive" }),
      });
    } else {
      createService.mutate({ data: payload }, {
        onSuccess: () => { toast({ title: "Service créé" }); setDialogOpen(false); refetch(); },
        onError: () => toast({ title: "Erreur", variant: "destructive" }),
      });
    }
  });

  const handleDelete = (id: string) => {
    deleteService.mutate({ id }, {
      onSuccess: () => { toast({ title: "Service supprimé" }); setDeleteConfirmId(null); refetch(); },
      onError: () => toast({ title: "Erreur", variant: "destructive" }),
    });
  };

  const imageUrl = form.watch("imageUrl");

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Page header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-700 tracking-tight">{t("manageServices")}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {services?.length ?? 0} service{(services?.length ?? 0) !== 1 ? "s" : ""} configuré{(services?.length ?? 0) !== 1 ? "s" : ""}
            </p>
          </div>
          <Button onClick={openCreate} className="shrink-0 shadow-lg shadow-primary/15" data-testid="button-create-service">
            <Plus className="h-4 w-4 mr-2" /> Créer un service
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {services?.map((service, i) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                data-testid={`admin-service-${service.id}`}
              >
                <div className="group rounded-2xl border border-border/60 bg-card hover:border-primary/30 hover:shadow-xl hover:shadow-black/20 transition-all duration-300 overflow-hidden">
                  {/* Top: image + info + actions */}
                  <div className="flex gap-0">
                    {/* Image thumbnail */}
                    <div className="w-24 shrink-0 bg-muted/40 relative overflow-hidden">
                      {service.imageUrl ? (
                        <img src={service.imageUrl} alt={service.nameFr} className="w-full h-full object-cover absolute inset-0" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="font-display text-xl font-800 text-muted-foreground/20">AN</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/20" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-5 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          {/* Status + title */}
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-1.5 h-1.5 rounded-full ${service.active ? "bg-emerald-500" : "bg-red-500"}`} />
                            <h3 className="font-display font-600 text-base leading-tight truncate group-hover:text-primary transition-colors">
                              {service.nameFr}
                            </h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1 leading-tight" dir="rtl">{service.nameAr}</p>

                          {/* Slug + status */}
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground/60 bg-muted/40 px-2 py-0.5 rounded-md font-mono">
                              <Hash className="h-2.5 w-2.5" />{service.slug}
                            </span>
                            <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md ${service.active ? "text-emerald-500 bg-emerald-500/10" : "text-red-500 bg-red-500/10"}`}>
                              {service.active ? <CheckCircle className="h-2.5 w-2.5" /> : <XCircle className="h-2.5 w-2.5" />}
                              {service.active ? "Actif" : "Inactif"}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => openEdit(service)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
                            title="Modifier"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(service.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                            title="Supprimer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom: pricing tiers */}
                  <div className="px-5 pb-5">
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {PRICE_TIERS.map((tier) => (
                        <div key={tier.key} className={`rounded-xl border px-3 py-2.5 ${tier.bg} ${tier.border}`}>
                          <div className={`text-[10px] font-600 font-display uppercase tracking-wider mb-0.5 ${tier.color}`}>{tier.label}</div>
                          <div className={`font-display font-700 text-sm tabular-nums ${tier.color}`}>
                            {(service[tier.key as keyof typeof service] as number).toLocaleString()}
                          </div>
                          <div className="text-[9px] text-muted-foreground/60">DA/m²</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader className="pb-2">
            <DialogTitle className="font-display font-700 text-lg">
              {editingId ? "Modifier le service" : "Créer un service"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Image upload */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Photo du service</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-muted/50 border border-border/60 overflow-hidden relative shrink-0">
                    {imageUrl ? (
                      <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Globe className="h-6 w-6 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => imageInputRef.current?.click()}
                        disabled={uploadingImage}
                      >
                        {uploadingImage ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
                        Télécharger une photo
                      </Button>
                      {imageUrl && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => form.setValue("imageUrl", "")}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">JPG, PNG, WebP — max 10MB</p>
                  </div>
                  <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </div>
                {/* Or paste URL */}
                <FormField control={form.control} name="imageUrl" render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} placeholder="Ou coller une URL d'image..." className="text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* Category selector */}
              <FormField control={form.control} name="categoryId" render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5 text-xs">
                    <Layers className="h-3.5 w-3.5" /> Catégorie
                  </FormLabel>
                  <FormControl>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    >
                      <option value="">-- Sans catégorie --</option>
                      {categories?.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.nameFr}</option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="nameFr" render={({ field }) => (
                  <FormItem><FormLabel className="flex items-center gap-1.5 text-xs">Nom <span className="text-[10px] bg-muted/60 px-1.5 py-0.5 rounded font-mono">FR</span></FormLabel>
                    <FormControl><Input {...field} placeholder="Bâche Publicitaire" /></FormControl><FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="nameAr" render={({ field }) => (
                  <FormItem><FormLabel className="flex items-center gap-1.5 text-xs">الاسم <span className="text-[10px] bg-muted/60 px-1.5 py-0.5 rounded font-mono">AR</span></FormLabel>
                    <FormControl><Input dir="rtl" {...field} /></FormControl><FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="slug" render={({ field }) => (
                <FormItem><FormLabel className="text-xs flex items-center gap-1.5">Slug URL <Hash className="h-3 w-3 text-muted-foreground" /></FormLabel>
                  <FormControl><Input placeholder="bache-publicitaire" className="font-mono text-sm" {...field} /></FormControl><FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="descriptionFr" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs">Description FR</FormLabel>
                    <FormControl><Textarea rows={3} className="resize-none text-sm" {...field} /></FormControl><FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="descriptionAr" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs">الوصف AR</FormLabel>
                    <FormControl><Textarea dir="rtl" rows={3} className="resize-none text-sm" {...field} /></FormControl><FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* Pricing */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Tarification (DA/m²)</label>
                <div className="grid grid-cols-3 gap-3">
                  {PRICE_TIERS.map((tier) => (
                    <FormField key={tier.key} control={form.control} name={tier.key} render={({ field }) => (
                      <FormItem>
                        <FormLabel className={`text-xs font-600 ${tier.color}`}>{tier.label}</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="10" className={`font-mono text-sm border ${tier.border}`} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="active" render={({ field }) => (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50">
                    <div>
                      <div className="text-sm font-medium">Service actif</div>
                      <div className="text-xs text-muted-foreground">Visible publiquement</div>
                    </div>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </div>
                )} />
                <FormField control={form.control} name="requiresFileUpload" render={({ field }) => (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50">
                    <div>
                      <div className="text-sm font-medium">Fichier requis</div>
                      <div className="text-xs text-muted-foreground">Fichier d'impression obligatoire</div>
                    </div>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </div>
                )} />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>{t("cancel")}</Button>
                <Button type="submit" className="min-w-24" disabled={createService.isPending || updateService.isPending || uploadingImage}>
                  {(createService.isPending || updateService.isPending) ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {editingId ? "Enregistrer" : "Créer"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display font-700">Supprimer ce service ?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Cette action est irréversible. Les commandes liées resteront en base de données.</p>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteConfirmId(null)}>{t("cancel")}</Button>
            <Button variant="destructive" size="sm" onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)} disabled={deleteService.isPending}>
              {deleteService.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
