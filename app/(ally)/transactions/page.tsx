"use client";


import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { adminStatusButtonLabels, StyledOrderStatus } from "../../(user)/movements/MovementStatus";
import { NextPage } from "next";
import { ArrowLeftIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { AdminProtected } from "~~/components/AdminProtected";
import { Badge, Button, Card, CardBody, CardTitle, Input } from "~~/components/kibo";
import { useAdminPaymentStore } from "~~/services/store/admin-payment-store";
import { OrderStatus } from "@/services/orders";
import { useAvailableOrders } from "@/hooks/orders/useAvailableOrders";

// TODO: Delete LocalTransaction and replace with Order
interface LocalTransaction {
    id: string;
    status: StyledOrderStatus;
    mainAmount: string;
    secondaryAmount: string;
    date: string;
    userInfo: string;
    qrImage: string;
}

const AdminTransactions: NextPage = () => {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const {
        data,
        // isLoading,
        // error
    } = useAvailableOrders();

    const { setSelectedTransactionId } = useAdminPaymentStore();

    const handleTransactionAction = useCallback(
        (id: string, status: OrderStatus) => {
            setSelectedTransactionId(id);

            switch (status) {
                case OrderStatus.AVAILABLE:
                    router.push(`/transactions/${id}`);
                    break;
                case OrderStatus.COMPLETED:
                    router.push(`/transactions/admin/review/${id}`);
                    break;
                case OrderStatus.REFUNDED:
                    router.push(`/transactions/admin/review/${id}`);
                    break;
                default:
                    break;
            }
        },
        [router, setSelectedTransactionId],
    );

    // TODO: Replace LocalTransaction with Order from the API
    const adminTransactions: LocalTransaction[] = data?.data?.orders
        ? data.data.orders.map((order) => ({
            id: order.id,
            status:
                order.status === OrderStatus.AVAILABLE
                    ? OrderStatus.AVAILABLE
                    : order.status === OrderStatus.COMPLETED
                        ? OrderStatus.COMPLETED
                        : order.status === OrderStatus.REFUNDED
                            ? OrderStatus.REFUNDED
                            : OrderStatus.AVAILABLE,
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
            qrImage: order.qrImage || "",
        }))
        : [];

    const filteredTransactions = adminTransactions.filter(transaction => {
        const searchLower = searchTerm.toLowerCase();
        return (
            transaction.id.toLowerCase().includes(searchLower) ||
            transaction.mainAmount.toLowerCase().includes(searchLower) ||
            transaction.secondaryAmount.toLowerCase().includes(searchLower) ||
            transaction.userInfo.toLowerCase().includes(searchLower) ||
            transaction.date.toLowerCase().includes(searchLower)
        );
    });

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    }, []);

    const getStatusBadgeVariant = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.COMPLETED:
                return "success";
            case OrderStatus.AVAILABLE:
                return "warning";
            case OrderStatus.REFUNDED:
                return "error";
            default:
                return "gray";
        }
    };

    const getStatusLabel = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.AVAILABLE:
                return "Needs Review";
            case OrderStatus.COMPLETED:
                return "Completed";
            case OrderStatus.REFUNDED:
                return "Failed";
            default:
                return status;
        }
    };

    return (
        <AdminProtected>
            <div className="md:mx-auto md:min-w-md px-4">
                {/* Header */}
                <div className="kibo-page-header mb-6">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="flex items-center">
                            <ArrowLeftIcon className="w-6 h-6 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors" />
                        </Link>
                        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Admin Transactions</h1>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <Input
                        type="text"
                        placeholder="Search transactions, users, amounts..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        leftIcon={<MagnifyingGlassIcon className="w-4 h-4" />}
                        fullWidth
                    />
                </div>

                {/* Transactions List */}
                <div className="kibo-section-spacing mb-32">
                    {filteredTransactions.length > 0 ? (
                        filteredTransactions.map(transaction => (
                            <Card key={transaction.id} shadow="sm">
                                <CardBody>
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <CardTitle className="text-base mb-1 flex items-center gap-2">
                                                <span className="text-neutral-900 dark:text-neutral-100">{transaction.id}</span>
                                                <Badge variant={getStatusBadgeVariant(transaction.status)} size="sm">
                                                    {getStatusLabel(transaction.status)}
                                                </Badge>
                                            </CardTitle>
                                            <div className="space-y-1">
                                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                                    <span className="font-medium">{transaction.mainAmount}</span>
                                                    <span className="mx-2">•</span>
                                                    <span>{transaction.secondaryAmount}</span>
                                                </p>
                                                <p className="text-xs text-neutral-500">{transaction.userInfo}</p>
                                                <p className="text-xs text-neutral-500 dark:text-neutral-500">{transaction.date}</p>
                                            </div>
                                        </div>
                                        <Button
                                            variant={
                                                transaction.status === OrderStatus.COMPLETED
                                                    ? "primary"
                                                    : transaction.status === OrderStatus.AVAILABLE
                                                        ? "secondary"
                                                        : "ghost"
                                            }
                                            size="sm"
                                            className="self-center min-w-24"
                                            onClick={() => handleTransactionAction(transaction.id, transaction.status)}
                                        >
                                            {adminStatusButtonLabels[transaction.status]}
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
                                        No transactions found
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
        </AdminProtected>
    );
};

export default AdminTransactions;