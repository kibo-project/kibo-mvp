import { create } from "zustand";

interface Transaction {
  id: string;
  mainAmount: string;
  secondaryAmount: string;
  date: string;
  userInfo: string;
  cryptoAmount: number;
  fiatAmount: number;
  cryptoCurrency: string;
  fiatCurrency: string;
  qrImageUrl?: string;
  description?: string;
  recipient?: string;
}

interface AdminPaymentState {
  selectedTransactionId: string | null;
  selectedTransaction: Transaction | null;
  paymentProofImage: File | Blob | null;
  setSelectedTransactionId: (id: string | null) => void;
  setSelectedTransaction: (transaction: Transaction | null) => void;
  setPaymentProofImage: (image: File | Blob | null) => void;
  reset: () => void;
}

export const useAdminPaymentStore = create<AdminPaymentState>((set) => ({
  selectedTransactionId: null,
  selectedTransaction: null,
  paymentProofImage: null,
  setSelectedTransactionId: (id) => set({ selectedTransactionId: id }),
  setSelectedTransaction: (transaction) => set({ selectedTransaction: transaction }),
  setPaymentProofImage: (image) => set({ paymentProofImage: image }),
  reset: () => set({
    selectedTransactionId: null,
    selectedTransaction: null,
    paymentProofImage: null
  }),
}));