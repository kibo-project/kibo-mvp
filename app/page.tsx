"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { RoleSelector } from "@/components/RoleSelector";
import { RoleResponse } from "@/core/types/users.types";
import { useRoleChange } from "@/hooks/auth/useRoleChange";
//import { useOrders } from "@/hooks/orders/useOrders";
import { useOrdersRealtime } from "@/hooks/orders/useOrdersRealtime";
import { usePrivy } from "@privy-io/react-auth";
import { useQueryClient } from "@tanstack/react-query";
import type { NextPage } from "next";
// import { mantleSepoliaTestnet } from "viem/chains";
// import { useAccount, useBalance } from "wagmi";
import { PromoCarousel, QuickActions, RecentActivity } from "~~/components/dashboard";
import { ListIcon, PlaneIcon, QrCodeIcon } from "~~/components/icons/index";
import { Button } from "~~/components/kibo";
import { useAuthStore } from "~~/services/store/auth-store.";

interface TopButton {
  name: string;
  icon: React.ReactNode;
  href: string;
}

const Home: NextPage = () => {
  // const { address } = useAccount();
  const queryClient = useQueryClient();
  const { authenticated, ready } = usePrivy();
  //const { data, refetch } = useOrders({ enabled: authenticated });

  const { setHasVisitedRoot, setUserRole, isUserApplicant, userRole, roles } = useAuthStore();
  const roleChangeMutation = useRoleChange();
  const currentView = userRole;
  const router = useRouter();
  const { data, error: realtimeError, connected } = useOrdersRealtime({ enabled: authenticated && !!userRole });

  // const { data: fallbackData, refetch } = useOrders({
  //   enabled: authenticated && (!!realtimeError || !connected),
  // });

  // const { data: balance } = useBalance({
  //   address,
  //   chainId: mantleSepoliaTestnet.id,
  // });

  // const formattedBalance = useMemo(() => {
  //   return balance ? parseFloat(balance.value.toString()).toFixed(2) : "0.00";
  // }, [balance]);

  const availableRoles: RoleResponse[] = useMemo(() => {
    if (roles.length <= 1) return [];
    return roles.filter(role => role.name !== userRole?.name);
  }, [roles, userRole?.name]);

  const handleRoleChange = useCallback(
    (newRole: RoleResponse) => {
      const roleId = newRole.roleId;
      if (roleId) {
        roleChangeMutation.mutate(roleId);
      }
    },
    [roleChangeMutation]
  );

  const quickActions: TopButton[] = useMemo(
    () => [
      {
        name: "Send",
        icon: <PlaneIcon className="size-6" />,
        href: "#",
      },
      {
        name: "Receive",
        icon: <QrCodeIcon className="size-6" />,
        href: "/order/camera",
      },
      {
        name: "Details",
        icon: <ListIcon className="size-6" />,
        href: "/movements",
      },
    ],
    []
  );

  const headerBackgroundClass = useMemo(() => {
    switch (userRole?.name) {
      case "ally":
        return "bg-ally";
      default:
        return "bg-primary";
    }
  }, [userRole]);

  useEffect(() => {
    if (roleChangeMutation.isSuccess && roleChangeMutation.data?.data) {
      const newUserRole = roleChangeMutation.data.data.roles![0];
      queryClient.removeQueries({ queryKey: ["orders"] });
      setUserRole(newUserRole);
      if (newUserRole.name === "admin") {
        router.replace("/admin");
      }
    }
  }, [roleChangeMutation.isSuccess, roleChangeMutation.data, setUserRole, userRole, queryClient, router]);

  useEffect(() => {
    if (ready && authenticated && userRole?.name == "admin") {
      router.replace("/admin");
    }
  }, [ready, authenticated, router, userRole]);

  useEffect(() => {
    setHasVisitedRoot(true);
  }, [setHasVisitedRoot]);

  if (roleChangeMutation.isPending) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <div className="flex flex-col items-center space-y-4 relative z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-600 border-t-transparent"></div>
          <span className="text-lg font-medium text-neutral-900 dark:text-neutral-100">Changing role...</span>
        </div>
      </div>
    );
  }

  const BalanceHeader = () => {
    return (
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
          {/* ALLY: button */}
          {userRole?.name === "user" && roles.length === 1 && (
            <Button
              variant="secondary"
              size="md"
              className="bg-white/60 text-black hover:bg-white/80 cursor-pointer transition-all duration-200 py-2 px-3"
              onClick={() => {
                router.push("/application");
              }}
            >
              {isUserApplicant ? "Review Application" : "Join as an Ally"}
            </Button>
          )}
        </div>
        <h2 className="text-base mb-2 font-medium opacity-90">USDT</h2>
        {userRole?.name === "user" && <QuickActions actions={quickActions} />}
      </div>
    );
  };

  const UserContent = () => (
    <div className="md:mx-auto md:min-w-md max-w-lg px-4">
      <PromoCarousel className="-mt-24" />
      <RecentActivity
        title="Transactions"
        items={data?.orders || []}
        viewAllHref="/movements"
        viewOneHref="/movements/"
        emptyMessage="No recent transactions"
      />
    </div>
  );

  const AllyContent = () => (
    <div className="md:mx-auto md:min-w-md max-w-lg px-4">
      <RecentActivity
        title="Recent Activity"
        items={data?.orders || []}
        viewOneHref="/transactions/"
        viewAllHref="/transactions"
        emptyMessage="No recent activity"
      />
    </div>
  );

  return (
    <div className={`flex ${headerBackgroundClass} items-center flex-col grow pt-0 md:pt-2 min-dvh`}>
      <BalanceHeader />
      <div className="flex-1 w-full bg-neutral-100 dark:bg-neutral-800 mb-20 md:mb-0 pt-8">
        {currentView?.name === "ally" ? <AllyContent /> : <UserContent />}
      </div>
    </div>
  );
};

export default Home;
