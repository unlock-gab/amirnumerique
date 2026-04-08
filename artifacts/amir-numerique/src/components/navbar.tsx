import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useGetMe, useLogout } from "@workspace/api-client-react";
import { useI18n } from "@/hooks/use-i18n";
import { Menu, X, Globe, PrinterCheck, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [location] = useLocation();
  const { data: user } = useGetMe();
  const logout = useLogout();
  const { t, language, setLanguage } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/services", label: t("services") },
    { href: "/pricing", label: t("pricing") },
    { href: "/portfolio", label: t("portfolio") },
    { href: "/about", label: t("about") },
    { href: "/partenariat", label: "Partenariat" },
    { href: "/contact", label: t("contact") },
  ];

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location.startsWith(href);

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl border-b border-border/60 shadow-sm shadow-black/8"
          : "bg-white/90 backdrop-blur-md border-b border-transparent"
      }`}
    >
      <div className="container mx-auto px-3 h-[64px] flex items-center justify-between gap-2">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0 group">
          <img
            src="/logo-amir.png"
            alt="Amir Numérique"
            className="h-10 md:h-14 w-auto object-contain group-hover:scale-105 transition-transform"
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive(link.href)
                  ? "text-primary bg-primary/8"
                  : "text-muted-foreground hover:text-foreground hover:bg-black/5"
              }`}
            >
              {link.label}
              {isActive(link.href) && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-px bg-primary rounded-full" />
              )}
            </Link>
          ))}
        </div>

        {/* Mobile quick links */}
        <div className="flex md:hidden items-center gap-1 flex-1 justify-end">
          <Link
            href="/services"
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${isActive("/services") ? "text-primary bg-primary/8" : "text-foreground hover:bg-black/5"}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Services
          </Link>
          <Link
            href="/pricing"
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${isActive("/pricing") ? "text-primary bg-primary/8" : "text-foreground hover:bg-black/5"}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Tarifs
          </Link>
          {user ? (
            <Link
              href={user.role === "admin" ? "/admin" : "/dashboard"}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-md bg-primary text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Mon espace
            </Link>
          ) : (
            <Button size="sm" asChild className="h-7 text-xs px-3 shadow-md shadow-primary/25">
              <Link href="/auth/login">Connexion</Link>
            </Button>
          )}
        </div>

        {/* Desktop right side */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(language === "fr" ? "ar" : "fr")}
            className="text-muted-foreground hover:text-foreground h-8 px-2 gap-1.5"
          >
            <Globe className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">{language === "fr" ? "AR" : "FR"}</span>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 border-border/60 hover:border-primary/50 h-8">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-primary">
                      {user.fullName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm max-w-[120px] truncate">{user.fullName}</span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href={user.role === "admin" ? "/admin" : "/dashboard"} className="w-full cursor-pointer">
                    {t("dashboard")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={() => logout.mutate(undefined, { onSuccess: () => (window.location.href = "/") })}
                >
                  {t("logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="h-8 text-sm text-muted-foreground hover:text-foreground">
                <Link href="/auth/login">{t("login")}</Link>
              </Button>
              <Button size="sm" asChild className="h-8 text-sm shadow-lg shadow-primary/20">
                <Link href="/auth/register">{t("register")}</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-8 w-8 shrink-0"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background py-4 px-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(link.href) ? "text-primary bg-primary/8" : "text-muted-foreground hover:text-foreground hover:bg-black/5"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="my-2 section-divider" />
          {user ? (
            <>
              <Link href={user.role === "admin" ? "/admin" : "/dashboard"} className="px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>
                {t("dashboard")}
              </Link>
              <button className="px-3 py-2.5 text-sm font-medium text-left text-destructive" onClick={() => { setMobileMenuOpen(false); logout.mutate(undefined, { onSuccess: () => (window.location.href = "/") }); }}>
                {t("logout")}
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-1">
              <Button variant="outline" size="sm" asChild className="w-full justify-center" onClick={() => setMobileMenuOpen(false)}>
                <Link href="/auth/login">{t("login")}</Link>
              </Button>
              <Button size="sm" asChild className="w-full justify-center" onClick={() => setMobileMenuOpen(false)}>
                <Link href="/auth/register">{t("register")}</Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
