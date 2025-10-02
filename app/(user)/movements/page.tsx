"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pagination } from "@/components/Pagination";
import { RoleGuard } from "@/components/RoleGuard";
import { StatusFilter } from "@/components/StatusFilter";
import { OrderListSkeleton } from "@/components/skeletons";
import { OrdersFilters } from "@/core/types/orders.types";
import { useOrders } from "@/hooks/orders/useOrders";
import { OrderStatus } from "@/services/orders";
import { NextPage } from "next";
import { ArrowLeftIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Badge, Button, Card, CardBody, CardTitle, Input } from "~~/components/kibo";
import { formatDateToSpanish } from "~~/utils/front.functions";

const Movements: NextPage = () => {
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [pagination, setPagination] = useState<OrdersFilters>();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const { data, isLoading, error, refetch } = useOrders({
    filters: { ...pagination, status: statusFilter || undefined, search: searchFilter || undefined },
  });
  const orders = data?.data?.orders ?? [];
  const router = useRouter();

  const handleMovementAction = useCallback(
    (id: string) => {
      router.push(`/movements/${id}`);
    },
    [router]
  );

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
  const handlePageChange = useCallback((newOffset: number) => {
    setPagination(prev => ({ ...prev, offset: newOffset }));
  }, []);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

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

        {/* Movements List */}
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
            orders.map(movement => (
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
                              : movement.status === OrderStatus.AVAILABLE || movement.status === OrderStatus.TAKEN
                                ? "warning"
                                : movement.status === OrderStatus.COMPLETED
                                  ? "success"
                                  : movement.status === OrderStatus.CANCELLED
                                    ? "error"
                                    : "info"
                          }
                          size="sm"
                        >
                          {movement.status}
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
                  {searchFilter ? (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Try adjusting your search terms</p>
                  ) : (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">No transactions available</p>
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

export default Movements;
