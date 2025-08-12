"use client";

import { useOrder } from '@/hooks/orders/useOrder';
import { NextPage } from 'next';
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeftIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Card, CardBody, CardTitle } from "~~/components/kibo";

interface OrderProps {
    params: Promise<{
        id: string;
    }>;
}

const OrderDetails: NextPage<OrderProps> = ({ params }) => {
    const [orderId, setOrderId] = useState<string | null>(null);
    const { data, isLoading, error } = useOrder(orderId ?? '');

    useEffect(() => {
        params.then(resolvedParams => {
            setOrderId(resolvedParams.id);
        });
    }, [params]);

    if (isLoading) {
        return (
            <div className="md:mx-auto md:min-w-md px-4">
                <div className="flex items-center justify-center h-64">
                    <div>Loading...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="md:mx-auto md:min-w-md px-4">
                <div className="flex items-center justify-center h-64">
                    <div className="text-red-600">Error: {error.message}</div>
                </div>
            </div>
        );
    }

    if (!data?.order) {
        return (
            <div className="md:mx-auto md:min-w-md px-4">
                <div className="flex items-center justify-center h-64">
                    <div>Order not found</div>
                </div>
            </div>
        );
    }

    const order = data.order;

    return (
        <div className="md:mx-auto md:min-w-md px-4">
            {/* Header */}
            <div className="kibo-page-header mb-6">
                <div className="flex items-center gap-3">
                    <Link href="/movements" className="flex items-center">
                        <ArrowLeftIcon className="w-6 h-6 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors" />
                    </Link>
                    <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Order Details</h1>
                </div>
            </div>

            {/* Order Details */}
            <Card shadow="sm" className="mb-6">
                <CardBody>
                    <CardTitle className="text-base mb-4">Order Information</CardTitle>
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Order ID</p>
                                <p className="text-sm font-medium">{order.id}</p>
                            </div>
                            <div>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Status</p>
                                <p className="text-sm font-medium text-yellow-600">{order.status}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Crypto Amount</p>
                                <p className="text-sm font-medium">{order.amountCrypto} {order.cryptoToken}</p>
                            </div>
                            <div>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Fiat Amount</p>
                                <p className="text-sm font-medium">{order.amountFiat} {order.fiatCurrency}</p>
                            </div>
                        </div>

                        {order.user && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">User</p>
                                    <p className="text-sm font-medium">{order.user.reputation}</p>
                                </div>
                                {order.createdAt && (
                                    <div>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Date</p>
                                        <p className="text-sm font-medium">{new Date(order.createdAt).toLocaleString()}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {order.user && (
                            <div>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Wallet Address</p>
                                <p className="text-sm font-medium break-all">{order.user.walletAddress}</p>
                            </div>
                        )}
                    </div>
                </CardBody>
            </Card>

            {/* QR Code Section - Optional */}
            {order.qrImageUrl && (
                <Card shadow="sm" className="mb-6">
                    <CardBody>
                        <CardTitle className="text-base mb-4">Payment QR Code</CardTitle>
                        <div className="flex justify-center">
                            <div className="w-48 h-48 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center border">
                                <img
                                    src={order.qrImageUrl}
                                    alt="QR Code"
                                    className="w-full h-full object-cover rounded-lg"
                                    width={192}
                                    height={192}
                                    onError={e => {
                                        const target = e.currentTarget as HTMLImageElement;
                                        target.style.display = "none";
                                        const nextSibling = target.nextElementSibling as HTMLElement;
                                        if (nextSibling) {
                                            nextSibling.style.display = "flex";
                                        }
                                    }}
                                />
                                <div className="hidden flex-col items-center text-neutral-400">
                                    <div className="w-16 h-16 bg-neutral-200 dark:bg-neutral-700 rounded mb-2"></div>
                                    <p className="text-xs">QR Code Preview</p>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            )}
        </div>
    );
};

export default OrderDetails;