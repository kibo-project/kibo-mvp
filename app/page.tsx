"use client";

import {useCallback, useEffect, useMemo, useState} from "react";
import type { NextPage } from "next";
// import { mantleSepoliaTestnet } from "viem/chains";
// import { useAccount, useBalance } from "wagmi";
import {
    type ActivityItem,
    PromoCarousel,
    QuickActions,
    RecentActivity,
} from "~~/components/dashboard";
import { ListIcon, PlaneIcon, QrCodeIcon } from "~~/components/icons/index";
import { Badge } from "~~/components/kibo";
import { useAuthStore } from "~~/services/store/auth-store.";
import {useRouter} from "next/navigation";
import {usePrivy} from "@privy-io/react-auth";

interface TopButton {
    name: string;
    icon: React.ReactNode;
    href: string;
}

const Home: NextPage = () => {
    // const { address } = useAccount();
    const { ready, authenticated} = usePrivy();

    const {
        hasVisitedRoot,
        setHasVisitedRoot,
        userRole,
    } = useAuthStore();
    const router = useRouter();

    // AUTH: Estado local para vista temporal sin modificar el store
    const currentView = userRole === 'admin' ? 'ally' : (userRole || 'user'); // BOTON: Eliminar estado local y usar directamente userRole

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

    const userTransactions: ActivityItem[] = useMemo(
        () => [
            {
                id: "user-1",
                title: "Food place",
                subtitle: "29 Feb, 20:37",
                amount: "Bs 10.2",
                status: "Pending",
                color: "bg-amber-400/60",
                href: "/movements",
            },
            {
                id: "user-2",
                title: "Coffee Shop",
                subtitle: "28 Feb, 09:15",
                amount: "Bs 3.5",
                status: "Completed",
                color: "bg-blue-400/60",
                href: "/movements",
            },
            {
                id: "user-3",
                title: "Bookstore",
                subtitle: "27 Feb, 16:50",
                amount: "Bs 22.0",
                status: "Completed",
                color: "bg-green-400/60",
                href: "/movements",
            },
            {
                id: "user-4",
                title: "Supermarket",
                subtitle: "26 Feb, 18:10",
                amount: "Bs 45.7",
                status: "Failed",
                color: "bg-pink-400/60",
                href: "/movements",
            },
        ],
        []
    );

    const allyTransactions: ActivityItem[] = useMemo(
        () => [
            {
                id: "ally-1",
                title: "Supermercado La Plaza",
                subtitle: "29 Feb, 20:37",
                amount: "55 USDT",
                status: "Completed",
                color: "bg-green-400/60",
                href: "/transactions/admin/payment-proof/TXN001",
            },
            {
                id: "ally-2",
                title: "Farmacia Central",
                subtitle: "29 Feb, 18:15",
                amount: "120 USDT",
                status: "Pending",
                color: "bg-yellow-400/60",
                href: "/transactions/admin/review/TXN002",
            },
            {
                id: "ally-3",
                title: "Restaurante El Fogón",
                subtitle: "29 Feb, 15:42",
                amount: "75 USDT",
                status: "Failed",
                color: "bg-red-400/60",
                href: "/transactions/admin/review/TXN003",
            },
            {
                id: "ally-4",
                title: "Tienda Mi Barrio",
                subtitle: "29 Feb, 12:20",
                amount: "200 USDT",
                status: "Pending",
                color: "bg-blue-400/60",
                href: "/transactions/admin/review/TXN004",
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
                items={userTransactions}
                viewAllHref="/movements"
                emptyMessage="No recent transactions"
            />
        </div>
    );

    const AllyContent = () => (
        <div className="md:mx-auto md:min-w-md max-w-lg px-4">
            <RecentActivity
                title="Recent Activity"
                items={allyTransactions}
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