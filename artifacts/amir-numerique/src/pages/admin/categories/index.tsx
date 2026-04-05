import { AdminLayout } from "@/components/layouts/admin-layout";
import {
  useListServiceCategories, useCreateServiceCategory, useUpdateServiceCategory,
  useDeleteServiceCategory, useUploadFile,
} from "@workspace/api-client-react";
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
import { Plus, Loader2, Pencil, Trash2, CheckCircle, XCircle, ImagePlus, X, GripVertical } from "lucide-react";
import { motion } from "framer-motion";

const categorySchema = z.object({
  nameFr: z.string().min(1, "Nom FR requis"),
  nameAr: z.string().min(1, "Nom AR requis"),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug: minuscules, chiffres et tirets uniquement"),
  descriptionFr: z.string().optional(),
  descriptionAr: z.string().optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean().default(true),
  displayOrder: z.coerce.number().int().min(0).default(0),
});
type CategoryForm = z.infer<typeof categorySchema>;

export default function AdminCategories() {
  const { toast } = useToast();
  const { data: categories, isLoading, refetch } = useListServiceCategories({});
  const createCategory = useCreateServiceCategory();
  const updateCategory = useUpdateServiceCategory();
  const deleteCategory = useDeleteServiceCategory();
  const uploadFile = useUploadFile();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: { nameFr: "", nameAr: "", slug: "", descriptionFr: "", descriptionAr: "", imageUrl: "", isActive: true, displayOrder: 0 },
  });

  const openCreate = () => {
    form.reset({ nameFr: "", nameAr: "", slug: "", descriptionFr: "", descriptionAr: "", imageUrl: "", isActive: true, displayOrder: (categories?.length ?? 0) });
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (cat: any) => {
    form.reset({
      nameFr: cat.nameFr, nameAr: cat.nameAr, slug: cat.slug,
      descriptionFr: cat.descriptionFr || "", descriptionAr: cat.descriptionAr || "",
      imageUrl: cat.imageUrl || "", isActive: cat.isActive, displayOrder: cat.displayOrder,
    });
    setEditingId(cat.id);
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const result = await uploadFile.mutateAsync({ data: fd } as any);
      form.setValue("imageUrl", (result as any).url);
      toast({ title: "Image uploadée" });
    } catch {
      toast({ title: "Erreur upload", variant: "destructive" });
    } finally {
      setUploadingImage(false);
    }
  };

  const onSubmit = async (data: CategoryForm) => {
    try {
      if (editingId !== null) {
        await updateCategory.mutateAsync({ id: editingId, data });
        toast({ title: "Catégorie mise à jour" });
      } else {
        await createCategory.mutateAsync({ data });
        toast({ title: "Catégorie créée" });
      }
      setDialogOpen(false);
      refetch();
    } catch (err: any) {
      toast({ title: "Erreur", description: err?.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCategory.mutateAsync({ id });
      toast({ title: "Catégorie supprimée" });
      setDeleteConfirmId(null);
      refetch();
    } catch (err: any) {
      toast({ title: "Erreur suppression", description: err?.message, variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-700 tracking-tight">Catégories de services</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Organisez vos services en catégories pour une navigation claire.
            </p>
          </div>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" /> Nouvelle catégorie
          </Button>
        </div>

        {/* Categories list */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !categories || categories.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border/50 rounded-xl text-muted-foreground">
            <p className="mb-3">Aucune catégorie. Commencez par en créer une.</p>
            <Button variant="outline" onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" /> Créer la première catégorie
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {[...categories].sort((a, b) => a.displayOrder - b.displayOrder).map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group glass rounded-xl p-5 flex items-center gap-5"
              >
                {/* Drag handle */}
                <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />

                {/* Image */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted/60 shrink-0 flex items-center justify-center">
                  {cat.imageUrl ? (
                    <img src={cat.imageUrl} alt={cat.nameFr} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-display text-2xl font-800 text-primary/20">
                      {cat.nameFr.charAt(0)}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-display font-600 text-base truncate">{cat.nameFr}</h3>
                    <span className="text-xs text-muted-foreground/60 truncate hidden sm:block">{cat.nameAr}</span>
                    {cat.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[10px] font-600 border border-green-500/20 shrink-0">
                        <CheckCircle className="h-2.5 w-2.5" /> Actif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-600 border border-border/40 shrink-0">
                        <XCircle className="h-2.5 w-2.5" /> Inactif
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <code className="bg-muted/60 px-1.5 py-0.5 rounded text-[11px]">{cat.slug}</code>
                    <span>Ordre: {cat.displayOrder}</span>
                    {cat.descriptionFr && (
                      <span className="truncate max-w-xs hidden md:block">{cat.descriptionFr}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="outline" size="sm" onClick={() => openEdit(cat)} className="h-8 w-8 p-0">
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  {deleteConfirmId === cat.id ? (
                    <div className="flex items-center gap-1">
                      <Button variant="destructive" size="sm" className="h-8 text-xs px-2.5"
                        onClick={() => handleDelete(cat.id)} disabled={deleteCategory.isPending}>
                        {deleteCategory.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Confirmer"}
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 text-xs px-2.5" onClick={() => setDeleteConfirmId(null)}>
                        Annuler
                      </Button>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => setDeleteConfirmId(cat.id)}
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:border-destructive/40">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display font-700">
              {editingId ? "Modifier la catégorie" : "Nouvelle catégorie"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-2">
              {/* Image */}
              <div>
                <label className="text-sm font-medium mb-2 block">Image de la catégorie</label>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted/60 flex items-center justify-center border border-border/40">
                    {form.watch("imageUrl") ? (
                      <img src={form.watch("imageUrl")} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <ImagePlus className="h-6 w-6 text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Button type="button" variant="outline" size="sm" className="gap-2"
                      onClick={() => imageInputRef.current?.click()} disabled={uploadingImage}>
                      {uploadingImage ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
                      {uploadingImage ? "Upload..." : "Choisir une image"}
                    </Button>
                    {form.watch("imageUrl") && (
                      <Button type="button" variant="ghost" size="sm" className="h-7 text-xs text-destructive"
                        onClick={() => form.setValue("imageUrl", "")}>
                        <X className="h-3 w-3 mr-1" /> Supprimer
                      </Button>
                    )}
                    <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </div>
                </div>
              </div>

              {/* Names */}
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="nameFr" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom (FR)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Impression Bâche" className="input-premium" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="nameAr" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom (AR)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="طباعة البنرات" dir="rtl" className="input-premium text-right" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* Slug + order */}
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="slug" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug URL</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="impression-bache" className="input-premium font-mono text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="displayOrder" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ordre d'affichage</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="0" className="input-premium" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* Descriptions */}
              <FormField control={form.control} name="descriptionFr" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (FR)</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Description en français..." className="input-premium resize-none" rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="descriptionAr" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (AR)</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="الوصف بالعربية..." dir="rtl" className="input-premium resize-none text-right" rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Active */}
              <FormField control={form.control} name="isActive" render={({ field }) => (
                <FormItem className="flex items-center gap-3 rounded-lg border border-border/40 p-4">
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div>
                    <FormLabel className="text-sm font-medium">Catégorie active</FormLabel>
                    <p className="text-xs text-muted-foreground">Visible sur le site public</p>
                  </div>
                </FormItem>
              )} />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
                <Button type="submit" disabled={createCategory.isPending || updateCategory.isPending} className="gap-2">
                  {(createCategory.isPending || updateCategory.isPending) && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingId ? "Enregistrer" : "Créer la catégorie"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
