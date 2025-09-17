"use client";

import { useCallback, useEffect, useMemo } from "react";
import { RoleGuard } from "@/components/RoleGuard";
import { RoleSelector } from "@/components/RoleSelector";
import { RecentActivity } from "@/components/dashboard";
import { StatCard } from "@/components/dashboard/StatCard";
import { UserRole } from "@/core/types/orders.types";
import { useRoleChange } from "@/hooks/auth/useRoleChange";
import { useOrders } from "@/hooks/orders/useOrders";
import { useAuthStore } from "@/services/store/auth-store.";
import { usePrivy } from "@privy-io/react-auth";
import { NextPage } from "next";

const AdminHome: NextPage = () => {
  const { authenticated } = usePrivy();
  const { data } = useOrders({ enabled: authenticated });
  const { setUserRole, userRole, howRoles, roleNames, roleIds } = useAuthStore();
  const roleChangeMutation = useRoleChange();

  const availableRoles = useMemo(() => {
    if (!roleNames || howRoles <= 1) return [];
    return roleNames.filter(role => role !== userRole);
  }, [roleNames, userRole, howRoles]);

  const handleRoleChange = useCallback(
    (newRole: UserRole) => {
      const roleIndex = roleNames.indexOf(newRole);
      const roleId = roleIds[roleIndex];

      if (roleId) {
        roleChangeMutation.mutate(roleId);
      }
    },
    [roleNames, roleIds, roleChangeMutation]
  );
  useEffect(() => {
    if (roleChangeMutation.isSuccess && roleChangeMutation.data?.data?.activeRoleName) {
      setUserRole(roleChangeMutation.data.data.activeRoleName);
    }
  }, [roleChangeMutation.isSuccess, roleChangeMutation.data, setUserRole]);

  if (roleChangeMutation.isPending) {
    return (
      <RoleGuard requiredRole="admin">
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="flex flex-col items-center space-y-4 relative z-10">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-600 border-t-transparent"></div>
            <span className="text-lg font-medium text-neutral-900 dark:text-neutral-100">Changing role...</span>
          </div>
        </div>
      </RoleGuard>
    );
  }

  const AdminHeader = () => (
    <div className="container flex flex-col px-5 w-full text-white text-center mb-24 md:mb-32">
      <div className="flex items-center justify-between gap-2">
        {/*Role selector container */}
        <div className="relative">
          {howRoles > 1 && (
            <RoleSelector
              currentRole={userRole!}
              availableRoles={availableRoles}
              onRoleChange={handleRoleChange}
              className=""
            />
          )}
        </div>
      </div>
      <div className="md:mx-auto md:min-w-md max-w-lg px-4 mt-12">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <StatCard title="Applications" value={7} />
          <StatCard title="Applications" value={11} />
          <StatCard title="Users" value="+99" />
          <StatCard title="Orders" value="+99" />
        </div>
      </div>
    </div>
  );

  const AdminContent = () => (
    <div className="md:mx-auto md:min-w-md max-w-lg px-4">
      <RecentActivity
        title="Applications"
        orders={data?.data?.orders || []}
        viewAllHref="/admin/applications"
        viewOneHref="/admin"
        emptyMessage="There are not applications"
      />
    </div>
  );

  return (
    <RoleGuard requiredRole="admin">
      <div className="flex bg-primary items-center flex-col grow pt-0 md:pt-2 min-dvh">
        <AdminHeader />
        <div className="flex-1 w-full bg-neutral-100 dark:bg-neutral-800 mb-20 md:mb-0 pt-8">{<AdminContent />}</div>
      </div>
    </RoleGuard>
  );
};
export default AdminHome;
