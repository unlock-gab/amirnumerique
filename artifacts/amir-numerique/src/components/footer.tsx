import { useI18n } from "@/hooks/use-i18n";
import { Link } from "wouter";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-border bg-card text-card-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-primary">Amir Numérique</h3>
            <p className="text-sm text-muted-foreground">
              L'excellence de l'impression numérique en Algérie. Qualité premium pour professionnels.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Liens Rapides</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-primary transition-colors">{t("home")}</Link></li>
              <li><Link href="/services" className="hover:text-primary transition-colors">{t("services")}</Link></li>
              <li><Link href="/portfolio" className="hover:text-primary transition-colors">{t("portfolio")}</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition-colors">{t("pricing")}</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Légal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors">{t("about")}</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">{t("contact")}</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>contact@amir-numerique.dz</li>
              <li>+213 (0) 555 12 34 56</li>
              <li>Alger, Algérie</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Amir Numérique. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
