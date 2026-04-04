import { AdminLayout } from "@/components/layouts/admin-layout";
import { useListUsers, useUpdateUser } from "@workspace/api-client-react";
import { useI18n } from "@/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users } from "lucide-react";
import { motion } from "framer-motion";

const ROLE_OPTIONS = [
  { value: "visitor", label: "Visiteur" },
  { value: "client", label: "Client" },
  { value: "subcontractor", label: "Sous-traitant" },
  { value: "admin", label: "Administrateur" },
];

const ROLE_COLORS: Record<string, string> = {
  visitor: "bg-muted text-muted-foreground border-border",
  client: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  subcontractor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  admin: "bg-primary/10 text-primary border-primary/20",
};

export default function AdminUsers() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { data: result, isLoading, refetch } = useListUsers({});
  const users = (result as any)?.users || (Array.isArray(result) ? result : []);
  const updateUser = useUpdateUser();

  const handleRoleChange = (userId: number, role: string) => {
    updateUser.mutate({ id: userId, data: { role: role as any } }, {
      onSuccess: () => { toast({ title: "Rôle mis à jour" }); refetch(); },
      onError: () => toast({ title: "Erreur", variant: "destructive" }),
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t("manageUsers")}</h1>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : users.length === 0 ? (
          <div className="text-center py-20">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-lg font-semibold">Aucun utilisateur</h3>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Utilisateur</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Email</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Téléphone</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Inscription</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Rôle</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user: any, i: number) => (
                    <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors" data-testid={`admin-user-row-${user.id}`}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                            {user.fullName[0].toUpperCase()}
                          </div>
                          <span className="font-medium text-sm">{user.fullName}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{user.email}</td>
                      <td className="p-4 text-sm text-muted-foreground">{user.phone || "—"}</td>
                      <td className="p-4 text-sm text-muted-foreground">{new Date(user.createdAt).toLocaleDateString("fr-DZ")}</td>
                      <td className="p-4">
                        <Select value={user.role} onValueChange={(role) => handleRoleChange(user.id, role)}>
                          <SelectTrigger className={`w-36 h-8 text-xs border ${ROLE_COLORS[user.role] || ""}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>)}
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
