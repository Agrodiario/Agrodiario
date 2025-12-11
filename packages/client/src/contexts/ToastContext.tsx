import React, { createContext, useContext, useState, useCallback } from "react";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextData {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextData | undefined>(undefined);

// ⭐️ Componente visual do Toast (exemplo básico)
const ToastNotification: React.FC<{
  message: ToastMessage;
  onClose: () => void;
}> = ({ message, onClose }) => {
  const baseStyle: React.CSSProperties = {
    padding: "12px 20px",
    borderRadius: "8px",
    color: "#fff",
    marginBottom: "10px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    transition: "opacity 0.3s, transform 0.3s",
    zIndex: 1000,
  };

  let backgroundColor = "#333";
  if (message.type === "success") backgroundColor = "#008542";
  if (message.type === "error") backgroundColor = "#dc2626";
  if (message.type === "warning") backgroundColor = "#f59e0b";

  return (
    <div style={{ ...baseStyle, backgroundColor }} onClick={onClose}>
      <span>{message.message}</span>
      <button
        style={{
          background: "none",
          border: "none",
          color: "#fff",
          marginLeft: "10px",
          cursor: "pointer",
        }}
      >
        &times;
      </button>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  let toastId = 0;

  const showToast = useCallback(
    (message: string, type: ToastType = "success", duration: number = 3000) => {
      toastId += 1;
      const newToast: ToastMessage = { id: toastId, message, type };

      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, duration);
    },
    [],
  );

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column-reverse",
        }}
      >
        {toasts.map((toast) => (
          <ToastNotification
            key={toast.id}
            message={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast deve ser usado dentro de um ToastProvider");
  }
  return context;
};
