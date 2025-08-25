"use client";

import {useCallback, useEffect, useMemo, useState} from "react";
import Image from "next/image";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {NextPage} from "next";
import {ArrowLeftIcon, ExclamationTriangleIcon} from "@heroicons/react/24/outline";
import {
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
import {usePaymentStore} from "~~/services/store/payment-store";
import {useQuote} from "~~/hooks/quote/useQuote";
import {QuoteRequest} from "@/core/types/quote.types";
import { useCreateOrder } from "~~/hooks/orders/useCreateOrder";
import {CreateOrderRequest} from "@/core/types/orders.types";
// import { useAuth } from "~~/hooks/api/useAuth";

// TODO: Replace mocks with real implementations
// Mock de useAuth
const useAuth = () => ({
    userProfile: {privyId: "mock-user-id"},
});

const COUNTDOWN_DURATION = 61;


/**
 * Circular countdown component with clock sweep effect
 * Shows remaining time with visual progress indicator
 */
interface CircularCountdownProps {
    seconds: number;
    maxSeconds: number;
}

const CircularCountdown: React.FC<CircularCountdownProps> = ({seconds, maxSeconds}) => {
    const progress = Math.max(0, Math.min(100, (seconds / maxSeconds) * 100));
    const sweepAngle = (progress / 100) * 360;

    // Consistent emerald color for the countdown
    const COUNTDOWN_COLOR = "currentColor";

    const createSweepPath = (angle: number): string => {
        const radius = 10;
        const centerX = 12;
        const centerY = 12;

        if (angle <= 0) return "";

        const clampedAngle = Math.min(360, angle);
        const endAngle = (clampedAngle - 90) * (Math.PI / 180);
        const endX = centerX + radius * Math.cos(endAngle);
        const endY = centerY + radius * Math.sin(endAngle);

        const largeArcFlag = clampedAngle > 180 ? 1 : 0;

        return `M ${centerX} ${centerY} L ${centerX} ${centerY - radius} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
    };

    return (
        <div className="flex items-center space-x-2">
            <svg className="w-6 h-6 opacity-50" viewBox="0 0 24 24">
                {/* Background circle */}
                <circle cx="12" cy="12" r="10" fill="transparent" className="text-neutral-300 dark:text-neutral-600"/>
                {/* Sweep fill */}
                <path
                    d={createSweepPath(sweepAngle)}
                    fill={COUNTDOWN_COLOR}
                    className="transition-all duration-1000 ease-linear"
                />
            </svg>
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 min-w-8">{seconds}s</span>
        </div>
    );
};

// Obtener el ID del usuario autenticado
const ConfirmationPayment: NextPage = () => {
    const {imageBase64: qrImageBase64} = usePaymentStore();
    const router = useRouter();
    // Obtener el ID del usuario autenticado
    const {userProfile} = useAuth();

    const createOrderMutation = useCreateOrder();

    const [showQrModal, setShowQrModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [seconds, setSeconds] = useState(COUNTDOWN_DURATION);

    const [recipient, setRecipient] = useState("");
    const [description, setDescription] = useState("");
    const [fiatAmount, setFiatAmount] = useState<number>(0);

    const quoteRequest: QuoteRequest = useMemo(() => ({
        fiatAmount: fiatAmount,
        fiatCurrency: "BOB",
        cryptoCurrency: "USDT",
        network: "mantle"
    }), [fiatAmount]);

    const {
        data: quoteData,
        isLoading: isLoadingQuote,
        error: quoteError,
        refetch: refetchQuote,
        isFetching
    } = useQuote(quoteRequest, {
        enabled: fiatAmount >=10
    });


    const handlePayClick = useCallback(() => {
        setShowConfirmModal(true);
    }, []);

    const cryptoEquivalent = useMemo(() => {
        if (quoteData?.success && quoteData.data) {
            return quoteData.data.cryptoAmount;
        }
        return 0;
    }, [quoteData]);

    const exchangeRate = useMemo(() => {
        if (quoteData?.success && quoteData.data) {
            return quoteData.data.rate;
        }
        return 0;
    }, [quoteData]);

    const base64ToFile = useCallback((base64String: string, filename: string): File => {
        const arr = base64String.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    }, []);

    const handleConfirmPayment = useCallback(async () => {
        setShowConfirmModal(false);

        try {
            if (!qrImageBase64) {
                alert("Error: not found qr image");
                return;
            }
            const qrImageFile = base64ToFile(qrImageBase64, 'qr-code.jpg');

            const createOrderRequest: CreateOrderRequest = {
                fiatAmount: fiatAmount,
                cryptoAmount: cryptoEquivalent,
                recipient: recipient,
                description: description,
                qrImage: qrImageFile
            };
            const result = await createOrderMutation.mutateAsync(createOrderRequest);

            if (result.success) {
                console.log("Order created successfully:", result.data);
                router.push("/order/payment-information");
            } else {
                console.error("Failed to create order:", result.error);
                alert(`Error al crear la orden: ${result.error?.message || 'Error desconocido'}`);
            }
        } catch (error) {
            console.error("Error creating order:", error);
            alert("Error al crear la orden. Por favor, intenta nuevamente.");
        }
    }, [router, fiatAmount, cryptoEquivalent, recipient, description, qrImageBase64, base64ToFile, createOrderMutation, userProfile.privyId]);

    const handleCancelPayment = useCallback(() => {
        setShowConfirmModal(false);
    }, []);

    const handleFiatAmountChange = useCallback((value: string) => {
        const numValue = parseFloat(value);
        setFiatAmount(isNaN(numValue) || numValue < 0 ? 0 : numValue);
    }, []);

    const toggleQrModal = useCallback(() => {
        setShowQrModal(prev => !prev);
    }, []);

    const handleManualRefetch = useCallback(async () => {
        if (fiatAmount >=10) {
            await refetchQuote();
        }
    }, [fiatAmount, refetchQuote]);

    useEffect(() => {
        const timer = setInterval(() => {
            setSeconds(prev => {
                if (prev <= 1) {
                    setTimeout(() => {
                        handleManualRefetch();
                    }, 100);
                    return COUNTDOWN_DURATION;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [handleManualRefetch]);


    useEffect(() => {
        if (fiatAmount >= 10) {
            setSeconds(COUNTDOWN_DURATION);
        }
    }, [fiatAmount]);

    useEffect(() => {
        if (createOrderMutation.error) {
            alert(`Error: ${createOrderMutation.error.message}`);
        }
    }, [createOrderMutation.error]);

    useEffect(() => {
        if (quoteError) {
            console.error('Quote error:', quoteError);
        }
    }, [quoteError]);

    return (
        <div className="md:mx-auto md:min-w-md px-4">
            <div className="kibo-page-header mb-6">
                <div className="flex items-center gap-3">
                    <Link href="/order/camera" className="flex items-center">
                        <ArrowLeftIcon
                            className="w-6 h-6 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"/>
                    </Link>
                    <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Payment
                        Confirmation</h1>
                </div>
            </div>

            <div className="kibo-section-spacing">
                {/* Payment Details Form */}
                <Card>
                    <CardBody>
                        <CardTitle className="mb-4 flex items-center justify-between">
                            <span>Transaction Details</span>
                            <button
                                onClick={toggleQrModal}
                                disabled={!qrImageBase64}
                                className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title={qrImageBase64 ? "View QR Code" : "No QR code available"}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <rect x="3" y="3" width="6" height="6" rx="1" stroke="currentColor"
                                          strokeWidth="1.5"/>
                                    <rect x="15" y="3" width="6" height="6" rx="1" stroke="currentColor"
                                          strokeWidth="1.5"/>
                                    <rect x="3" y="15" width="6" height="6" rx="1" stroke="currentColor"
                                          strokeWidth="1.5"/>
                                    <path
                                        d="M15 15h2v2h-2zM19 19h2v2h-2zM15 19h2v2h-2zM19 15h2v2h-2z"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                    />
                                </svg>
                            </button>
                        </CardTitle>
                        <div className="space-y-4">
                            <div>
                                <label
                                    className="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                                    Recipient
                                </label>
                                <Input
                                    type="text"
                                    value={recipient}
                                    onChange={e => setRecipient(e.target.value)}
                                    placeholder="Enter recipient name"
                                    fullWidth
                                />
                            </div>

                            <div>
                                <label
                                    className="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                                    Description
                                </label>
                                <Input
                                    type="text"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Enter payment description"
                                    fullWidth
                                />
                            </div>

                            <div>
                                <label
                                    className="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                                    Amount (Bs)
                                </label>
                                <Input
                                    type="number"
                                    value={fiatAmount}
                                    onChange={e => handleFiatAmountChange(e.target.value)}
                                    placeholder="Enter amount in Bs"
                                    min="0"
                                    step="0.01"
                                    fullWidth
                                    leftIcon={<span className="text-neutral-500 font-medium">Bs</span>}
                                />
                            </div>

                            <div className="py-3">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                        {(isLoadingQuote || isFetching) && fiatAmount > 0 ? (
                                            <div className="flex items-center space-x-2">
                                                <div
                                                    className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
                                                <span className="text-sm text-neutral-500">Calculating...</span>
                                            </div>
                                        ) : (
                                            <>
                        <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                          {cryptoEquivalent.toFixed(2)}
                        </span>
                                                <span
                                                    className="text-sm font-medium text-neutral-600 dark:text-neutral-400">USDT</span>
                                                {quoteError && (
                                                    <span className="text-xs text-red-500"
                                                          title="Error getting latest rate">❌</span>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    <CircularCountdown seconds={seconds} maxSeconds={COUNTDOWN_DURATION}/>
                                </div>
                                <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                    {exchangeRate > 0 ? (
                                        <>1 USDT ≈ {exchangeRate.toFixed(2)} Bs</>
                                    ) : fiatAmount > 0 ? (
                                        <>Loading exchange rate...</>
                                    ) : (
                                        <>Enter amount to see rate</>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>


                {/* Pay Button */}
                <Button
                    variant="primary"
                    onClick={handlePayClick}
                    disabled={
                        !fiatAmount ||
                        fiatAmount <= 0 ||
                        !recipient.trim() ||
                        createOrderMutation.isPending ||
                        isLoadingQuote ||
                        !quoteData ||
                        !qrImageBase64
                    }
                    fullWidth
                    size="lg"
                    leftIcon={
                        createOrderMutation.isPending ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                        )
                    }
                >
                    {createOrderMutation.isPending ? "Creating Order..." : "Confirm Payment"}
                </Button>

                {quoteError && fiatAmount > 0 && (
                    <div className="text-center text-sm text-red-600 dark:text-red-400 mt-2">
                        Unable to get current rate. Please try again.
                        <button
                            onClick={handleManualRefetch}
                            className="ml-2 underline hover:no-underline"
                            disabled={isFetching}
                        >
                            {isFetching ? "Retrying..." : "Retry"}
                        </button>
                    </div>
                )}

                {/* Confirmation Modal */}
                <Modal open={showConfirmModal} onClose={handleCancelPayment}>
                    <ModalHeader onClose={handleCancelPayment}>
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400"/>
                            </div>
                            <h3 className="text-lg font-semibold">Confirm Payment</h3>
                        </div>
                    </ModalHeader>
                    <ModalBody>
                        <div className="text-center space-y-4">
                            <p className="text-neutral-600 dark:text-neutral-400">
                                Are you sure you want to proceed with this payment?
                            </p>
                            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-neutral-600 dark:text-neutral-400">To:</span>
                                    <span className="font-medium">{recipient}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Description:</span>
                                    <span className="font-medium text-right max-w-48 truncate">{description}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Amount:</span>
                                    <span className="font-bold">{fiatAmount} Bs</span>
                                </div>
                                <div
                                    className="flex justify-between pt-2 border-t border-neutral-200 dark:border-neutral-700">
                                    <span
                                        className="text-sm text-neutral-600 dark:text-neutral-400">Crypto Amount:</span>
                                    <span className="font-bold text-green-600 dark:text-green-400">
                    {cryptoEquivalent.toFixed(4)} USDT
                  </span>
                                </div>
                                {exchangeRate > 0 && (
                                    <div className="flex justify-between">
                                        <span
                                            className="text-sm text-neutral-600 dark:text-neutral-400">Exchange Rate:</span>
                                        <span className="text-sm">1 USDT = {exchangeRate.toFixed(2)} Bs</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="secondary" onClick={handleCancelPayment} disabled={createOrderMutation.isPending}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleConfirmPayment} disabled={createOrderMutation.isPending}>
                            {createOrderMutation.isPending ? "Creating..." : "Confirm Payment"}
                        </Button>
                    </ModalFooter>
                </Modal>
            </div>
            {/* QR Code Preview Modal */}
            <Modal open={showQrModal && !!qrImageBase64} onClose={toggleQrModal}>
                <ModalHeader onClose={toggleQrModal}>
                    <h3 className="text-lg font-semibold">QR Code Preview</h3>
                </ModalHeader>
                <ModalBody>
                    <div className="text-center">
                        {qrImageBase64 && (
                            <Image
                                src={qrImageBase64}
                                alt="Captured QR Code"
                                width={400}
                                height={400}
                                className="rounded-lg max-w-full max-h-[60vh] object-contain mx-auto"
                                unoptimized
                            />
                        )}
                    </div>
                </ModalBody>
                <ModalFooter justify="center">
                    <Button variant="primary" onClick={toggleQrModal}>
                        Close
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default ConfirmationPayment;