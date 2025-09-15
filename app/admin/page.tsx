"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RoleGuard } from "@/components/RoleGuard";
import { RecentActivity } from "@/components/dashboard";
import { StatCard } from "@/components/dashboard/StatCard";
import { Badge, Button } from "@/components/kibo";
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
  const [showRoleSelector, setShowRoleSelector] = useState(false);
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
      setShowRoleSelector(false);
    },
    [roleNames, roleIds, roleChangeMutation]
  );
  useEffect(() => {
    if (roleChangeMutation.isSuccess && roleChangeMutation.data?.data?.activeRoleName) {
      setUserRole(roleChangeMutation.data.data.activeRoleName);
    }
  }, [roleChangeMutation.isSuccess, roleChangeMutation.data, setUserRole]);

  const AdminHeader = () => (
    <div className="container flex flex-col px-5 w-full text-white text-center mb-24 md:mb-32">
      <div className="flex items-center justify-between gap-2">
        <div className="relative">
          <Badge
            variant="info"
            size="sm"
            className="bg-white/5 text-white hover:bg-white/20 cursor-pointer transition-all duration-200 py-2 px-3 min-w-16 flex justify-center"
            onClick={() => howRoles > 1 && setShowRoleSelector(!showRoleSelector)}
          >
            {userRole}
            {howRoles > 1 && <span className="ml-1 text-xs">▼</span>}
          </Badge>

          {showRoleSelector && howRoles > 1 && (
            <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg overflow-hidden z-10 min-w-24">
              {availableRoles.map(role => (
                <Button
                  key={role}
                  onClick={() => handleRoleChange(role)}
                  className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors text-left capitalize"
                >
                  {role === "admin" ? "admin" : role === "ally" ? "ally" : role}
                </Button>
              ))}
            </div>
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
        viewAllHref="/transactions"
        viewOneHref="/transactions/"
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
