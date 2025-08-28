import { OrderResponse } from "@/core/types/orders.types";
import { create } from "zustand";

interface AdminPaymentState {
  selectedTransactionId: string | null;
  selectedTransaction: OrderResponse | null;
  paymentProofImage: File | Blob | null;
  setSelectedTransactionId: (id: string | null) => void;
  setSelectedTransaction: (transaction: OrderResponse | null) => void;
  setPaymentProofImage: (image: File | Blob | null) => void;
  reset: () => void;
}

export const useAdminPaymentStore = create<AdminPaymentState>(set => ({
  selectedTransactionId: null,
  selectedTransaction: null,
  paymentProofImage: null,
  setSelectedTransactionId: id => set({ selectedTransactionId: id }),
  setSelectedTransaction: transaction => set({ selectedTransaction: transaction }),
  setPaymentProofImage: image => set({ paymentProofImage: image }),
  reset: () =>
    set({
      selectedTransactionId: null,
      selectedTransaction: null,
      paymentProofImage: null,
    }),
}));
