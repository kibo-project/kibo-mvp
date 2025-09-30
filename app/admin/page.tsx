"use client";

import React, { useCallback, useEffect, useMemo } from "react";
import { RoleGuard } from "@/components/RoleGuard";
import { RoleSelector } from "@/components/RoleSelector";
import { RecentActivity } from "@/components/dashboard";
import { StatCard } from "@/components/dashboard/StatCard";
import { AllyApplication } from "@/core/types/ally.applications.types";
import { RoleResponse } from "@/core/types/users.types";
import { useApplications } from "@/hooks/applications/useApplications";
import { useRoleChange } from "@/hooks/auth/useRoleChange";
import { useAuthStore } from "@/services/store/auth-store.";
import { formatDateToSpanish, getStatusColorApplication, getStatusIconApplication } from "@/utils/front.functions";
import { NextPage } from "next";

const AdminHome: NextPage = () => {
  const { setUserRole, userRole, roles } = useAuthStore();
  const roleChangeMutation = useRoleChange();
  const { data, refetch } = useApplications();

  const availableRoles: RoleResponse[] = useMemo(() => {
    if (roles.length <= 1) return [];
    return roles.filter(role => role.name !== userRole?.name);
  }, [roles, userRole]);

  const handleRoleChange = useCallback(
    (newRole: RoleResponse) => {
      const roleId = newRole.roleId;
      if (roleId) {
        roleChangeMutation.mutate(roleId);
      }
    },
    [roleChangeMutation]
  );

  useEffect(() => {
    if (roleChangeMutation.isSuccess && roleChangeMutation.data?.data) {
      setUserRole(roleChangeMutation.data.data.roles![0]);
      if (roleChangeMutation.data.data.roles![0].name == "admin") {
        refetch()
          .then(() => {})
          .catch(() => {});
      }
    }
  }, [roleChangeMutation.isSuccess, roleChangeMutation.data, setUserRole, refetch]);

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
  const renderApplication = (application: AllyApplication) => (
    <div className="p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full ${getStatusColorApplication(application.status)} flex items-center justify-center`}
          >
            {getStatusIconApplication(application.status)}
          </div>
          <div>
            <h4 className="font-medium text-sm text-base-content">{application.fullName}</h4>
            <div className="flex items-center gap-2">
              <p className="text-xs text-base-content opacity-60">{formatDateToSpanish(application.createdAt)}</p>
              <span className="text-xs text-base-content opacity-50">• {application.status}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  const AdminHeader = () => (
    <div className="container flex flex-col px-5 w-full text-white text-center mb-24 md:mb-32">
      <div className="flex items-center justify-between gap-2">
        {/*Role selector container */}
        <div className="relative">
          {roles.length > 1 && (
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
        items={data?.data?.applications || []}
        viewAllHref="/admin/applications"
        viewOneHref="/admin"
        emptyMessage="There are not applications"
        renderItem={renderApplication}
      />
    </div>
  );

  return (
    <RoleGuard requiredRole="admin">
      <div className="flex bg-admin items-center flex-col grow pt-0 md:pt-2 min-dvh">
        <AdminHeader />
        <div className="flex-1 w-full bg-neutral-100 dark:bg-neutral-800 mb-20 md:mb-0 pt-8">{<AdminContent />}</div>
      </div>
    </RoleGuard>
  );
};
export default AdminHome;
