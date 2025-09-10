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
import { ListIcon, PersonIcon, PlaneIcon, QrCodeIcon } from "~~/components/icons/index";
import { Badge, Button } from "~~/components/kibo";
import { useAuthStore } from "~~/services/store/auth-store.";

interface TopButton {
  name: string;
  icon: React.ReactNode;
  href: string;
}

const Home: NextPage = () => {
  // const { address } = useAccount();
  const { authenticated, ready } = usePrivy();
  const { data } = useOrders({ enabled: authenticated });

  const { setHasVisitedRoot, setUserRole, userRole, howRoles, roleNames, roleIds } = useAuthStore();
  const roleChangeMutation = useRoleChange();
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const currentView = userRole === "admin" ? "admin" : userRole || "user";
  const router = useRouter();

  // const { data: balance } = useBalance({
  //   address,
  //   chainId: mantleSepoliaTestnet.id,
  // });

  // const formattedBalance = useMemo(() => {
  //   return balance ? parseFloat(balance.value.toString()).toFixed(2) : "0.00";
  // }, [balance]);
  const availableRoles = useMemo(() => {
    if (!roleNames || howRoles <= 1) return [];
    return roleNames.filter(role => role !== userRole);
  }, [roleNames, userRole, howRoles]);

  const handleRoleChange = useCallback(
    (newRole: UserRole) => {
      console.log(`Changing role to: ${newRole}`);
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
    if (ready && authenticated && userRole == "admin") {
      router.replace("/admin");
    }
  }, [ready, authenticated, router, userRole]);
  useEffect(() => {
    setHasVisitedRoot(true);
  }, [setHasVisitedRoot]);

  const BalanceHeader = () => {
    console.log("DEBUG - userRole:", userRole);
    console.log("DEBUG - howRoles:", howRoles);
    console.log("DEBUG - roleNames:", roleNames);
    return (
      <div className="container flex flex-col px-5 w-full text-white text-center mb-24 md:mb-32">
        <div className="flex items-center justify-between gap-2">
          {/* ROLE: Role selector container */}
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

            {/* ROLE: Role selector dropdown */}
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
          {/* ALLY: button */}
          {userRole === "user" && howRoles === 1 && (
            <Button
              variant="secondary"
              size="md"
              className="bg-white/60 text-black hover:bg-white/80 cursor-pointer transition-all duration-200 py-2 px-3"
              onClick={() => {
                router.push("/application");
              }}
            >
              Join as an Ally
            </Button>
          )}
        </div>
        <h2 className="text-base mb-2 font-medium opacity-90">USDT</h2>
        <QuickActions actions={quickActions} />
      </div>
    );
  };

  const UserContent = () => (
    <div className="md:mx-auto md:min-w-md max-w-lg px-4">
      <PromoCarousel className="-mt-24" />

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

  return (
    <div className="flex bg-primary items-center flex-col grow pt-0 md:pt-2 min-dvh">
      <BalanceHeader />
      <div className="flex-1 w-full bg-neutral-100 dark:bg-neutral-800 mb-20 md:mb-0 pt-8">
        {currentView === "ally" ? <AllyContent /> : <UserContent />}
      </div>
    </div>
  );
};

export default Home;
