"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Pagination } from "@/components/Pagination";
import { RoleGuard } from "@/components/RoleGuard";
import { StatusFilter } from "@/components/StatusFilter";
import { Badge, Button, Card, CardBody, CardTitle, Input } from "@/components/kibo";
import { OrderListSkeleton } from "@/components/skeletons";
import { OrderStatus, OrdersFilters } from "@/core/types/orders.types";
import { useOrders } from "@/hooks/orders/useOrders";
import { formatDateToSpanish } from "@/utils/front.functions";
import { NextPage } from "next";
import { ArrowLeftIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const Orders: NextPage = () => {
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [pagination, setPagination] = useState<OrdersFilters>();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const { data, isLoading, error, refetch } = useOrders({
    filters: { ...pagination, status: statusFilter || undefined, search: searchFilter || undefined },
  });
  const orders = data?.data?.orders ?? [];

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    if (value.trim() === "") {
      setSearchFilter("");
    }
  }, []);

  const handleSearch = useCallback(() => {
    setSearchFilter(searchInput);
    setPagination(prev => ({ ...prev, offset: 0 }));
  }, [searchInput]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handlePageChange = useCallback((newOffset: number) => {
    setPagination(prev => ({ ...prev, offset: newOffset }));
  }, []);

  return (
    <RoleGuard requiredRole="admin">
      <div className="md:mx-auto md:min-w-md px-4">
        {/* Header */}
        <div className="kibo-page-header mb-6">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center">
              <ArrowLeftIcon className="w-6 h-6 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors" />
            </Link>
            <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Orders List</h1>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6 flex items-center gap-2 w-full">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search transactions..."
              value={searchInput}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              leftIcon={<MagnifyingGlassIcon className="w-5 h-5" />}
              fullWidth
              className="py-2 text-lg"
            />
          </div>

          <Button variant="secondary" size="sm" className="whitespace-nowrap" onClick={handleSearch}>
            Search
          </Button>
        </div>

        <StatusFilter
          currentStatus={statusFilter}
          onStatusChange={status => {
            setStatusFilter(status);
            setPagination(prev => ({ ...prev, offset: 0 }));
          }}
        />

        {/* Transactions List */}
        <div className="kibo-section-spacing mb-32">
          {isLoading ? (
            <OrderListSkeleton count={2} />
          ) : error ? (
            <Card>
              <CardBody>
                <div className="flex flex-col justify-center items-center py-8">
                  <p className="text-red-500 mb-4"> {error.message}</p>
                  <Button onClick={handleRefresh}>Retry</Button>
                </div>
              </CardBody>
            </Card>
          ) : orders.length > 0 ? (
            orders.map(order => (
              <Card key={order.id} shadow="sm">
                <CardBody>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-base mb-1 flex items-center gap-2">
                        <span className="text-neutral-900 dark:text-neutral-100">{"Order"}</span>
                        <Badge
                          variant={
                            order.status === OrderStatus.PENDING_PAYMENT
                              ? "warning"
                              : order.status === OrderStatus.AVAILABLE
                                ? "info"
                                : order.status === OrderStatus.COMPLETED
                                  ? "success"
                                  : order.status === OrderStatus.CANCELLED
                                    ? "error"
                                    : "gray"
                          }
                          size="sm"
                        >
                          {order.status}
                        </Badge>
                      </CardTitle>
                      <div className="space-y-1">
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          <span className="font-medium">{`${order.cryptoAmount} ${order.cryptoCurrency}`}</span>
                          <span className="mx-2">•</span>
                          <span>{`${order.fiatAmount} ${order.fiatCurrency}`}</span>
                        </p>
                        <p className="text-xs text-neutral-500">{order.id}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-500">
                          {formatDateToSpanish(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="self-center min-w-24"
                      //  onClick={() => handleTransactionAction(transaction.id)}
                    >
                      {"Details"}
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
                  <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">No Orders found</h3>
                  {searchFilter && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Try adjusting your search terms</p>
                  )}
                </div>
              </CardBody>
            </Card>
          )}
        </div>
        {/* Paginación */}
        {data?.data?.pagination && (
          <Pagination
            total={data.data.pagination.total}
            limit={data.data.pagination.limit}
            offset={data.data.pagination.offset}
            hasMore={data.data.pagination.hasMore}
            onPageChange={handlePageChange}
            isLoading={isLoading}
          />
        )}

        <div className="mb-32"></div>
      </div>
    </RoleGuard>
  );
};

export default Orders;
