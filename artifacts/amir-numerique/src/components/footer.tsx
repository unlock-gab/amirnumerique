import { useI18n } from "@/hooks/use-i18n";
import { Link } from "wouter";
import { PrinterCheck, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="relative border-t border-border/40 bg-card overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/30 pointer-events-none" />

      <div className="relative container mx-auto px-4 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1 space-y-5">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <PrinterCheck className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <span className="font-display text-base font-700 text-foreground">
                Amir <span className="text-primary">Numérique</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              L'excellence de l'impression numérique en Algérie. Qualité premium pour professionnels et entreprises.
            </p>
            <div className="flex gap-3">
              {[
                { label: "500+", desc: "Clients" },
                { label: "1200+", desc: "Projets" },
              ].map((s) => (
                <div key={s.label} className="flex-1 bg-muted/40 rounded-lg p-3 text-center">
                  <div className="font-display font-700 text-primary text-lg">{s.label}</div>
                  <div className="text-xs text-muted-foreground">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-display font-600 text-foreground mb-5 text-sm uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-3">
              {[
                { href: "/", label: t("home") },
                { href: "/services", label: t("services") },
                { href: "/portfolio", label: t("portfolio") },
                { href: "/pricing", label: t("pricing") },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 group">
                    <span className="w-1 h-1 rounded-full bg-muted-foreground group-hover:bg-primary transition-colors" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display font-600 text-foreground mb-5 text-sm uppercase tracking-wider">Services</h4>
            <ul className="space-y-3">
              {["Bâche Publicitaire", "Panneau Aluminium", "Flyers & Dépliants", "Stickers & Adhésifs", "Roll-Up Banner"].map((s) => (
                <li key={s}>
                  <Link href="/services" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 group">
                    <span className="w-1 h-1 rounded-full bg-muted-foreground group-hover:bg-primary transition-colors" />
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-600 text-foreground mb-5 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-4">
              {[
                { icon: Mail, text: "contact@amirnumerique.dz" },
                { icon: Phone, text: "+213 (0) 555 12 34 56" },
                { icon: MapPin, text: "Alger, Algérie" },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-7 h-7 rounded-md bg-muted/60 flex items-center justify-center shrink-0">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Amir Numérique. Tous droits réservés.
          </p>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <Link href="/about" className="hover:text-primary transition-colors">À propos</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
