import { AdminLayout } from "@/components/layouts/admin-layout";
import { useListPortfolio, useCreatePortfolioItem, useUpdatePortfolioItem, useDeletePortfolioItem } from "@workspace/api-client-react";
import { useI18n } from "@/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Plus, Loader2, Pencil, Trash2, Star } from "lucide-react";

const portfolioSchema = z.object({
  titleFr: z.string().min(1, "Titre FR requis"),
  titleAr: z.string().min(1, "العنوان بالعربية مطلوب"),
  imageUrl: z.string().url("URL invalide"),
  category: z.string().min(1, "Catégorie requise"),
  isFeatured: z.boolean().default(false),
});

const CATEGORIES = ["enseigne", "vehicule", "decoration", "evenement", "vitrophanie", "panneau"];

export default function AdminPortfolio() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { data: items, isLoading, refetch } = useListPortfolio({});
  const createItem = useCreatePortfolioItem();
  const updateItem = useUpdatePortfolioItem();
  const deleteItem = useDeletePortfolioItem();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(portfolioSchema),
    defaultValues: { titleFr: "", titleAr: "", imageUrl: "", category: "enseigne", isFeatured: false },
  });

  const openCreate = () => {
    form.reset({ titleFr: "", titleAr: "", imageUrl: "", category: "enseigne", isFeatured: false });
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (item: any) => {
    form.reset({ titleFr: item.titleFr, titleAr: item.titleAr, imageUrl: item.imageUrl, category: item.category, isFeatured: item.isFeatured });
    setEditingId(item.id);
    setDialogOpen(true);
  };

  const onSubmit = form.handleSubmit((data) => {
    if (editingId) {
      updateItem.mutate({ id: editingId, data }, {
        onSuccess: () => { toast({ title: "Réalisation modifiée" }); setDialogOpen(false); refetch(); },
        onError: () => toast({ title: "Erreur", variant: "destructive" }),
      });
    } else {
      createItem.mutate({ data }, {
        onSuccess: () => { toast({ title: "Réalisation ajoutée" }); setDialogOpen(false); refetch(); },
        onError: () => toast({ title: "Erreur", variant: "destructive" }),
      });
    }
  });

  const handleDelete = (id: string) => {
    deleteItem.mutate({ id }, {
      onSuccess: () => { toast({ title: "Supprimé" }); setDeleteId(null); refetch(); },
      onError: () => toast({ title: "Erreur", variant: "destructive" }),
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t("managePortfolio")}</h1>
          <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />{t("create")}</Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items?.map((item) => (
              <div key={item.id} className="group relative bg-card border border-border rounded-xl overflow-hidden aspect-[4/3]">
                <img src={item.imageUrl} alt={item.titleFr} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                  <div className="flex justify-between">
                    {item.isFeatured && <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />}
                    <div className="flex gap-1 ml-auto">
                      <Button variant="secondary" size="icon" className="h-7 w-7" onClick={() => openEdit(item)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => setDeleteId(item.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{item.titleFr}</p>
                    <span className="text-white/60 text-xs capitalize">{item.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingId ? t("edit") : t("create")} une réalisation</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="titleFr" render={({ field }) => (
                  <FormItem><FormLabel>Titre (FR)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="titleAr" render={({ field }) => (
                  <FormItem><FormLabel>العنوان (AR)</FormLabel><FormControl><Input dir="rtl" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="imageUrl" render={({ field }) => (
                <FormItem><FormLabel>URL de l'image</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem>
                  <FormLabel>Catégorie</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>{t("cancel")}</Button>
                <Button type="submit" disabled={createItem.isPending || updateItem.isPending}>
                  {(createItem.isPending || updateItem.isPending) ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {editingId ? t("save") : t("create")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Supprimer cette réalisation ?</DialogTitle></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>{t("cancel")}</Button>
            <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)} disabled={deleteItem.isPending}>
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
