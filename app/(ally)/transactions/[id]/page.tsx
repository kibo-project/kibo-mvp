"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UploadProofRequest } from "@/core/types/orders.types";
import { useOrder } from "@/hooks/orders/useOrder";
import { useUploadProof } from "@/hooks/orders/useUploadProof";
import { NextPage } from "next";
import toast from "react-hot-toast";
import { ArrowLeftIcon, CameraIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { Button, Card, CardBody, CardTitle, Modal, ModalBody, ModalFooter, ModalHeader } from "~~/components/kibo";
import { useAdminPaymentStore } from "~~/services/store/admin-payment-store";
import { formatDateToSpanish } from "~~/utils/front.functions";

interface AdminPaymentProofProps {
  params: Promise<{
    id: string;
  }>;
}

const PHOTO_WIDTH = 320;
const DEFAULT_ASPECT_RATIO = 4 / 3;

const AdminPaymentProof: NextPage<AdminPaymentProofProps> = ({ params }) => {
  const router = useRouter();
  const { paymentProofImage, setPaymentProofImage } = useAdminPaymentStore();
  const { mutate: uploadProof, isPending: isUploading, error: uploadError } = useUploadProof();
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const { data, isLoading: isLoadingOrder } = useOrder(transactionId ?? "");
  const [modalImage, setModalImage] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    params.then(resolvedParams => {
      setTransactionId(resolvedParams.id);
    });
  }, [params]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const heightRef = useRef(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const getErrorMessage = useCallback((error: Error): string => {
    const errorMessages: Record<string, string> = {
      NotAllowedError: "Permission denied",
      NotFoundError: "No camera found",
      NotReadableError: "Camera in use by another app",
    };
    return `Could not access camera: ${errorMessages[error.name] || error.message}`;
  }, []);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const initializeCamera = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      setError("Video or canvas element not found");
      setIsLoading(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: PHOTO_WIDTH },
          height: { ideal: PHOTO_WIDTH / DEFAULT_ASPECT_RATIO },
          facingMode: { ideal: "environment" },
        },
        audio: false,
      });

      streamRef.current = stream;
      video.srcObject = stream;

      const onCanPlay = () => {
        if (!streaming) {
          heightRef.current = video.videoHeight / (video.videoWidth / PHOTO_WIDTH);

          if (isNaN(heightRef.current)) {
            heightRef.current = PHOTO_WIDTH / DEFAULT_ASPECT_RATIO;
          }

          video.setAttribute("width", PHOTO_WIDTH.toString());
          video.setAttribute("height", heightRef.current.toString());
          canvas.setAttribute("width", PHOTO_WIDTH.toString());
          canvas.setAttribute("height", heightRef.current.toString());
          setStreaming(true);
          setIsLoading(false);
        }
      };

      video.addEventListener("canplay", onCanPlay);

      return () => {
        video.removeEventListener("canplay", onCanPlay);
      };
    } catch (err) {
      toast.error(`Error accessing camera:${err}`);
      setError(getErrorMessage(err as Error));
      setIsLoading(false);
    }
  }, [getErrorMessage, streaming]);

  useEffect(() => {
    initializeCamera();
    return () => {
      stopStream();
    };
  }, [initializeCamera, stopStream]);

  const capturePhoto = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (canvas && video) {
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, PHOTO_WIDTH, heightRef.current);
        canvas.toBlob(blob => {
          if (blob) {
            const dataURL = canvas.toDataURL("image/png");
            setPreviewImage(dataURL);
            setPaymentProofImage(blob);
          }
        }, "image/png");
      }
    }
  }, [setPaymentProofImage]);

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = e => {
          const result = e.target?.result as string;
          setPreviewImage(result);
          setPaymentProofImage(file);
        };
        reader.readAsDataURL(file);
      }
    },
    [setPaymentProofImage]
  );

  const handleSubmitProof = useCallback(() => {
    if (paymentProofImage && transactionId) {
      const uploadProofRequest: UploadProofRequest = {
        proof: paymentProofImage as File,
      };
      uploadProof(
        {
          orderId: transactionId,
          data: uploadProofRequest,
        },
        {
          onSuccess: () => {
            toast.success("Payment proof submitted successfully!");
            router.push("/availables");
          },
          onError: error => {
            toast.error(`Error uploading proof: ${error.message}`);
          },
        }
      );
    }
  }, [paymentProofImage, transactionId, uploadProof, router]);

  const retakePhoto = useCallback(() => {
    setPreviewImage(null);
    setPaymentProofImage(null);
  }, [setPaymentProofImage]);

  if (isLoadingOrder) {
    return (
      <div className="md:mx-auto md:min-w-md px-4">
        <div className="flex items-center justify-center h-64">
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="md:mx-auto md:min-w-md px-4">
        <div className="flex items-center justify-center h-64">
          <div>Order not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="md:mx-auto md:min-w-md px-4">
      {/* Header */}
      <div className="kibo-page-header mb-6">
        <div className="flex items-center gap-3">
          <Link href="/transactions" className="flex items-center">
            <ArrowLeftIcon className="w-6 h-6 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors" />
          </Link>
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Send Payment Proof</h1>
        </div>
      </div>
      {/* Transaction Info */}
      <Card shadow="sm" className="mb-6">
        <CardBody>
          <CardTitle className="text-base mb-2">Transaction Details</CardTitle>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="font-medium">Amount:</span> {`${data.data.cryptoAmount} ${data.data.cryptoCurrency}`} (
              {`${data.data.fiatAmount} ${data.data.fiatCurrency}`})
            </p>
            <p className="text-sm">
              <span className="font-medium"> Creation date:</span> {formatDateToSpanish(data.data.createdAt)}
            </p>
            {data.data.recipient && (
              <p className="text-sm">
                <span className="font-medium">Recipient:</span> {data.data.recipient}
              </p>
            )}
            {data.data.description && (
              <p className="text-sm">
                <span className="font-medium">Description:</span> {data.data.description}
              </p>
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
      {/* Camera/Upload Section */}
      {data.data.status === "TAKEN" && (
        <Card shadow="sm" className="mb-6">
          <CardBody>
            {!previewImage ? (
              <>
                <CardTitle className="text-base mb-4">Capture Payment Proof</CardTitle>

                {/* Camera Feed */}
                {!error && (
                  <div className="relative bg-black rounded-lg overflow-hidden mb-4">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className={`w-full h-auto ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
                    />
                    {isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
                        <div className="text-center">
                          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Starting camera...</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                      <CameraIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  {!error && streaming && (
                    <Button onClick={capturePhoto} variant="primary" fullWidth disabled={isUploading}>
                      Capture Payment Proof
                    </Button>
                  )}

                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="secondary"
                    fullWidth
                    disabled={isUploading}
                  >
                    <PhotoIcon className="w-5 h-5 mr-2" />
                    Upload from Gallery
                  </Button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </>
            ) : (
              <>
                <CardTitle className="text-base mb-4">Payment Proof Preview</CardTitle>

                {/* Preview Image */}
                <div className="mb-4 flex justify-center">
                  <Image
                    src={previewImage}
                    alt="Payment proof preview"
                    className="rounded-lg border"
                    width={240}
                    height={240}
                    style={{ objectFit: "contain" }}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button onClick={retakePhoto} variant="secondary" fullWidth disabled={isUploading}>
                    {" "}
                    Retake Photo
                  </Button>
                  <Button onClick={handleSubmitProof} variant="primary" fullWidth disabled={isUploading}>
                    {" "}
                    {isUploading ? "Uploading..." : "Send Proof"}
                  </Button>
                </div>

                {uploadError && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-400">Error: {uploadError.message}</p>
                  </div>
                )}
              </>
            )}
          </CardBody>
        </Card>
      )}
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

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default AdminPaymentProof;
