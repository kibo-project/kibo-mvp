"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useOrder } from "@/hooks/orders/useOrder";
import { NextPage } from "next";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Button, Card, CardBody, CardTitle, Modal, ModalBody, ModalFooter, ModalHeader } from "~~/components/kibo";

interface OrderProps {
  params: Promise<{
    id: string;
  }>;
}

const OrderDetails: NextPage<OrderProps> = ({ params }) => {
  const [orderId, setOrderId] = useState<string | null>(null);
  const { data, isLoading, error } = useOrder(orderId ?? "");
  const [modalImage, setModalImage] = useState<{ url: string; title: string } | null>(null);

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

  if (!data || !data.data) {
    return (
      <div className="md:mx-auto md:min-w-md px-4">
        <div className="flex items-center justify-center h-64">
          <div>No order data found</div>
        </div>
      </div>
    );
  }

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
                <p className="text-sm font-medium">{data.data.id}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Status</p>
                <p className="text-sm font-medium text-yellow-600">{data.data.status}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Crypto Amount</p>
                <p className="text-sm font-medium">
                  {data.data.cryptoAmount} {data.data.cryptoCurrency}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Fiat Amount</p>
                <p className="text-sm font-medium">
                  {data.data.fiatAmount} {data.data.fiatCurrency}
                </p>
              </div>
            </div>

            {data.data.userId && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">User</p>
                  <p className="text-sm font-medium">{data.data.status}</p>
                </div>
                {data.data.createdAt && (
                  <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Date</p>
                    <p className="text-sm font-medium">{new Date(data.data.createdAt).toLocaleString()}</p>
                  </div>
                )}
              </div>
            )}

            {data.data.userId && (
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Wallet Address</p>
                <p className="text-sm font-medium break-all">{data.data.escrowAddress}</p>
              </div>
            )}
            <div className="flex justify-center gap-4 mt-4">
              <div className="bg-white dark:bg-neutral-800 rounded-lg border p-3 flex flex-col items-center shadow-sm">
                <span className="font-medium mb-2 text-sm">Payment QR Code</span>
                {data.data?.qrImageUrl ? (
                  <img
                    src={data.data.qrImageUrl}
                    alt="Transaction QR"
                    className="w-32 h-32 object-contain rounded-lg border cursor-pointer hover:opacity-80"
                    onClick={() => setModalImage({ url: data.data!.qrImageUrl!, title: "Payment QR Code" })}
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg border flex items-center justify-center">
                    <span className="text-gray-500 text-xs">No image</span>
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-neutral-800 rounded-lg border p-3 flex flex-col items-center shadow-sm">
                <span className="font-medium mb-2 text-sm">Confirmation Proof</span>
                {data.data?.confirmationProofUrl ? (
                  <img
                    src={data.data.confirmationProofUrl}
                    alt="Confirmation Proof"
                    className="w-32 h-32 object-contain rounded-lg border cursor-pointer hover:opacity-80"
                    onClick={() =>
                      setModalImage({ url: data.data!.confirmationProofUrl!, title: "Confirmation Proof" })
                    }
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg border flex items-center justify-center">
                    <span className="text-gray-500 text-xs">No image</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
      {/* Image Preview Modal */}
      {modalImage && (
        <Modal open={!!modalImage} onClose={() => setModalImage(null)}>
          <ModalHeader onClose={() => setModalImage(null)}>
            <h3 className="text-lg font-semibold">{modalImage.title}</h3>
          </ModalHeader>
          <ModalBody>
            <div className="text-center">
              <Image
                src={modalImage.url}
                alt={modalImage.title}
                width={400}
                height={400}
                className="rounded-lg max-w-full max-h-[60vh] object-contain mx-auto"
                unoptimized
              />
            </div>
          </ModalBody>
          <ModalFooter justify="center">
            <Button variant="primary" onClick={() => setModalImage(null)}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
};

export default OrderDetails;
