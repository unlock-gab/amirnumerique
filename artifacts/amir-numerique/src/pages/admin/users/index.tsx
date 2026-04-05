import { AdminLayout } from "@/components/layouts/admin-layout";
import { useListUsers, useUpdateUser } from "@workspace/api-client-react";
import { useI18n } from "@/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users, Search, X } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";

const ROLE_OPTIONS = [
  { value: "visitor", label: "Visiteur" },
  { value: "client", label: "Client" },
  { value: "subcontractor", label: "Sous-traitant" },
  { value: "admin", label: "Administrateur" },
];

const ROLE_STYLES: Record<string, { badge: string; selector: string }> = {
  visitor:       { badge: "bg-muted/60 text-muted-foreground border-border/60",     selector: "border-border/50" },
  client:        { badge: "bg-blue-500/10 text-blue-400 border-blue-500/25",        selector: "border-blue-500/30" },
  subcontractor: { badge: "bg-amber-500/10 text-amber-400 border-amber-500/25",     selector: "border-amber-500/30" },
  admin:         { badge: "bg-primary/10 text-primary border-primary/25",            selector: "border-primary/30" },
};

export default function AdminUsers() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { data: result, isLoading, refetch } = useListUsers({});
  const allUsers = (result as any)?.users || (Array.isArray(result) ? result : []);
  const updateUser = useUpdateUser();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const users = useMemo(() => {
    let list = allUsers;
    if (roleFilter !== "all") list = list.filter((u: any) => u.role === roleFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((u: any) =>
        u.fullName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allUsers, search, roleFilter]);

  const hasFilters = search || roleFilter !== "all";
  const resetFilters = () => { setSearch(""); setRoleFilter("all"); };

  const handleRoleChange = (userId: number, role: string) => {
    updateUser.mutate({ id: userId, data: { role: role as any } }, {
      onSuccess: () => { toast({ title: "Rôle mis à jour" }); refetch(); },
      onError: () => toast({ title: "Erreur", variant: "destructive" }),
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-2xl font-700 tracking-tight">{t("manageUsers")}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {users.length} utilisateur{users.length !== 1 ? "s" : ""}
              {hasFilters && <span className="ml-1 text-primary"> (filtrés)</span>}
            </p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
            <Input
              placeholder="Nom ou e-mail…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="users-search"
              className="pl-9 h-9 text-sm border-border/60"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-44 h-9 text-sm border-border/60" data-testid="users-role-filter">
              <SelectValue placeholder="Rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les rôles</SelectItem>
              {ROLE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="h-9 text-muted-foreground hover:text-foreground gap-1.5">
              <X className="h-3.5 w-3.5" /> Réinitialiser
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : users.length === 0 ? (
          <div className="text-center py-24 rounded-2xl border border-border/50 bg-card/40">
            <Users className="h-10 w-10 mx-auto mb-4 text-muted-foreground/20" />
            <h3 className="font-display font-600 text-lg mb-1">Aucun utilisateur trouvé</h3>
            {hasFilters && <Button variant="outline" size="sm" className="mt-3" onClick={resetFilters}>Effacer les filtres</Button>}
          </div>
        ) : (
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/20">
                    <th className="text-left px-5 py-3.5 text-xs font-600 font-display uppercase tracking-wider text-muted-foreground">Utilisateur</th>
                    <th className="text-left px-5 py-3.5 text-xs font-600 font-display uppercase tracking-wider text-muted-foreground">Email</th>
                    <th className="text-left px-5 py-3.5 text-xs font-600 font-display uppercase tracking-wider text-muted-foreground">Téléphone</th>
                    <th className="text-left px-5 py-3.5 text-xs font-600 font-display uppercase tracking-wider text-muted-foreground">Inscription</th>
                    <th className="text-left px-5 py-3.5 text-xs font-600 font-display uppercase tracking-wider text-muted-foreground">Rôle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {users.map((user: any, i: number) => (
                    <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      className="hover:bg-muted/15 transition-colors" data-testid={`admin-user-row-${user.id}`}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-primary">{user.fullName?.[0]?.toUpperCase() || "?"}</span>
                          </div>
                          <span className="font-medium text-sm">{user.fullName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">{user.email}</td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">{user.phone || "—"}</td>
                      <td className="px-5 py-4 text-sm text-muted-foreground tabular-nums">{new Date(user.createdAt).toLocaleDateString("fr-DZ")}</td>
                      <td className="px-5 py-4">
                        <Select value={user.role} onValueChange={(role) => handleRoleChange(user.id, role)}>
                          <SelectTrigger className={`w-36 h-8 text-xs border ${ROLE_STYLES[user.role]?.selector || "border-border/60"}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLE_OPTIONS.map((o) => (
                              <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
