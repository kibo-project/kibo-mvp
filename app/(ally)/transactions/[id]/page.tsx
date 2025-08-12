"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NextPage } from "next";
import { ArrowLeftIcon, CameraIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { Button, Card, CardBody, CardTitle } from "~~/components/kibo";
import { useAdminPaymentStore } from "~~/services/store/admin-payment-store";
import { useAuthStore } from "~~/services/store/auth-store.";

interface AdminPaymentProofProps {
  params: Promise<{
    id: string;
  }>;
}

const PHOTO_WIDTH = 320;
const DEFAULT_ASPECT_RATIO = 4 / 3;

const AdminPaymentProof: NextPage<AdminPaymentProofProps> = ({ params }) => {
  const { isAdmin } = useAuthStore();
  const router = useRouter();
  const { selectedTransactionId, paymentProofImage, setPaymentProofImage } = useAdminPaymentStore();
  const [transactionId, setTransactionId] = useState<string | null>(null);

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

  useEffect(() => {
    if (!isAdmin()) {
      router.push("/");
      return;
    }

    if (transactionId && selectedTransactionId !== transactionId) {
      router.push("/transactions");
      return;
    }
  }, [isAdmin, selectedTransactionId, transactionId, router]);

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
      console.error("Error accessing camera:", err);
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
        const dataURL = canvas.toDataURL("image/png");
        setPreviewImage(dataURL);
        setPaymentProofImage(dataURL);
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
          setPaymentProofImage(result);
        };
        reader.readAsDataURL(file);
      }
    },
    [setPaymentProofImage],
  );

  const handleSubmitProof = useCallback(() => {
    if (paymentProofImage) {
      // In a real app, this would send the proof to the backend
      alert("Payment proof submitted successfully!");
      router.push("/transactions");
    }
  }, [paymentProofImage, router]);

  const retakePhoto = useCallback(() => {
    setPreviewImage(null);
    setPaymentProofImage(null);
  }, [setPaymentProofImage]);

  if (!isAdmin() || !transactionId || selectedTransactionId !== transactionId) {
    return null;
  }

  // Mock transaction data - in real app, this would come from API
  const transactionData = {
    id: transactionId,
    mainAmount: "120 USDT",
    secondaryAmount: "1920 Bs",
    userInfo: "User #67890",
    date: "10-05-2025 16:15",
  };

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
              <span className="font-medium">ID:</span> {transactionData.id}
            </p>
            <p className="text-sm">
              <span className="font-medium">Amount:</span> {transactionData.mainAmount} (
              {transactionData.secondaryAmount})
            </p>
            <p className="text-sm">
              <span className="font-medium">User:</span> {transactionData.userInfo}
            </p>
            <p className="text-sm">
              <span className="font-medium">Date:</span> {transactionData.date}
            </p>
          </div>
        </CardBody>
      </Card>

      {/* TODO: Display the QR code to scan easily */}

      {/* Camera/Upload Section */}
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
                  <Button onClick={capturePhoto} variant="primary" fullWidth>
                    <CameraIcon className="w-5 h-5 mr-2" />
                    Capture Payment Proof
                  </Button>
                )}

                <Button onClick={() => fileInputRef.current?.click()} variant="secondary" fullWidth>
                  <PhotoIcon className="w-5 h-5 mr-2" />
                  Upload from Gallery
                </Button>

                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </div>
            </>
          ) : (
            <>
              <CardTitle className="text-base mb-4">Payment Proof Preview</CardTitle>

              {/* Preview Image */}
              <div className="mb-4">
                <Image
                  src={previewImage}
                  alt="Payment proof preview"
                  className="w-full rounded-lg border"
                  width={800}
                  height={600}
                  style={{ objectFit: "contain" }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button onClick={retakePhoto} variant="secondary" fullWidth>
                  Retake Photo
                </Button>
                <Button onClick={handleSubmitProof} variant="primary" fullWidth>
                  Send Proof
                </Button>
              </div>
            </>
          )}
        </CardBody>
      </Card>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default AdminPaymentProof;
