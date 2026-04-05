import { AdminLayout } from "@/components/layouts/admin-layout";
import { useGetOrder, useUpdateOrderStatus } from "@workspace/api-client-react";
import { useI18n } from "@/hooks/use-i18n";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  ArrowLeft, Loader2, User, Ruler, CreditCard,
  FileText, Download, CalendarDays, Save, StickyNote,
  Package2, Mail, Phone, Layers
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState, useCallback, useEffect } from "react";
import { OrderTimeline } from "@/components/order-timeline";

const STATUS_OPTIONS = [
  { value: "pending",     label: "En attente" },
  { value: "confirmed",   label: "Confirmée" },
  { value: "in_progress", label: "En préparation" },
  { value: "printing",    label: "En impression" },
  { value: "ready",       label: "Prête" },
  { value: "delivered",   label: "Livrée" },
  { value: "cancelled",   label: "Annulée" },
];
const PAYMENT_OPTIONS = [
  { value: "pending_on_delivery", label: "À la livraison" },
  { value: "paid",                label: "Payé" },
  { value: "cancelled",           label: "Annulé" },
];
const STATUS_COLORS: Record<string, string> = {
  pending:     "bg-amber-500/10 text-amber-400 border-amber-500/25",
  confirmed:   "bg-blue-500/10 text-blue-400 border-blue-500/25",
  in_progress: "bg-violet-500/10 text-violet-400 border-violet-500/25",
  printing:    "bg-indigo-500/10 text-indigo-400 border-indigo-500/25",
  ready:       "bg-cyan-500/10 text-cyan-400 border-cyan-500/25",
  delivered:   "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
  cancelled:   "bg-red-500/10 text-red-400 border-red-500/25",
};
const STATUS_LABELS: Record<string, string> = {
  pending: "En attente", confirmed: "Confirmée", in_progress: "En préparation",
  printing: "En impression", ready: "Prête", delivered: "Livrée", cancelled: "Annulée",
};
const PAYMENT_COLORS: Record<string, string> = {
  pending_on_delivery: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  paid:                "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  cancelled:           "bg-red-500/10 text-red-400 border-red-500/20",
};
const PAYMENT_LABELS: Record<string, string> = {
  pending_on_delivery: "À la livraison", paid: "Payé", cancelled: "Annulé",
};

function SectionCard({ title, icon: Icon, children, action }: {
  title: string; icon: React.ElementType; children: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[hsl(222,30%,8%)] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <Icon className="h-4 w-4 text-primary" strokeWidth={2} />
          <h2 className="text-xs font-semibold text-white/60 uppercase tracking-wider">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center px-5 py-3 border-b border-white/[0.04] last:border-0">
      <span className="text-sm text-white/40">{label}</span>
      <span className="text-sm font-medium text-white/80 text-right max-w-[55%]">{value}</span>
    </div>
  );
}

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map(p => p[0]).join("").toUpperCase();
}

export default function AdminOrderDetail() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [, params] = useRoute("/admin/orders/:id");
  const id = params?.id ? parseInt(params.id) : 0;
  const { data: order, isLoading, refetch } = useGetOrder(id, { query: { enabled: !!id } });
  const updateOrder = useUpdateOrderStatus();
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [timelineKey, setTimelineKey] = useState(0);
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    if (order && !initialized) {
      setOrderStatus(order.orderStatus);
      setPaymentStatus(order.paymentStatus);
      setAdminNote((order as any).adminNote || "");
      setInitialized(true);
    }
  }, [order, initialized]);

  const handleSaveStatus = useCallback(() => {
    if (!id) return;
    updateOrder.mutate({ id, data: { orderStatus: orderStatus as any, paymentStatus: paymentStatus as any } }, {
      onSuccess: () => {
        toast({ title: "Statut mis à jour" });
        refetch();
        setTimelineKey(k => k + 1);
      },
      onError: () => toast({ title: "Erreur lors de la mise à jour", variant: "destructive" }),
    });
  }, [id, orderStatus, paymentStatus, updateOrder, refetch, toast]);

  const handleSaveNote = useCallback(async () => {
    if (!id) return;
    setSavingNote(true);
    try {
      const res = await fetch(`/api/orders/${id}/admin-note`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNote }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Note interne sauvegardée" });
    } catch {
      toast({ title: "Erreur lors de la sauvegarde", variant: "destructive" });
    } finally {
      setSavingNote(false);
    }
  }, [id, adminNote, toast]);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-24">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="text-center py-24">
          <p className="text-white/40 mb-4">Commande introuvable</p>
          <Button asChild><Link href="/admin/orders">Retour aux commandes</Link></Button>
        </div>
      </AdminLayout>
    );
  }

  const o = order as any;
  const user = o.user;
  const service = o.service;
  const category = o.category;
  const totalPrice = (order.finalPrice || order.displayedPrice).toLocaleString("fr-DZ");

  return (
    <AdminLayout>
      <div className="space-y-5">

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="text-white/40 hover:text-white/70 -ml-2">
            <Link href="/admin/orders">
              <ArrowLeft className="mr-2 h-4 w-4" />{t("manageOrders")}
            </Link>
          </Button>
        </div>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight">{order.orderNumber}</h1>
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${STATUS_COLORS[orderStatus || order.orderStatus] || "bg-muted/20 border-border text-white/50"}`}>
                {STATUS_LABELS[orderStatus || order.orderStatus] || orderStatus}
              </span>
            </div>
            <p className="text-sm text-white/35 mt-1.5 flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              {new Date(order.createdAt).toLocaleDateString("fr-DZ", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-2xl bg-[hsl(222,30%,8%)] border border-white/[0.07]">
            <div className="text-right">
              <p className="text-xs text-white/35 uppercase tracking-wide">Montant</p>
              <p className="text-xl font-bold text-white">{totalPrice} <span className="text-sm font-normal text-white/40">DA</span></p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          <div className="lg:col-span-2 space-y-5">

            {user && (
              <SectionCard title="Client" icon={User}>
                <div className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">{getInitials(user.fullName || "?")}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-white/90">{user.fullName}</p>
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
                        {user.role}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                      {user.email && (
                        <a href={`mailto:${user.email}`} className="text-xs text-white/40 hover:text-white/60 flex items-center gap-1.5 transition-colors">
                          <Mail className="h-3 w-3" />{user.email}
                        </a>
                      )}
                      {user.phone && (
                        <a href={`tel:${user.phone}`} className="text-xs text-white/40 hover:text-white/60 flex items-center gap-1.5 transition-colors">
                          <Phone className="h-3 w-3" />{user.phone}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </SectionCard>
            )}

            <SectionCard title="Détails de la commande" icon={Ruler}>
              {service && <DataRow label="Service" value={service.nameFr} />}
              {category && <DataRow label="Catégorie" value={category.nameFr} />}
              <DataRow
                label="Dimensions saisies"
                value={`${order.widthInput} × ${order.heightInput} ${order.unitInput}`}
              />
              <DataRow
                label="Dimensions réelles"
                value={`${order.widthM.toFixed(2)} × ${order.heightM.toFixed(2)} m`}
              />
              <DataRow label="Surface" value={`${order.areaM2.toFixed(2)} m²`} />
              <DataRow label="Prix unitaire" value={`${order.unitPricePerM2.toLocaleString()} DA/m²`} />
              <DataRow label="Prix affiché" value={`${order.displayedPrice.toLocaleString()} DA`} />
              <DataRow
                label="Prix final"
                value={
                  <span className="text-emerald-400 font-semibold">{totalPrice} DA</span>
                }
              />
              <DataRow
                label="Paiement"
                value={
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${PAYMENT_COLORS[order.paymentStatus] || "bg-muted/20 text-white/50 border-border"}`}>
                    {PAYMENT_LABELS[order.paymentStatus] || order.paymentStatus}
                  </span>
                }
              />
            </SectionCard>

            {order.note && (
              <SectionCard title="Message du client" icon={FileText}>
                <div className="px-5 py-4">
                  <p className="text-sm text-white/55 leading-relaxed">{order.note}</p>
                </div>
              </SectionCard>
            )}

            {order.fileUrl && (
              <SectionCard title="Fichier d'impression" icon={FileText}>
                <div className="p-5 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/60 truncate">
                      {order.fileUrl.split("/").pop() || "Fichier joint"}
                    </p>
                    <p className="text-xs text-white/30 mt-0.5">Fichier client</p>
                  </div>
                  <a
                    href={order.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-medium text-primary border border-primary/30 bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-xl transition-colors flex-shrink-0"
                  >
                    <Download className="h-4 w-4" />
                    Télécharger
                  </a>
                </div>
              </SectionCard>
            )}

            <OrderTimeline
              key={timelineKey}
              orderId={order.id}
              currentStatus={orderStatus || order.orderStatus}
            />

          </div>

          <div className="space-y-5">

            <SectionCard title="Gérer la commande" icon={Package2}>
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-xs text-white/40 font-medium block mb-2 uppercase tracking-wide">
                    Statut de la commande
                  </label>
                  <Select value={orderStatus} onValueChange={setOrderStatus}>
                    <SelectTrigger data-testid="select-status" className="bg-white/[0.04] border-white/[0.08]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map(o => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs text-white/40 font-medium block mb-2 uppercase tracking-wide">
                    Statut du paiement
                  </label>
                  <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                    <SelectTrigger data-testid="select-payment" className="bg-white/[0.04] border-white/[0.08]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_OPTIONS.map(o => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleSaveStatus}
                  disabled={updateOrder.isPending}
                  data-testid="button-save-order"
                  className="w-full"
                >
                  {updateOrder.isPending
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sauvegarde...</>
                    : <><Save className="mr-2 h-4 w-4" />Enregistrer</>}
                </Button>
              </div>
            </SectionCard>

            <SectionCard title="Note interne" icon={StickyNote}>
              <div className="p-5 space-y-3">
                <Textarea
                  value={adminNote}
                  onChange={e => setAdminNote(e.target.value)}
                  placeholder="Ajouter une note interne visible uniquement par l'équipe…"
                  rows={5}
                  className="bg-white/[0.04] border-white/[0.08] text-white/70 placeholder:text-white/20 resize-none text-sm focus:border-primary/40"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveNote}
                  disabled={savingNote}
                  className="w-full border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.06]"
                >
                  {savingNote
                    ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Sauvegarde...</>
                    : <><Save className="mr-2 h-3.5 w-3.5" />Sauvegarder la note</>}
                </Button>
              </div>
            </SectionCard>

            <div className="rounded-2xl border border-white/[0.07] bg-[hsl(222,30%,8%)] p-5 space-y-3">
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Récapitulatif</h3>
              <div className="space-y-2">
                {[
                  { label: "Surface", value: `${order.areaM2.toFixed(2)} m²` },
                  { label: "Prix/m²", value: `${order.unitPricePerM2.toLocaleString()} DA` },
                  { label: "Total", value: `${totalPrice} DA`, emphasis: true },
                ].map(({ label, value, emphasis }) => (
                  <div key={label} className={`flex justify-between items-center py-1.5 ${emphasis ? "border-t border-white/[0.06] mt-2 pt-3" : ""}`}>
                    <span className={`text-xs ${emphasis ? "text-white/60 font-medium" : "text-white/35"}`}>{label}</span>
                    <span className={`text-sm font-semibold ${emphasis ? "text-emerald-400" : "text-white/70"}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
