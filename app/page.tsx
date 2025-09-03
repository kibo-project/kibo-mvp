"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { UserRole } from "@/core/types/orders.types";
import { useRoleChange } from "@/hooks/auth/useRoleChange";
import { useOrders } from "@/hooks/orders/useOrders";
import { usePrivy } from "@privy-io/react-auth";
import type { NextPage } from "next";
// import { mantleSepoliaTestnet } from "viem/chains";
// import { useAccount, useBalance } from "wagmi";
import { PromoCarousel, QuickActions, RecentActivity } from "~~/components/dashboard";
import { ListIcon, PlaneIcon, QrCodeIcon } from "~~/components/icons/index";
import { Badge } from "~~/components/kibo";
import { useAuthStore } from "~~/services/store/auth-store.";

interface TopButton {
  name: string;
  icon: React.ReactNode;
  href: string;
}

const Home: NextPage = () => {
  // const { address } = useAccount();
  const { ready, authenticated } = usePrivy();
  const { data } = useOrders();

  const { setHasVisitedRoot, setUserRole, userRole, howRoles, roleNames, roleIds } = useAuthStore();
  const router = useRouter();
  const roleChangeMutation = useRoleChange();
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  // ADMIN: Updated to handle admin role display
  const currentView = userRole === "admin" ? "admin" : userRole || "user";

  // const { data: balance } = useBalance({
  //   address,
  //   chainId: mantleSepoliaTestnet.id,
  // });

  // const formattedBalance = useMemo(() => {
  //   return balance ? parseFloat(balance.value.toString()).toFixed(2) : "0.00";
  // }, [balance]);
  useEffect(() => {
    if (ready && !authenticated) {
      router.replace("/login");
    }
  }, [ready, authenticated, router]);

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

  useEffect(() => {
    if (roleChangeMutation.isSuccess && roleChangeMutation.data?.data?.activeRoleName) {
      setUserRole(roleChangeMutation.data.data.activeRoleName);
    }
  }, [roleChangeMutation.isSuccess, roleChangeMutation.data, setUserRole]);

  // if (!ready) {
  //   return (
  //     <div className="flex justify-center items-center h-dvh bg-primary">
  //       <div className="text-center text-primary-content">
  //         <div className="kibo-spinner mx-auto mb-4"></div>
  //         <p className="text-lg font-medium">Loading Kibo...</p>
  //       </div>
  //     </div>
  //   );
  // }
  useEffect(() => {
    setHasVisitedRoot(true);
  }, [setHasVisitedRoot]);

  const BalanceHeader = () => {
    return (
      <div className="container flex flex-col px-5 w-full text-white text-center mb-24 md:mb-32">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex-1" />

          <div className="relative">
            <Badge
              variant="info"
              size="sm"
              className="bg-white/5 text-white hover:bg-white/20 cursor-pointer transition-all duration-200 py-2 px-3 min-w-16 flex justify-center"
              onClick={() => howRoles > 1 && setShowRoleSelector(!showRoleSelector)}
            >
              {currentView === "admin" ? "admin" : currentView === "ally" ? "ally" : "user"}
              {howRoles > 1 && <span className="ml-1 text-xs">▼</span>}
            </Badge>

            {showRoleSelector && howRoles > 1 && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg overflow-hidden z-10 min-w-24">
                {availableRoles.map(role => (
                  <button
                    key={role}
                    onClick={() => handleRoleChange(role)}
                    className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors text-left capitalize"
                  >
                    {role === "admin" ? "admin" : role === "ally" ? "ally" : role}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <h2 className="text-base mb-2 font-medium opacity-90">USDT</h2>
        {/* <div className="flex items-baseline justify-center gap-1 mb-6 md:mb-8">
          <h1 className="text-6xl font-bold">{Math.floor(parseFloat(formattedBalance))}</h1>
          <span className="text-2xl font-medium opacity-75">
            ,{(parseFloat(formattedBalance) % 1).toFixed(2).slice(2)}
          </span>
        </div> */}
        {currentView !== "admin" && <QuickActions actions={quickActions} />}
      </div>
    );
  };

  const UserContent = () => (
    <div className="md:mx-auto md:min-w-md max-w-lg px-4">
      {currentView !== "admin" && <PromoCarousel className="-mt-24" />}

      <RecentActivity
        title="Transactions"
        orders={data?.data?.orders || []}
        viewAllHref="/movements"
        emptyMessage="No recent transactions"
      />
    </div>
  );

  const AllyContent = () => (
    <div className="md:mx-auto md:min-w-md max-w-lg px-4">
      <RecentActivity
        title="Recent Activity"
        orders={data?.data?.orders || []}
        viewAllHref="/transactions"
        emptyMessage="No recent activity"
      />
    </div>
  );

  const AdminContent = () => (
    <div className="md:mx-auto md:min-w-md max-w-lg px-4">
      <RecentActivity
        title="Admin Activity"
        orders={data?.data?.orders || []}
        viewAllHref="/admin/transactions"
        emptyMessage="No admin activity"
      />
    </div>
  );

  return (
    <div className="flex bg-primary items-center flex-col grow pt-0 md:pt-10 min-dvh">
      <BalanceHeader />
      <div className="flex-1 w-full bg-neutral-100 dark:bg-neutral-800 mb-20 md:mb-0 pt-8">
        {currentView === "admin" ? <AdminContent /> : currentView === "ally" ? <AllyContent /> : <UserContent />}
      </div>
    </div>
  );
};

export default Home;
