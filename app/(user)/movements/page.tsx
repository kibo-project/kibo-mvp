"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RoleGuard } from "@/components/RoleGuard";
import { OrderResponse } from "@/core/types/orders.types";
import { useOrders } from "@/hooks/orders/useOrders";
import { OrderStatus } from "@/services/orders";
// import { OrderStatus } from "./OrderStatus";
import { NextPage } from "next";
import { ArrowLeftIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Badge, Button, Card, CardBody, CardTitle, Input } from "~~/components/kibo";
import { formatDateToSpanish } from "~~/utils/front.functions";

const Movements: NextPage = () => {
  const { data, isLoading, error, refetch } = useOrders();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleMovementAction = useCallback(
    (id: string) => {
      router.push(`/movements/${id}`);
    },
    [router]
  );

  const filteredMovements =
    data?.data?.orders?.filter((order: OrderResponse) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        `${order.cryptoAmount} ${order.cryptoCurrency}`.toLowerCase().includes(searchLower) ||
        `${order.fiatAmount} ${order.fiatCurrency}`.toLowerCase().includes(searchLower) ||
        formatDateToSpanish(order.createdAt).toLowerCase().includes(searchLower)
      );
    }) ?? [];

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <RoleGuard requiredRole="user">
        <div className="md:mx-auto md:min-w-md px-4">
          <div className="flex justify-center items-center py-8">
            <p>Loading Transactions...</p>
          </div>
        </div>
      </RoleGuard>
    );
  }

  if (error) {
    return (
      <RoleGuard requiredRole="user">
        <div className="md:mx-auto md:min-w-md px-4">
          <div className="flex flex-col justify-center items-center py-8">
            <p className="text-red-500 mb-4">Error: {error.message}</p>
            <Button onClick={handleRefresh}>Retry</Button>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard requiredRole="user">
      <div className="md:mx-auto md:min-w-md px-4">
        {/* Header */}
        <div className="kibo-page-header mb-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center">
              <ArrowLeftIcon className="w-6 h-6 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors" />
            </Link>
            <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Transaction History</h1>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={handleSearchChange}
            leftIcon={<MagnifyingGlassIcon className="w-4 h-4" />}
            fullWidth
          />
        </div>

        {/* Movements List */}
        <div className="kibo-section-spacing mb-32">
          {filteredMovements.length > 0 ? (
            filteredMovements.map(movement => (
              <Card key={movement.id} shadow="sm">
                <CardBody>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-base mb-1 flex items-center gap-2">
                        <span className="text-neutral-900 dark:text-neutral-100">Payment</span>
                        <Badge
                          variant={
                            movement.status === OrderStatus.PENDING_PAYMENT
                              ? "gray"
                              : movement.status === OrderStatus.COMPLETED
                                ? "success"
                                : movement.status === OrderStatus.CANCELLED
                                  ? "error"
                                  : "info"
                          }
                          size="sm"
                        >
                          {movement.status === OrderStatus.PENDING_PAYMENT && "Pending"}
                          {movement.status === OrderStatus.COMPLETED && "Completed"}
                          {movement.status === OrderStatus.CANCELLED && "Canceled"}
                          {movement.status === OrderStatus.REFUNDED && "Refunded"}
                        </Badge>
                      </CardTitle>
                      <div className="space-y-1">
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          <span className="font-medium">{`${movement.cryptoAmount} ${movement.cryptoCurrency}`}</span>
                          <span className="mx-2">•</span>
                          <span>{`${movement.fiatAmount} ${movement.fiatCurrency}`}</span>
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-500">
                          {formatDateToSpanish(movement.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="xs"
                      className="self-center min-w-20"
                      onClick={() => handleMovementAction(movement.id)}
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
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                    <MagnifyingGlassIcon className="w-8 h-8 text-neutral-400" />
                  </div>
                  <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                    No transactions found
                  </h3>
                  {searchTerm ? (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Try adjusting your search terms</p>
                  ) : (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">No transactions available</p>
                  )}
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </RoleGuard>
  );
};

export default Movements;
