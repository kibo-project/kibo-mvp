"use client";

import {useCallback, useEffect, useMemo, useState} from "react";
import type { NextPage } from "next";
// import { mantleSepoliaTestnet } from "viem/chains";
// import { useAccount, useBalance } from "wagmi";
import {
    PromoCarousel,
    QuickActions,
    RecentActivity,
} from "~~/components/dashboard";
import { ListIcon, PlaneIcon, QrCodeIcon } from "~~/components/icons/index";
import { Badge } from "~~/components/kibo";
import { useAuthStore } from "~~/services/store/auth-store.";
import {useRouter} from "next/navigation";
import {usePrivy} from "@privy-io/react-auth";
import {useOrders} from "@/hooks/orders/useOrders";


interface TopButton {
    name: string;
    icon: React.ReactNode;
    href: string;
}

const Home: NextPage = () => {
    // const { address } = useAccount();
    const { ready, authenticated} = usePrivy();
    const {
        data,
        // isLoading,
        // error
    } = useOrders();

    const {
        hasVisitedRoot,
        setHasVisitedRoot,
        userRole,
    } = useAuthStore();
    const router = useRouter();

    const currentView = userRole === 'admin' ? 'ally' : (userRole || 'user');

    // const { data: balance } = useBalance({
    //   address,
    //   chainId: mantleSepoliaTestnet.id,
    // });

    const redirectToLogin = useCallback(() => {
        setHasVisitedRoot(true);
        router.replace("/login");
    }, [setHasVisitedRoot, router]);

    // const formattedBalance = useMemo(() => {
    //   return balance ? parseFloat(balance.value.toString()).toFixed(2) : "0.00";
    // }, [balance]);

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
        if (ready && !authenticated && !hasVisitedRoot) {
            redirectToLogin();
        }
    }, [ready, authenticated, hasVisitedRoot, redirectToLogin]);

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

    const BalanceHeader = () => {

        return (
            <div className="container flex flex-col px-5 w-full text-white text-center mb-24 md:mb-32">
                <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex-1" />
                    <Badge
                        variant="info"
                        size="sm"
                        className="bg-white/5 text-white hover:bg-white/20 cursor-pointer transition-all duration-200 py-2 px-3 min-w-16 flex justify-center"
                     //   onClick={handleViewSwitch}
                    >
                        {currentView === "ally" ? "Ally" : "User"}
                    </Badge>
                </div>
                <h2 className="text-base mb-2 font-medium opacity-90">USDT</h2>
                {/* <div className="flex items-baseline justify-center gap-1 mb-6 md:mb-8">
          <h1 className="text-6xl font-bold">{Math.floor(parseFloat(formattedBalance))}</h1>
          <span className="text-2xl font-medium opacity-75">
            ,{(parseFloat(formattedBalance) % 1).toFixed(2).slice(2)}
          </span>
        </div> */}
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
        <div className="flex bg-primary items-center flex-col grow pt-0 md:pt-10 min-dvh">
            <BalanceHeader />
            <div className="flex-1 w-full bg-neutral-100 dark:bg-neutral-800 mb-20 md:mb-0 pt-8">
                {currentView === "ally" ? <AllyContent /> : <UserContent />}
            </div>
        </div>
    );
};

export default Home;