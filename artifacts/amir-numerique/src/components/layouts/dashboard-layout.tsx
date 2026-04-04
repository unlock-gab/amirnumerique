import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useGetMe, useLogout } from "@workspace/api-client-react";
import { useI18n } from "@/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  User as UserIcon,
  LogOut,
  Globe,
  PrinterCheck,
  ExternalLink,
} from "lucide-react";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardLayout({ children }: { children: ReactNode }) {
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

  if (user.role === "admin") {
    window.location.href = "/admin";
    return null;
  }

  const navItems = [
    { href: "/dashboard", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/dashboard/orders", label: t("myOrders"), icon: ShoppingCart },
    { href: "/dashboard/quotes", label: t("myQuotes"), icon: FileText },
    { href: "/dashboard/profile", label: t("profile"), icon: UserIcon },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r border-border/40">
          <SidebarHeader className="border-b border-border/30 p-5">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/20">
                <PrinterCheck className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <span className="font-display text-base font-700 text-foreground">
                Amir <span className="text-primary">Numérique</span>
              </span>
            </Link>
          </SidebarHeader>

          <SidebarContent className="py-3">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => {
                    const active = item.href === "/dashboard" ? location === "/dashboard" : location.startsWith(item.href);
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

            <div className="px-3 mt-4">
              <div className="section-divider" />
            </div>

            <SidebarGroup className="mt-2">
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Site public">
                      <Link href="/services">
                        <ExternalLink className="h-4 w-4" />
                        <span>Voir les services</span>
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

        <main className="flex-1 flex flex-col min-w-0 overflow-auto">
          <div className="flex-1 p-6 md:p-8 max-w-7xl w-full">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
