import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[300] flex flex-col gap-3 max-w-sm">
        <AnimatePresence>
          {toasts.map((toast) => {
            const config = {
              success: {
                bg: "bg-emerald-500/15 border-emerald-500/30",
                text: "text-emerald-300",
                icon: <CheckCircle2 size={18} />,
              },
              error: {
                bg: "bg-red-500/15 border-red-500/30",
                text: "text-red-300",
                icon: <AlertTriangle size={18} />,
              },
              info: {
                bg: "bg-blue-500/15 border-blue-500/30",
                text: "text-blue-300",
                icon: <Info size={18} />,
              },
            }[toast.type];

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={`flex items-start gap-3 px-5 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl ${config.bg} ${config.text}`}
              >
                <span className="shrink-0 mt-0.5">{config.icon}</span>
                <p className="text-sm font-bold flex-1">{toast.message}</p>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors opacity-60 hover:opacity-100"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};
