import { create } from "zustand";

type PaymentState = {
  imageBase64: string | null;
  amount: number | null;
  setImageBase64: (img: string) => void;
  setAmount: (amt: number | null) => void;
  reset: () => void;
};

export const usePaymentStore = create<PaymentState>(set => ({
  imageBase64: null,
  amount: null,
  setImageBase64: img => set({ imageBase64: img }),
  setAmount: amt => set({ amount: amt }),
  reset: () => set({ imageBase64: null, amount: null }),
}));
