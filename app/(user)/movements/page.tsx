"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
// import { OrderStatus } from "./OrderStatus";
import { NextPage } from "next";
import { ArrowLeftIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Badge, Button, Card, CardBody, CardTitle, Input } from "~~/components/kibo";
import { useOrders } from "@/hooks/orders/useOrders";
import { Order, OrderStatus } from "@/services/orders";
import { useRouter } from "next/navigation";
// import { useOrders } from "~~/hooks/api/useOrders"; // ✅ Importar el hook

// TODO: Delete OrderLocal
export interface OrderLocal {
  id: string;
  userId: string;
  amount: number;
  status: OrderStatus;
  mainAmount: string;
  secondaryAmount: string;
  createdAt: string;
  updatedAt?: string;
  receivedAt?: string;
  completedAt?: string;
}

// Nuevo tipo Movement para mayor type safety
export interface Movement {
  id: string;
  userId: string;
  amount: number;
  status: OrderStatus;
  mainAmount: string;
  secondaryAmount: string;
  date: string;
}

const Movements: NextPage = () => {
  const { data, isLoading, error, refetch } = useOrders();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleMovementAction = useCallback((id: string) => {
    router.push(`/movements/${id}`);
  }, []);

  // ✅ Función para mapear status de Order a OrderStatus
  const mapOrderStatusToMovementStatus = (orderStatus: OrderLocal["status"]): OrderStatus => {
    switch (orderStatus) {
      case "PENDING_PAYMENT":
      case "AVAILABLE":
      case "TAKEN":
        return OrderStatus.AVAILABLE;
      case "COMPLETED":
        return OrderStatus.COMPLETED;
      case "CANCELLED":
      case "REFUNDED":
        return OrderStatus.REFUNDED;
      default:
        return OrderStatus.AVAILABLE;
    }
  };

  // ✅ Función para formatear fecha
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).replace(",", "");
  };

  // TODO: Mapeo de orders a OrderLocal
  const orders: OrderLocal[] = data?.orders
    ? data.orders.map((order: Order) => ({
      id: order.id,
      userId: order.ally?.id ?? "",
      amount: order.amountCrypto,
      status: order.status,
      mainAmount: order.amountFiat + " " + order.fiatCurrency,
      secondaryAmount: order.amountCrypto + " " + order.cryptoToken,
      createdAt: order.createdAt,
    }))
    : [];

  // Mapeo seguro de orders a movements
  const movements: Movement[] = orders.map((order) => ({
    id: order.id,
    userId: order.userId,
    amount: order.amount,
    status: mapOrderStatusToMovementStatus(order.status),
    mainAmount: order.mainAmount,
    secondaryAmount: order.secondaryAmount,
    date: formatDate(
      order.completedAt ||
      order.receivedAt ||
      order.updatedAt ||
      order.createdAt
    ),
  }));

  // Filter movements based on search term
  const filteredMovements = movements.filter((movement) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      movement.mainAmount.toLowerCase().includes(searchLower) ||
      movement.secondaryAmount.toLowerCase().includes(searchLower) ||
      movement.date.toLowerCase().includes(searchLower)
    );
  });

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    []
  );

  // ✅ Handler para refrescar datos
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // ✅ Mostrar loading state
  if (isLoading) {
    return (
      <div className="md:mx-auto md:min-w-md px-4">
        <div className="flex justify-center items-center py-8">
          <p>Cargando transacciones...</p>
        </div>
      </div>
    );
  }

  // ✅ Mostrar error state
  if (error) {
    return (
      <div className="md:mx-auto md:min-w-md px-4">
        <div className="flex flex-col justify-center items-center py-8">
          <p className="text-red-500 mb-4">Error: {error.message}</p>
          <Button onClick={handleRefresh}>Reintentar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="md:mx-auto md:min-w-md px-4">
      {/* Header */}
      <div className="kibo-page-header mb-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center">
            <ArrowLeftIcon className="w-6 h-6 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors" />
          </Link>
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Transaction History
          </h1>
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
          filteredMovements.map((movement) => (
            <Card key={movement.id} shadow="sm">
              <CardBody>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-base mb-1 flex items-center gap-2">
                      {/* ✅ Mostrar tipo de operación */}
                      <span className="text-neutral-900 dark:text-neutral-100">
                        Payment
                      </span>
                      <Badge
                        variant={
                          movement.status === OrderStatus.COMPLETED
                            ? "success"
                            : movement.status === OrderStatus.AVAILABLE
                              ? "warning"
                              : "error"
                        }
                        size="sm"
                      >
                        {movement.status === OrderStatus.AVAILABLE && "Pending"}
                        {movement.status === OrderStatus.COMPLETED &&
                          "Completed"}
                        {movement.status === OrderStatus.REFUNDED && "Failed"}
                      </Badge>
                    </CardTitle>
                    <div className="space-y-1">
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        <span className="font-medium">
                          {movement.mainAmount}
                        </span>
                        <span className="mx-2">•</span>
                        <span>{movement.secondaryAmount}</span>
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-500">
                        {movement.date}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={
                      movement.status === OrderStatus.COMPLETED
                        ? "primary"
                        : movement.status === OrderStatus.AVAILABLE
                          ? "secondary"
                          : "ghost"
                    }
                    size="sm"
                    className="self-center min-w-20"
                    onClick={() =>
                      handleMovementAction(movement.id)
                    }
                  >
                    {movement.status === OrderStatus.AVAILABLE && "View"}
                    {movement.status === OrderStatus.COMPLETED && "Receipt"}
                    {movement.status === OrderStatus.REFUNDED && "Details"}
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
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Try adjusting your search terms
                  </p>
                ) : (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    No transactions available
                  </p>
                )}
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Movements;