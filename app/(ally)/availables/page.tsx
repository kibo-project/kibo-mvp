"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ConfirmationModal } from "@/components/ConfimationModal";
import { Pagination } from "@/components/Pagination";
import { RoleGuard } from "@/components/RoleGuard";
import { OrderResponse } from "@/core/types/orders.types";
import { useAvailableOrders } from "@/hooks/orders/useAvailableOrders";
import { useTakeOrder } from "@/hooks/orders/useTakeOrder";
import { NextPage } from "next";
import toast from "react-hot-toast";
import { ArrowLeftIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardTitle,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "~~/components/kibo";
import { formatDateToSpanish } from "~~/utils/front.functions";

const AllyAvailableOrders: NextPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
  const [showTakeOrderModal, setShowTakeOrderModal] = useState(false);

  const { data, isLoading, error } = useAvailableOrders();

  const takeOrder = useTakeOrder();

  const handleViewOrderDetails = useCallback((order: OrderResponse) => {
    setSelectedOrder(order);
    setShowModal(true);
  }, []);

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

  const handleConfirmTakeOrder = useCallback(async () => {
    if (selectedOrder) {
      setShowTakeOrderModal(false);
      const result = await takeOrder.mutateAsync(selectedOrder.id);
      if (result.success) {
        toast.success("order taken successfully");
        router.push(`/transactions/${result.data?.id}`);
      } else {
        toast.error(`Error creating order: ${result.error?.message}`);
      }
      setSelectedOrder(null);
    }
  }, [selectedOrder, takeOrder, router]);

  const handleCancelTakeOrder = useCallback(() => {
    setShowTakeOrderModal(false);
    setSelectedOrder(null);
  }, []);

  const filteredOrders =
    data?.data?.orders?.filter(order => {
      const searchLower = searchTerm.toLowerCase();
      return (
        order.id.toLowerCase().includes(searchLower) ||
        `${order.cryptoAmount} ${order.cryptoCurrency}`.toLowerCase().includes(searchLower) ||
        `${order.fiatAmount} ${order.fiatCurrency}`.toLowerCase().includes(searchLower) ||
        order.userId?.toLowerCase().includes(searchLower) ||
        formatDateToSpanish(order.createdAt, { fixedTimeZone: true }).toLowerCase().includes(searchLower)
      );
    }) ?? [];

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  if (isLoading) {
    return (
      <RoleGuard requiredRole="ally">
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
      </RoleGuard>
    );
  }

  if (error) {
    return (
      <RoleGuard requiredRole="ally">
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
      </RoleGuard>
    );
  }

  return (
    <RoleGuard requiredRole="ally">
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
                          <span className="font-medium">{`${order.cryptoAmount} ${order.cryptoCurrency}`}</span>
                          <span className="mx-2">•</span>
                          <span>{`${order.fiatAmount} ${order.fiatCurrency}`}</span>
                        </p>
                        <p className="text-xs text-neutral-500">{order.userId}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-500">
                          {formatDateToSpanish(order.createdAt, { fixedTimeZone: true })}
                        </p>
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

        {/* Modal de detalles de la orden */}
        {showModal && selectedOrder && (
          <Modal open={showModal} onClose={handleCloseModal} className="max-w-md">
            <ModalHeader onClose={handleCloseModal}>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Order Details</h3>
            </ModalHeader>

            <ModalBody>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Order ID</label>
                  <p className="text-sm text-neutral-900 dark:text-neutral-100 font-mono">{selectedOrder.id}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Crypto Amount</label>
                    <p className="text-sm text-neutral-900 dark:text-neutral-100">
                      {selectedOrder.cryptoAmount} {selectedOrder.cryptoCurrency}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Fiat Amount</label>
                    <p className="text-sm text-neutral-900 dark:text-neutral-100">
                      {selectedOrder.fiatAmount} {selectedOrder.fiatCurrency}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">User</label>
                  <p className="text-sm text-neutral-900 dark:text-neutral-100">{selectedOrder.userId}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Creation Date</label>
                  <p className="text-sm text-neutral-900 dark:text-neutral-100">
                    {formatDateToSpanish(selectedOrder.createdAt, { fixedTimeZone: true })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Expiration Date</label>
                  <p className="text-sm text-neutral-900 dark:text-neutral-100">
                    {formatDateToSpanish(selectedOrder.expiresAt, { fixedTimeZone: true })}
                  </p>
                </div>

                {selectedOrder.description && (
                  <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Description</label>
                    <p className="text-sm text-neutral-900 dark:text-neutral-100">{selectedOrder.description}</p>
                  </div>
                )}

                {selectedOrder.recipient && (
                  <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Recipient</label>
                    <p className="text-sm text-neutral-900 dark:text-neutral-100">{selectedOrder.recipient}</p>
                  </div>
                )}
              </div>
            </ModalBody>

            <ModalFooter>
              <div className="flex gap-3 w-full">
                <Button
                  variant="ghost"
                  onClick={handleCloseModal}
                  fullWidth
                  className="border border-neutral-300 dark:border-neutral-600"
                >
                  Close
                </Button>
                <Button variant="primary" onClick={handleTakeOrderFromModal} fullWidth>
                  Take Order
                </Button>
              </div>
            </ModalFooter>
          </Modal>
        )}

        {/* Modal de confirmación para tomar la orden */}
        {showTakeOrderModal && selectedOrder && (
          <ConfirmationModal
            isOpen={showTakeOrderModal}
            onClose={handleCancelTakeOrder}
            onConfirm={handleConfirmTakeOrder}
            message="Are you sure you want to take this order?"
            isLoading={takeOrder.isPending}
            requiresReason={false}
          />
        )}
      </div>
    </RoleGuard>
  );
};

export default AllyAvailableOrders;
