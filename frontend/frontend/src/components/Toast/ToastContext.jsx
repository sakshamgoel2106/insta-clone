import { createContext, useContext, useState, useCallback } from "react";

export const ToastContext = createContext(null);

let _id = 0;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback(({ message, type = "info", duration = 4000 }) => {
        const id = ++_id;
        setToasts((prev) => [...prev, { id, message, type, duration }]);
        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    // Convenience wrappers
    const toast = {
        success: (message, duration) => addToast({ message, type: "success", duration }),
        error:   (message, duration) => addToast({ message, type: "error",   duration }),
        warning: (message, duration) => addToast({ message, type: "warning", duration }),
        info:    (message, duration) => addToast({ message, type: "info",    duration }),
    };

    return (
        <ToastContext.Provider value={{ toast, toasts, removeToast }}>
            {children}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
    return ctx.toast;
}
