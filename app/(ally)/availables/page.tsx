"use client";

import {useCallback, useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {NextPage} from "next";
import {ArrowLeftIcon, MagnifyingGlassIcon, XMarkIcon} from "@heroicons/react/24/outline";
import {Badge, Button, Card, CardBody, CardTitle, Input} from "~~/components/kibo";
import {useAvailableOrders} from "@/hooks/orders/useAvailableOrders";
import {useTakeOrder} from "@/hooks/orders/useTakeOrder";
import {useAdminPaymentStore} from "~~/services/store/admin-payment-store";
import { formatDateToSpanish } from "~~/utils/front.functions";
import {OrderResponse} from "@/core/types/orders.types";

const AllyAvailableOrders: NextPage = () => {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
    const [showTakeOrderModal, setShowTakeOrderModal] = useState(false);

    const {
        data,
        isLoading,
        error
    } = useAvailableOrders();

    const {mutate: takeOrder, isPending: isTakingOrder, error: takeOrderError} = useTakeOrder();

    const {setSelectedTransactionId, setSelectedTransaction} = useAdminPaymentStore();

    const handleViewOrderDetails = useCallback(
        (order: OrderResponse) => {
            setSelectedOrder(order);
            setShowModal(true);
        },
        []
    );

    const handleCloseModal = useCallback(() => {
        setShowModal(false);
        setSelectedOrder(null);
    }, []);

    const handleTakeOrderFromModal = useCallback(() => {
        if (selectedOrder) {
            setShowModal(false);
            setShowTakeOrderModal(true);
        }
    }, [selectedOrder]);

    const handleConfirmTakeOrder = useCallback(() => {
        if (selectedOrder) {
            setSelectedTransactionId(selectedOrder.id);
            setSelectedTransaction(selectedOrder);
            takeOrder(selectedOrder.id, {
                onSuccess: (response) => {
                    setShowTakeOrderModal(false);
                    setSelectedOrder(null);
                    if (response?.data?.order.status === 'TAKEN' || response?.success) {
                        router.push(`/transactions/${selectedOrder.id}`);
                    } else {
                        router.push('/transactions');
                    }
                },
                onError: (error) => {
                    console.error('Error details:', {
                        message: error.message,
                        name: error.name,
                        stack: error.stack
                    });

                    setShowTakeOrderModal(false);
                    setSelectedOrder(null);
                    router.push('/transactions');
                }
            });
        }
    }, [selectedOrder, takeOrder, router, setSelectedTransactionId, setSelectedTransaction]);

    const handleCancelTakeOrder = useCallback(() => {
        setShowTakeOrderModal(false);
        setSelectedOrder(null);
    }, []);

    const filteredOrders = data?.data?.orders?.filter(order => {
        const searchLower = searchTerm.toLowerCase();
        return (
            order.id.toLowerCase().includes(searchLower) ||
            `${order.cryptoAmount} ${order.cryptoCurrency}`.toLowerCase().includes(searchLower)||
            `${order.fiatAmount} ${order.fiatCurrency}`.toLowerCase().includes(searchLower) ||
            order.userId?.toLowerCase().includes(searchLower) ||
            formatDateToSpanish(order.createdAt).toLowerCase().includes(searchLower)
        );
    }) ?? [];

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    }, []);

    if (isLoading) {
        return (
            <div className="md:mx-auto md:min-w-md px-4">
                <div className="kibo-page-header mb-6">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="flex items-center">
                            <ArrowLeftIcon
                                className="w-6 h-6 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"/>
                        </Link>
                        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Available
                            Orders</h1>
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
                            <ArrowLeftIcon
                                className="w-6 h-6 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"/>
                        </Link>
                        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Available
                            Orders</h1>
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
                        <ArrowLeftIcon
                            className="w-6 h-6 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"/>
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
                    leftIcon={<MagnifyingGlassIcon className="w-4 h-4"/>}
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
                                                <span className="font-medium">{`${order.cryptoAmount} ${order.cryptoCurrency}`}</span>
                                                <span className="mx-2">•</span>
                                                <span>{`${order.fiatAmount} ${order.fiatCurrency}`}</span>
                                            </p>
                                            <p className="text-xs text-neutral-500">{order.userId}</p>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-500">{formatDateToSpanish(order.createdAt)}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="self-center min-w-24"
                                        onClick={() => handleViewOrderDetails(order)}
                                    >
                                        Details
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    ))
                ) : (
                    <Card>
                        <CardBody>
                            <div className="text-center py-8">
                                <div
                                    className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                                    <MagnifyingGlassIcon className="w-8 h-8 text-neutral-400"/>
                                </div>
                                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                                    No available orders found
                                </h3>
                                {searchTerm && (
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Try adjusting your
                                        search terms</p>
                                )}
                            </div>
                        </CardBody>
                    </Card>
                )}
            </div>

            {/* Modal de detalles de la orden */}
            {showModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div
                        className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Order
                                    Details</h3>
                                <Button variant="ghost" size="sm" onClick={handleCloseModal} className="p-1 w-8 h-8">
                                    <XMarkIcon className="w-4 h-4"/>
                                </Button>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Order
                                        ID</label>
                                    <p className="text-sm text-neutral-900 dark:text-neutral-100 font-mono">{selectedOrder.id}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Crypto
                                            Amount</label>
                                        <p className="text-sm text-neutral-900 dark:text-neutral-100">{selectedOrder.cryptoAmount} {selectedOrder.cryptoCurrency}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Fiat
                                            Amount</label>
                                        <p className="text-sm text-neutral-900 dark:text-neutral-100">{selectedOrder.fiatAmount} {selectedOrder.fiatCurrency}</p>
                                    </div>
                                </div>

                                <div>
                                    <label
                                        className="text-sm font-medium text-neutral-700 dark:text-neutral-300">User</label>
                                    <p className="text-sm text-neutral-900 dark:text-neutral-100">{selectedOrder.userId}</p>
                                </div>

                                <div>
                                    <label
                                        className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Date</label>
                                    <p className="text-sm text-neutral-900 dark:text-neutral-100">{formatDateToSpanish(selectedOrder.createdAt)}</p>
                                </div>

                                {selectedOrder.description && (
                                    <div>
                                        <label
                                            className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Description</label>
                                        <p className="text-sm text-neutral-900 dark:text-neutral-100">{selectedOrder.description}</p>
                                    </div>
                                )}

                                {selectedOrder.recipient && (
                                    <div>
                                        <label
                                            className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Recipient</label>
                                        <p className="text-sm text-neutral-900 dark:text-neutral-100">{selectedOrder.recipient}</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="ghost"
                                    onClick={handleCloseModal}
                                    fullWidth
                                    className="border border-neutral-300 dark:border-neutral-600"
                                >
                                    Close
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleTakeOrderFromModal}
                                    fullWidth
                                >
                                    Take Order
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de confirmación para tomar la orden */}
            {showTakeOrderModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl max-w-sm w-full">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Take
                                    Order</h3>
                                <Button variant="ghost" size="sm" onClick={handleCancelTakeOrder}
                                        className="p-1 w-8 h-8">
                                    <XMarkIcon className="w-4 h-4"/>
                                </Button>
                            </div>

                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                                Are you sure you want to take this order?
                            </p>

                            {takeOrderError && (
                                <div
                                    className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <p className="text-sm text-red-700 dark:text-red-400">{takeOrderError.message}</p>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <Button
                                    variant="ghost"
                                    onClick={handleCancelTakeOrder}
                                    fullWidth
                                    disabled={isTakingOrder}
                                    className="border border-neutral-300 dark:border-neutral-600"
                                >
                                    No
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleConfirmTakeOrder}
                                    fullWidth
                                    disabled={isTakingOrder}>
                                    {isTakingOrder ? "Taking..." : "Take"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllyAvailableOrders;