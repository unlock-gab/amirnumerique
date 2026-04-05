import { AdminLayout } from "@/components/layouts/admin-layout";
import { useGetOrder, useUpdateOrderStatus } from "@workspace/api-client-react";
import { useI18n } from "@/hooks/use-i18n";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  ArrowLeft, Loader2, User, Ruler, CreditCard,
  FileText, Download, CalendarDays, Save, StickyNote,
  Package2, Mail, Phone
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState, useCallback, useEffect } from "react";
import { OrderTimeline } from "@/components/order-timeline";
import { cn } from "@/lib/utils";

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
const PAYMENT_META: Record<string, { label: string; cls: string }> = {
  pending_on_delivery: { label: "À la livraison", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  paid:                { label: "Payé",           cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  cancelled:           { label: "Annulé",         cls: "bg-red-50 text-red-700 border-red-200" },
};

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card overflow-hidden shadow-sm", className)}>
      {children}
    </div>
  );
}

function CardHeader({ icon: Icon, label, action }: {
  icon: React.ElementType; label: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/60 bg-muted/30">
      <div className="flex items-center gap-2.5">
        <Icon className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{label}</span>
      </div>
      {action}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center px-5 py-3 border-b border-border/40 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground text-right max-w-[55%]">{value}</span>
    </div>
  );
}

function getInitials(name: string) {
  return (name || "?").split(" ").slice(0, 2).map(p => p[0]).join("").toUpperCase();
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
          <Loader2 className="h-7 w-7 animate-spin text-primary/40" />
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="text-center py-24">
          <p className="text-muted-foreground mb-4">Commande introuvable</p>
          <Button asChild><Link href="/admin/orders">Retour aux commandes</Link></Button>
        </div>
      </AdminLayout>
    );
  }

  const o = order as any;
  const user     = o.user;
  const service  = o.service;
  const category = o.category;
  const totalDA  = (order.finalPrice || order.displayedPrice).toLocaleString("fr-DZ");
  const payment  = PAYMENT_META[order.paymentStatus] ?? { label: order.paymentStatus, cls: "bg-muted text-muted-foreground border-border" };

  return (
    <AdminLayout>
      <div className="space-y-5">

        {/* ── Nav ─────────────────────────────────────────── */}
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground -ml-2">
          <Link href="/admin/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />{t("manageOrders")}
          </Link>
        </Button>

        {/* ── Page Header ──────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">{order.orderNumber}</h1>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 flex-shrink-0" />
              {new Date(order.createdAt).toLocaleString("fr-DZ", {
                weekday: "long", day: "numeric", month: "long", year: "numeric",
              })}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card shadow-sm px-5 py-3 text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total</p>
            <p className="text-xl font-bold text-foreground mt-0.5">{totalDA} <span className="text-sm font-normal text-muted-foreground">DA</span></p>
          </div>
        </div>

        {/* ── Main 2-col layout ────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* LEFT — main content */}
          <div className="lg:col-span-2 space-y-4">

            <OrderTimeline
              key={timelineKey}
              orderId={order.id}
              currentStatus={orderStatus || order.orderStatus}
            />

            {/* Customer */}
            {user && (
              <Card>
                <CardHeader icon={User} label="Client" />
                <div className="p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">{getInitials(user.fullName)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-foreground">{user.fullName}</p>
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
                        {user.role}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 mt-1.5">
                      {user.email && (
                        <a href={`mailto:${user.email}`} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                          <Mail className="h-3 w-3" />{user.email}
                        </a>
                      )}
                      {user.phone && (
                        <a href={`tel:${user.phone}`} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                          <Phone className="h-3 w-3" />{user.phone}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Order specs */}
            <Card>
              <CardHeader icon={Ruler} label="Détails de la commande" />
              {service   && <Row label="Service"             value={service.nameFr} />}
              {category  && <Row label="Catégorie"           value={category.nameFr} />}
              <Row label="Dimensions saisies"   value={`${order.widthInput} × ${order.heightInput} ${order.unitInput}`} />
              <Row label="Dimensions réelles"   value={`${order.widthM.toFixed(2)} × ${order.heightM.toFixed(2)} m`} />
              <Row label="Surface"              value={`${order.areaM2.toFixed(2)} m²`} />
              <Row label="Prix unitaire"        value={`${order.unitPricePerM2.toLocaleString()} DA / m²`} />
              <Row label="Prix affiché"         value={`${order.displayedPrice.toLocaleString()} DA`} />
              <Row
                label="Prix final"
                value={<span className="text-emerald-600 font-semibold">{totalDA} DA</span>}
              />
              <Row
                label="Paiement"
                value={
                  <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full border", payment.cls)}>
                    {payment.label}
                  </span>
                }
              />
            </Card>

            {/* Client note */}
            {order.note && (
              <Card>
                <CardHeader icon={FileText} label="Message du client" />
                <div className="px-5 py-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">{order.note}</p>
                </div>
              </Card>
            )}

            {/* File */}
            {order.fileUrl && (
              <Card>
                <div className="p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">Fichier d'impression</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {order.fileUrl.split("/").pop() || "Fichier joint"}
                    </p>
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
              </Card>
            )}

          </div>

          {/* RIGHT — sidebar actions */}
          <div className="space-y-4">

            {/* Status management */}
            <Card>
              <CardHeader icon={Package2} label="Gérer la commande" />
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">
                    Statut
                  </label>
                  <Select value={orderStatus} onValueChange={setOrderStatus}>
                    <SelectTrigger data-testid="select-status" className="h-10">
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
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">
                    Paiement
                  </label>
                  <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                    <SelectTrigger data-testid="select-payment" className="h-10">
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
            </Card>

            {/* Quick recap */}
            <Card>
              <CardHeader icon={CreditCard} label="Récapitulatif" />
              <div className="p-4 space-y-2">
                {[
                  { label: "Surface",   value: `${order.areaM2.toFixed(2)} m²` },
                  { label: "Prix / m²", value: `${order.unitPricePerM2.toLocaleString()} DA` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-1.5">
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <span className="text-xs font-medium text-foreground">{value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-2 border-t border-border/50 mt-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total</span>
                  <span className="text-base font-bold text-emerald-600">{totalDA} DA</span>
                </div>
              </div>
            </Card>

            {/* Admin note */}
            <Card>
              <CardHeader icon={StickyNote} label="Note interne" />
              <div className="p-4 space-y-3">
                <Textarea
                  value={adminNote}
                  onChange={e => setAdminNote(e.target.value)}
                  placeholder="Note interne (visible uniquement par l'équipe)…"
                  rows={5}
                  className="resize-none text-sm leading-relaxed"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveNote}
                  disabled={savingNote}
                  className="w-full"
                >
                  {savingNote
                    ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Sauvegarde...</>
                    : <><Save className="mr-2 h-3.5 w-3.5" />Sauvegarder</>}
                </Button>
              </div>
            </Card>

          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
