import { create } from "zustand";

type PaymentState = {
  qrImage: File | null;
  qrImageBase64: string | null;
  amount: number | null;
  setQrImage: (image: File | null) => void;
  setQrImageBase64: (url: string | null) => void;
  setAmount: (amt: number | null) => void;
  reset: () => void;
};

export const usePaymentStore = create<PaymentState>(set => ({
  amount: null,
  qrImage: null,
  qrImageBase64: null,
  setAmount: amt => set({ amount: amt }),
  setQrImage: (image) => set({ qrImage: image }),
  setQrImageBase64: url => set({ qrImageBase64: url }),
  reset: () => set({ amount: null, qrImage: null, qrImageBase64: null }),
}));
