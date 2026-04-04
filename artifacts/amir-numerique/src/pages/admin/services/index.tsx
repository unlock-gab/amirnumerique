import { AdminLayout } from "@/components/layouts/admin-layout";
import { useListServices, useCreateService, useUpdateService, useDeleteService } from "@workspace/api-client-react";
import { useI18n } from "@/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Plus, Loader2, Pencil, Trash2, CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";

const serviceSchema = z.object({
  nameFr: z.string().min(1, "Nom FR requis"),
  nameAr: z.string().min(1, "Nom AR requis"),
  descriptionFr: z.string().optional(),
  descriptionAr: z.string().optional(),
  slug: z.string().min(1, "Slug requis").regex(/^[a-z0-9-]+$/, "Lettres minuscules et tirets uniquement"),
  publicPricePerM2: z.coerce.number().min(0),
  clientPricePerM2: z.coerce.number().min(0),
  subcontractorPricePerM2: z.coerce.number().min(0),
  active: z.boolean().default(true),
});

type ServiceForm = z.infer<typeof serviceSchema>;

export default function AdminServices() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { data: services, isLoading, refetch } = useListServices({});
  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const form = useForm<ServiceForm>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { nameFr: "", nameAr: "", descriptionFr: "", descriptionAr: "", slug: "", publicPricePerM2: 0, clientPricePerM2: 0, subcontractorPricePerM2: 0, active: true },
  });

  const openCreate = () => {
    form.reset({ nameFr: "", nameAr: "", descriptionFr: "", descriptionAr: "", slug: "", publicPricePerM2: 0, clientPricePerM2: 0, subcontractorPricePerM2: 0, active: true });
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (service: any) => {
    form.reset({
      nameFr: service.nameFr, nameAr: service.nameAr,
      descriptionFr: service.descriptionFr || "", descriptionAr: service.descriptionAr || "",
      slug: service.slug,
      publicPricePerM2: service.publicPricePerM2,
      clientPricePerM2: service.clientPricePerM2,
      subcontractorPricePerM2: service.subcontractorPricePerM2,
      active: service.active,
    });
    setEditingId(service.id);
    setDialogOpen(true);
  };

  const onSubmit = form.handleSubmit((data) => {
    if (editingId) {
      updateService.mutate({ id: editingId, data }, {
        onSuccess: () => { toast({ title: "Service modifié" }); setDialogOpen(false); refetch(); },
        onError: () => toast({ title: "Erreur", variant: "destructive" }),
      });
    } else {
      createService.mutate({ data }, {
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t("manageServices")}</h1>
          <Button onClick={openCreate} data-testid="button-create-service">
            <Plus className="h-4 w-4 mr-2" />{t("create")}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services?.map((service, i) => (
              <motion.div key={service.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-xl p-5" data-testid={`admin-service-${service.id}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold">{service.nameFr}</h3>
                      {service.active ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                    </div>
                    <p className="text-sm text-muted-foreground" dir="rtl">{service.nameAr}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">/{service.slug}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(service)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteConfirmId(service.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center p-2 rounded-lg bg-muted/50">
                    <div className="text-xs text-muted-foreground">Public</div>
                    <div className="font-semibold">{service.publicPricePerM2.toLocaleString()}</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-blue-500/10">
                    <div className="text-xs text-blue-500">Client</div>
                    <div className="font-semibold text-blue-600">{service.clientPricePerM2.toLocaleString()}</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-amber-500/10">
                    <div className="text-xs text-amber-500">S-Trait.</div>
                    <div className="font-semibold text-amber-600">{service.subcontractorPricePerM2.toLocaleString()}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? t("edit") : t("create")} un service</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="nameFr" render={({ field }) => (
                  <FormItem><FormLabel>Nom (FR)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="nameAr" render={({ field }) => (
                  <FormItem><FormLabel>الاسم (AR)</FormLabel><FormControl><Input dir="rtl" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="slug" render={({ field }) => (
                <FormItem><FormLabel>Slug (URL)</FormLabel><FormControl><Input placeholder="impression-grand-format" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="descriptionFr" render={({ field }) => (
                  <FormItem><FormLabel>Description (FR)</FormLabel><FormControl><Textarea rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="descriptionAr" render={({ field }) => (
                  <FormItem><FormLabel>الوصف (AR)</FormLabel><FormControl><Textarea dir="rtl" rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField control={form.control} name="publicPricePerM2" render={({ field }) => (
                  <FormItem><FormLabel>Prix public (DA/m²)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="clientPricePerM2" render={({ field }) => (
                  <FormItem><FormLabel>Prix client (DA/m²)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="subcontractorPricePerM2" render={({ field }) => (
                  <FormItem><FormLabel>Prix S-T (DA/m²)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>{t("cancel")}</Button>
                <Button type="submit" disabled={createService.isPending || updateService.isPending}>
                  {(createService.isPending || updateService.isPending) ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {editingId ? t("save") : t("create")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Supprimer ce service ?</DialogTitle></DialogHeader>
          <p className="text-muted-foreground text-sm">Cette action est irréversible. Les commandes liées à ce service resteront en base.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>{t("cancel")}</Button>
            <Button variant="destructive" onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)} disabled={deleteService.isPending}>
              {deleteService.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
