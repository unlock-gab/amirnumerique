import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { useGetOrder } from "@workspace/api-client-react";
import { useI18n } from "@/hooks/use-i18n";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  ArrowLeft, Loader2, Ruler, Package2, CreditCard,
  FileText, Download, CalendarDays
} from "lucide-react";
import { OrderTimeline } from "@/components/order-timeline";
import { cn } from "@/lib/utils";

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

function CardHeader({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border/60 bg-muted/30">
      <Icon className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{label}</span>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center px-5 py-3 border-b border-border/40 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground text-right">{value}</span>
    </div>
  );
}

export default function OrderDetail() {
  const { t } = useI18n();
  const [, params] = useRoute("/dashboard/orders/:id");
  const id = params?.id ? parseInt(params.id) : 0;
  const { data: order, isLoading } = useGetOrder(id, { query: { enabled: !!id } });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-24">
          <Loader2 className="h-7 w-7 animate-spin text-primary/40" />
        </div>
      </DashboardLayout>
    );
  }

  if (!order) {
    return (
      <DashboardLayout>
        <div className="text-center py-24">
          <p className="text-muted-foreground mb-4">Commande introuvable</p>
          <Button asChild><Link href="/dashboard/orders">Retour aux commandes</Link></Button>
        </div>
      </DashboardLayout>
    );
  }

  const o = order as any;
  const service   = o.service;
  const category  = o.category;
  const payment   = PAYMENT_META[order.paymentStatus] ?? { label: order.paymentStatus, cls: "bg-muted text-muted-foreground border-border" };
  const totalDA   = (order.finalPrice || order.displayedPrice).toLocaleString("fr-DZ");

  return (
    <DashboardLayout>
      <div className="max-w-3xl">

        {/* ── Nav ─────────────────────────────────────────── */}
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground -ml-2 mb-5">
          <Link href="/dashboard/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />{t("myOrders")}
          </Link>
        </Button>

        {/* ── Page Header ──────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">{order.orderNumber}</h1>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 flex-shrink-0" />
              {new Date(order.createdAt).toLocaleDateString("fr-DZ", { day: "numeric", month: "long", year: "numeric" })}
              {service && (
                <>
                  <span className="text-border mx-0.5">·</span>
                  {service.nameFr}
                  {category && <><span className="text-border mx-0.5">·</span>{category.nameFr}</>}
                </>
              )}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground leading-none">{totalDA}</p>
            <p className="text-xs text-muted-foreground mt-1">Dinars (DA)</p>
          </div>
        </div>

        {/* ── Timeline ────────────────────────────────────── */}
        <div className="mb-5">
          <OrderTimeline orderId={order.id} currentStatus={order.orderStatus} />
        </div>

        {/* ── Detail grid ──────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

          <Card>
            <CardHeader icon={Ruler} label="Dimensions & Surface" />
            {service   && <Row label="Service"             value={service.nameFr} />}
            {category  && <Row label="Catégorie"           value={category.nameFr} />}
            <Row label="Dimensions saisies"   value={`${order.widthInput} × ${order.heightInput} ${order.unitInput}`} />
            <Row label="Dimensions réelles"   value={`${order.widthM.toFixed(2)} × ${order.heightM.toFixed(2)} m`} />
            <Row label="Surface"              value={`${order.areaM2.toFixed(2)} m²`} />
            <Row label="Prix unitaire"        value={`${order.unitPricePerM2.toLocaleString()} DA / m²`} />
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader icon={Package2} label="Montant de la commande" />
              <div className="px-5 py-5 text-center border-b border-border/40">
                <p className="text-3xl font-bold text-foreground tabular-nums">{totalDA}</p>
                <p className="text-xs text-muted-foreground mt-1">Dinars algériens</p>
              </div>
              <Row label="Surface" value={`${order.areaM2.toFixed(2)} m²`} />
              <Row label="Prix / m²" value={`${order.unitPricePerM2.toLocaleString()} DA`} />
            </Card>

            <Card>
              <CardHeader icon={CreditCard} label="Paiement" />
              <Row label="Méthode" value="Paiement à la livraison" />
              <Row
                label="Statut"
                value={
                  <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full border", payment.cls)}>
                    {payment.label}
                  </span>
                }
              />
            </Card>
          </div>
        </div>

        {/* ── Client note ──────────────────────────────────── */}
        {order.note && (
          <Card className="mb-4">
            <CardHeader icon={FileText} label="Votre message" />
            <div className="px-5 py-4">
              <p className="text-sm text-muted-foreground leading-relaxed">{order.note}</p>
            </div>
          </Card>
        )}

        {/* ── File ─────────────────────────────────────────── */}
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
    </DashboardLayout>
  );
}
