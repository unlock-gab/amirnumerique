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
  Globe
} from "lucide-react";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { data: user, isLoading } = useGetMe();
  const logout = useLogout();
  const { t, language, setLanguage } = useI18n();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-background"><Skeleton className="h-12 w-12 rounded-full" /></div>;
  }

  if (!user) {
    window.location.href = '/auth/login';
    return null;
  }

  if (user.role === 'admin') {
    window.location.href = '/admin';
    return null;
  }

  const toggleLanguage = () => {
    setLanguage(language === "fr" ? "ar" : "fr");
  };

  const navItems = [
    { href: "/dashboard", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/dashboard/orders", label: t("myOrders"), icon: ShoppingCart },
    { href: "/dashboard/quotes", label: t("myQuotes"), icon: FileText },
    { href: "/dashboard/profile", label: t("profile"), icon: UserIcon },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar>
          <SidebarHeader className="border-b border-border/40 p-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-primary tracking-tight">Amir Numérique</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={location === item.href || location.startsWith(`${item.href}/`)}
                        tooltip={item.label}
                      >
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t border-border/40 p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium truncate">{user.fullName}</div>
              <Button variant="ghost" size="icon" onClick={toggleLanguage} title={language === 'fr' ? 'العربية' : 'Français'} className="h-8 w-8 shrink-0">
                <Globe className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-xs text-muted-foreground truncate mb-2">{user.email}</div>
            <Button 
              variant="destructive" 
              className="w-full justify-start" 
              onClick={() => logout.mutate(undefined, { onSuccess: () => window.location.href = '/' })}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {t("logout")}
            </Button>
          </SidebarFooter>
        </Sidebar>
        
        <main className="flex-1 flex flex-col min-w-0 overflow-auto">
          <div className="flex-1 p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
