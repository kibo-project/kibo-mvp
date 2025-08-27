"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NextPage } from "next";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { SectionQrIcon } from "~~/components/icons";
import { Button } from "~~/components/kibo";
import { usePaymentStore } from "~~/services/store/payment-store";
import { RoleGuard } from '@/components/RoleGuard';


const PHOTO_WIDTH = 320;
const DEFAULT_ASPECT_RATIO = 4 / 3;

const Camera: NextPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const heightRef = useRef(0);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);

  const router = useRouter();
  const setQrImage = usePaymentStore(state => state.setQrImage);
  const setQrImageBase64 = usePaymentStore(state => state.setQrImageBase64);


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
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });

      video.srcObject = stream;
      streamRef.current = stream;
      await video.play();
    } catch (err) {
      const error = err as Error;
      setError(getErrorMessage(error));
      setIsLoading(false);
    }
  }, [getErrorMessage]);

  useEffect(() => {
    initializeCamera();
    return stopStream;
  }, [initializeCamera, stopStream]);

  const handleCanPlay = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || streaming) return;

    const calculatedHeight =
      video.videoHeight && video.videoWidth
        ? (video.videoHeight / video.videoWidth) * PHOTO_WIDTH
        : PHOTO_WIDTH / DEFAULT_ASPECT_RATIO;

    heightRef.current = calculatedHeight;

    // Set dimensions
    [video, canvas].forEach(element => {
      element.setAttribute("width", PHOTO_WIDTH.toString());
      element.setAttribute("height", calculatedHeight.toString());
    });

    setStreaming(true);
    setIsLoading(false);
  }, [streaming]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.addEventListener("canplay", handleCanPlay);
    return () => video.removeEventListener("canplay", handleCanPlay);
  }, [handleCanPlay]);

  const takePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      setError("Video or canvas not available");
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      setError("Could not get canvas context");
      return;
    }

    const height = heightRef.current;
    if (!PHOTO_WIDTH || !height) {
      setError("Video not ready for photo capture");
      return;
    }

    // Set canvas size and draw image
    canvas.width = PHOTO_WIDTH;
    canvas.height = height;
    context.drawImage(video, 0, 0, PHOTO_WIDTH, height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `photo-${Date.now()}.png`, { type: "image/png" });
        setQrImage(file);
        const objectUrl = URL.createObjectURL(file);
        setQrImageBase64(objectUrl);
        router.push("/order/confirmation-payment");
      }
    }, "image/png");

  }, [setQrImage, router]);

  const handleFileUpload = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith("image/")) {
          setQrImage(file);
          const objectUrl = URL.createObjectURL(file);
          setQrImageBase64(objectUrl);
          router.push("/order/confirmation-payment");
        }
      },
      [setQrImage, setQrImageBase64, router],
  );

  const handleRetry = useCallback(() => {
    setError(null);
    setIsLoading(true);
    setStreaming(false);
    initializeCamera();
  }, [initializeCamera]);

  return (
      <RoleGuard requiredRole="user">
      <div className="absolute z-40 h-dvh w-screen flex flex-col dark:bg-neutral-900 bg-neutral-50">
      {/* Header */}
      <header className="h-20 flex mx-4 items-center">
        <Link
          href="/"
          className="flex gap-2 items-center text-neutral-900 dark:text-neutral-100 hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors"
        >
          <ArrowLeftIcon className="w-6 h-6" />
          <span className="font-medium">Back</span>
        </Link>
      </header>

      {/* Camera Display */}
      <div className="flex-1 flex justify-center items-center relative bg-black">
        {isLoading && (
          <div className="text-white text-center p-4">
            <div className="kibo-spinner mx-auto mb-4"></div>
            <p className="text-lg font-medium">Starting camera...</p>
          </div>
        )}

        {error && (
          <div className="text-white text-center p-4 max-w-sm">
            <div className="bg-red-500/20 backdrop-blur-sm rounded-lg p-6 border border-red-300/20">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Camera Error</h3>
              <p className="text-sm mb-4 text-red-100">{error}</p>
              <Button variant="primary" onClick={handleRetry} className="bg-red-500 hover:bg-red-600 border-red-500">
                Retry Camera
              </Button>
            </div>
          </div>
        )}

        <div
          className={`relative w-full h-full flex justify-center items-center ${!streaming || error ? "hidden" : ""}`}
        >
          <SectionQrIcon className="absolute mx-auto" />
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover max-w-md"
            style={{ maxHeight: "70vh" }}
          />
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls */}
      <footer className="h-64 w-full bg-neutral-50 dark:bg-neutral-900 rounded-t-2xl px-8">
        <div className="flex flex-col justify-center items-center h-full gap-4">
          <Button
            variant="primary"
            onClick={takePhoto}
            disabled={!streaming || !!error}
            fullWidth
            size="lg"
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            }
          >
            Take Photo
          </Button>

          <Button
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            fullWidth
            size="lg"
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            }
          >
            Upload Photo
          </Button>

          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
        </div>
      </footer>
    </div>
      </RoleGuard>
  );
};

export default Camera;
