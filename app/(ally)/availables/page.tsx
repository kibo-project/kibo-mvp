"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NextPage } from "next";
import { ArrowLeftIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Badge, Button, Card, CardBody, CardTitle, Input } from "~~/components/kibo";
import { useAvailableOrders } from "@/hooks/orders/useAvailableOrders";

interface LocalOrder {
    id: string;
    mainAmount: string;
    secondaryAmount: string;
    date: string;
    userInfo: string;
}

const AllyAvailableOrders: NextPage = () => {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");

    const {
        data,
        isLoading,
        error
    } = useAvailableOrders();

    const handleTakeOrder = useCallback(
        (orderId: string) => {
            // Navigate to take order or handle taking the order
            router.push(`/orders/${orderId}/take`);
        },
        [router],
    );

    const availableOrders: LocalOrder[] = data?.data?.orders
        ? data.data.orders.map((order) => ({
            id: order.id,
            mainAmount: `${order.cryptoAmount} ${order.cryptoCurrency}`,
            secondaryAmount: `${order.fiatAmount} ${order.fiatCurrency}`,
            date: new Date(order.createdAt)
                .toLocaleString("es-ES", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                })
                .replace(",", ""),
            userInfo: `User ${order.user?.id ?? ""}`,
        }))
        : [];

    const filteredOrders = availableOrders.filter(order => {
        const searchLower = searchTerm.toLowerCase();
        return (
            order.id.toLowerCase().includes(searchLower) ||
            order.mainAmount.toLowerCase().includes(searchLower) ||
            order.secondaryAmount.toLowerCase().includes(searchLower) ||
            order.userInfo.toLowerCase().includes(searchLower) ||
            order.date.toLowerCase().includes(searchLower)
        );
    });

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    }, []);

    if (isLoading) {
        return (
            <div className="md:mx-auto md:min-w-md px-4">
            <div className="kibo-page-header mb-6">
            <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center">
        <ArrowLeftIcon className="w-6 h-6 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors" />
            </Link>
            <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Available Orders</h1>
        </div>
        </div>
        <div className="text-center py-8">Loading...</div>
        </div>
    );
    }

    if (error) {
        return (
            <div className="md:mx-auto md:min-w-md px-4">
            <div className="kibo-page-header mb-6">
            <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center">
        <ArrowLeftIcon className="w-6 h-6 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors" />
            </Link>
            <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Available Orders</h1>
        </div>
        </div>
        <div className="text-center py-8 text-red-500">Error loading orders</div>
        </div>
    );
    }

    return (
        <div className="md:mx-auto md:min-w-md px-4">
        <div className="kibo-page-header mb-6">
        <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center">
    <ArrowLeftIcon className="w-6 h-6 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors" />
        </Link>
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Available Orders</h1>
    </div>
    </div>

    <div className="mb-6">
    <Input
        type="text"
    placeholder="Search orders, amounts, users..."
    value={searchTerm}
    onChange={handleSearchChange}
    leftIcon={<MagnifyingGlassIcon className="w-4 h-4" />}
    fullWidth
    />
    </div>

    <div className="kibo-section-spacing mb-32">
        {filteredOrders.length > 0 ? (
                filteredOrders.map(order => (
                    <Card key={order.id} shadow="sm">
            <CardBody>
                <div className="flex justify-between items-start">
            <div className="flex-1">
            <CardTitle className="text-base mb-1 flex items-center gap-2">
            <span className="text-neutral-900 dark:text-neutral-100">{order.id}</span>
                <Badge variant="warning" size="sm">
            Available
            </Badge>
            </CardTitle>
            <div className="space-y-1">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
            <span className="font-medium">{order.mainAmount}</span>
                <span className="mx-2">•</span>
    <span>{order.secondaryAmount}</span>
    </p>
    <p className="text-xs text-neutral-500">{order.userInfo}</p>
        <p className="text-xs text-neutral-500 dark:text-neutral-500">{order.date}</p>
        </div>
        </div>
        <Button
    variant="secondary"
    size="sm"
    className="self-center min-w-24"
    onClick={() => handleTakeOrder(order.id)}
>
    Take Order
    </Button>
    </div>
    </CardBody>
    </Card>
))
) : (
        <Card>
            <CardBody>
                <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
        <MagnifyingGlassIcon className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
        No available orders found
    </h3>
    {searchTerm && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400">Try adjusting your search terms</p>
    )}
    </div>
    </CardBody>
    </Card>
)}
    </div>
    </div>
);
};

export default AllyAvailableOrders;