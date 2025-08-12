"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { NextPage } from "next";
import { CheckCircleIcon, EyeIcon, HomeIcon } from "@heroicons/react/24/outline";
import { Badge, Button, Card, CardBody } from "~~/components/kibo";

const PaymentInformation: NextPage = () => {
  const router = useRouter();

  const handleViewTransactions = useCallback(() => {
    router.push("/movements");
  }, [router]);

  const handleGoHome = useCallback(() => {
    router.push("/");
  }, [router]);

  return (
    <div className="kibo-container min-h-[80vh] flex justify-center items-center">
      <div className="max-w-md w-full">
        <Card shadow="lg" className="text-center">
          <CardBody className="p-8">
            {/* Success Icon and Animation */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 flex items-center justify-center">
                  <CheckCircleIcon className="w-16 h-16 text-green-500" />
                </div>
              </div>
            </div>

            {/* Success Message */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <h1 className="text-2xl font-bold text-green-600 dark:text-green-400">Payment Submitted</h1>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-lg">
                Your transaction has been recorded and is being processed.
              </p>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mt-4">
                <p className="text-sm text-green-700 dark:text-green-300">
                  Track your payment status in transaction history
                </p>
              </div>
            </div>

            {/* Transaction Details */}
            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Transaction Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">Status:</span>
                  <Badge variant="warning" size="sm">
                    Processing
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">Transaction ID:</span>
                  <span className="font-mono text-xs text-neutral-500">#TX{Date.now().toString().slice(-8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">Submitted:</span>
                  <span>{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                variant="primary"
                onClick={handleViewTransactions}
                fullWidth
                size="lg"
                leftIcon={<EyeIcon className="w-5 h-5" />}
              >
                View Transaction History
              </Button>

              <Button
                variant="secondary"
                onClick={handleGoHome}
                fullWidth
                size="lg"
                leftIcon={<HomeIcon className="w-5 h-5" />}
              >
                Return to Home
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default PaymentInformation;
