"use client";

import { useState, useCallback } from "react";
import { usePrivy, useLogout, useLogin } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { Badge } from "~~/components/kibo";
import { useAuthStore } from "~~/services/store/auth-store.";

import {
  WalletIcon,
  ArrowRightOnRectangleIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface LoginButtonProps {
  className?: string;
}

export const LoginButton = ({ className = "" }: LoginButtonProps) => {
  const { authenticated, user, ready } = usePrivy();
  const { logout } = useLogout();
  const { login } = useLogin();
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const handleLogout = useCallback(() => {
    logout();
    setShowModal(false);
    useAuthStore.getState().reset();

    router.push("/login");
  }, [logout]);

  const handleLogin = useCallback(() => {
    login();
  }, [login]);

  const copyToClipboard = useCallback(async () => {
    if (user?.wallet?.address) {
      try {
        await navigator.clipboard.writeText(user.wallet.address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
      } catch (err) {
        console.error("Failed to copy address:", err);
      }
    }
  }, [user?.wallet?.address]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}••••${address.slice(-4)}`;
  };

  const handleModalClose = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleModalClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  if (!ready) {
    return null;
  }

  if (!authenticated) {
    return (
      <Badge
        variant="info"
        size="sm"
        className={`bg-white/5 text-white hover:bg-white/20 cursor-pointer transition-all duration-200 py-2 px-3 flex items-center gap-2 ${className}`}
        onClick={handleLogin}
      >
        <WalletIcon className="size-4" />
        Connect Wallet
      </Badge>
    );
  }

  return (
    <>
      <Badge
        variant="info"
        size="sm"
        className={`bg-green-500/20 text-green-200 hover:bg-green-500/30 cursor-pointer transition-all duration-200 py-2 px-3 flex items-center gap-2 ${className}`}
        onClick={() => setShowModal(true)}
      >
        <WalletIcon className="size-4" />
        {user?.wallet?.address
          ? formatAddress(user.wallet.address)
          : "Connected"}
      </Badge>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleModalClose}
        >
          <div
            className="bg-neutral-900 rounded-2xl shadow-xl max-w-sm w-full p-6 relative"
            onClick={handleModalClick}
          >
            {/* Close Button */}
            <button
              onClick={handleModalClose}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors duration-200"
            >
              <XMarkIcon className="size-6" />
            </button>

            <div className="text-center">
              {/* Title */}
              <h3 className="text-xl font-semibold text-white mb-6">
                Connected
              </h3>

              {/* Wallet Avatar */}
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-green-500 rounded-full flex items-center justify-center mx-auto relative">
                  <WalletIcon className="size-10 text-white" />
                  {/* Network Badge */}
                  <div className="absolute -bottom-1 -right-1 bg-gray-700 rounded-full p-1">
                    <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Wallet Address */}
              {user?.wallet?.address && (
                <div className="flex items-center justify-center gap-2 mb-3">
                  <p className="text-white text-sm font-mono">
                    {formatAddress(user.wallet.address)}
                  </p>
                  <button
                    onClick={copyToClipboard}
                    className={`p-1 rounded transition-all duration-200 ${
                      copied
                        ? "text-green-400"
                        : "text-gray-400 hover:text-white"
                    }`}
                    title={copied ? "Copied!" : "Copy address"}
                  >
                    {copied ? (
                      <CheckIcon className="size-4" />
                    ) : (
                      <ClipboardDocumentIcon className="size-4" />
                    )}
                  </button>
                </div>
              )}

              {/* Balance */}
              <p className="text-gray-400 text-sm mb-6">0.00 ETH</p>

              {/* Disconnect Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors duration-200"
              >
                <ArrowRightOnRectangleIcon className="size-5" />
                <span>Disconnect</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
