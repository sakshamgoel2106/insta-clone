import { useEffect, useRef, useState } from "react";
import { useContext } from "react";
import { ToastContext } from "./ToastContext.jsx";
import "./Toast.scss";

const ICONS = {
    success: "✅",
    error:   "❌",
    warning: "⚠️",
    info:    "ℹ️",
};

function ToastItem({ toast, onRemove }) {
    const { id, message, type, duration } = toast;
    const [exiting, setExiting] = useState(false);
    const timerRef = useRef(null);

    const dismiss = () => {
        setExiting(true);
        setTimeout(() => onRemove(id), 350);
    };

    useEffect(() => {
        timerRef.current = setTimeout(dismiss, duration);
        return () => clearTimeout(timerRef.current);
    }, []);

    return (
        <div
            className={`toast-item toast-${type} ${exiting ? "toast-exit" : "toast-enter"}`}
            role="alert"
            aria-live="assertive"
        >
            <span className="toast-icon">{ICONS[type]}</span>

            <div className="toast-body">
                <p className="toast-type-label">
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                </p>
                <p className="toast-message">{message}</p>
            </div>

            <button
                className="toast-close"
                onClick={dismiss}
                aria-label="Dismiss notification"
            >
                ✕
            </button>

            {/* Progress bar */}
            <div
                className="toast-progress"
                style={{ animationDuration: `${duration}ms` }}
            />
        </div>
    );
}

export function ToastContainer() {
    const ctx = useContext(ToastContext);
    if (!ctx) return null;
    const { toasts, removeToast } = ctx;

    return (
        <div className="toast-container" aria-label="Notifications">
            {toasts.map((t) => (
                <ToastItem key={t.id} toast={t} onRemove={removeToast} />
            ))}
        </div>
    );
}
