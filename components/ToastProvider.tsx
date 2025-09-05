import { Toaster } from "react-hot-toast";

const ToastProvider = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: "8px",
          fontSize: "14px",
        },
        success: {
          style: {
            background: "#10b981",
            color: "#fff",
          },
        },
        error: {
          style: {
            background: "#ef4444",
            color: "#fff",
          },
        },
      }}
    />
  );
};

export default ToastProvider;
