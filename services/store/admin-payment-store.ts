import { create } from "zustand";

interface AdminPaymentState {
  selectedTransactionId: string | null;
  paymentProofImage: string | null;
  setSelectedTransactionId: (id: string | null) => void;
  setPaymentProofImage: (image: string | null) => void;
  reset: () => void;
}

export const useAdminPaymentStore = create<AdminPaymentState>(set => ({
  selectedTransactionId: null,
  paymentProofImage: null,
  setSelectedTransactionId: id => set({ selectedTransactionId: id }),
  setPaymentProofImage: image => set({ paymentProofImage: image }),
  reset: () => set({ selectedTransactionId: null, paymentProofImage: null }),
}));
