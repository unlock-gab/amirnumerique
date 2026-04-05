import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useGetMe, useLogout } from "@workspace/api-client-react";
import { useI18n } from "@/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  Users,
  Settings,
  Image as ImageIcon,
  PrinterCheck,
  LogOut,
  Globe,
  ExternalLink,
  Layers,
} from "lucide-react";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export function AdminLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { data: user, isLoading } = useGetMe();
  const logout = useLogout();
  const { t, language, setLanguage } = useI18n();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="space-y-3 text-center">
          <div className="w-10 h-10 rounded-xl bg-primary/20 mx-auto flex items-center justify-center">
            <PrinterCheck className="h-5 w-5 text-primary animate-pulse" />
          </div>
          <Skeleton className="h-2 w-24 mx-auto" />
        </div>
      </div>
    );
  }

  if (!user) {
    window.location.href = "/auth/login";
    return null;
  }

  if (user.role !== "admin") {
    window.location.href = "/dashboard";
    return null;
  }

  const navItems = [
    { href: "/admin", label: t("adminDashboard"), icon: LayoutDashboard, exact: true },
    { href: "/admin/orders", label: t("manageOrders"), icon: ShoppingCart },
    { href: "/admin/quotes", label: t("manageQuotes"), icon: FileText },
    { href: "/admin/categories", label: "Catégories", icon: Layers },
    { href: "/admin/services", label: t("manageServices"), icon: PrinterCheck },
    { href: "/admin/portfolio", label: t("managePortfolio"), icon: ImageIcon },
    { href: "/admin/users", label: t("manageUsers"), icon: Users },
    { href: "/admin/settings", label: t("settings"), icon: Settings },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r border-border/40">
          <SidebarHeader className="border-b border-border/30 p-5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/20">
                <PrinterCheck className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <div>
                <span className="font-display text-sm font-700 text-foreground">
                  Amir <span className="text-primary">Admin</span>
                </span>
                <Badge className="ml-2 text-[9px] px-1.5 py-0 h-4 bg-primary/15 text-primary border-primary/20">ADMIN</Badge>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="py-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-3 mb-1">
                Gestion
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => {
                    const active = item.exact
                      ? location === item.href
                      : location === item.href || (!item.exact && location.startsWith(item.href) && item.href !== "/admin");
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                          <Link href={item.href}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <div className="px-3 mt-3">
              <div className="section-divider" />
            </div>

            <SidebarGroup className="mt-2">
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Site public">
                      <Link href="/">
                        <ExternalLink className="h-4 w-4" />
                        <span>Voir le site</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-border/30 p-4 space-y-3">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/40">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-primary">{user.fullName?.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{user.fullName}</div>
                <div className="text-xs text-muted-foreground truncate">{user.email}</div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setLanguage(language === "fr" ? "ar" : "fr")} className="h-7 w-7 shrink-0">
                <Globe className="h-3.5 w-3.5" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => logout.mutate(undefined, { onSuccess: () => (window.location.href = "/") })}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {t("logout")}
            </Button>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col min-w-0 overflow-auto bg-muted/10">
          {/* Mobile top bar — only visible on small screens */}
          <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-30">
            <SidebarTrigger className="h-8 w-8 shrink-0" />
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-primary flex items-center justify-center">
                <PrinterCheck className="h-3 w-3 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <span className="font-display text-sm font-700">
                Amir <span className="text-primary">Admin</span>
              </span>
            </div>
          </div>

          <div className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
