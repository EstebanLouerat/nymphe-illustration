import { useEffect, useRef, useState } from "react";
import { useStore } from "../services/store";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";
import "./ToastStack.css";

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

function Toast({ toast, onDismiss }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const Icon = ICONS[toast.type] || Info;

  // Entrée
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const handleDismiss = () => {
    setLeaving(true);
    setTimeout(() => onDismiss(toast.id), 320);
  };

  return (
    <div
      className={`toast toast--${toast.type} ${visible ? "toast--visible" : ""} ${leaving ? "toast--leaving" : ""}`}
      role="alert"
      aria-live={toast.type === "error" ? "assertive" : "polite"}
    >
      <div className="toast__icon">
        <Icon size={16} strokeWidth={2} />
      </div>
      <p className="toast__message">{toast.message}</p>
      <button
        className="toast__close"
        onClick={handleDismiss}
        aria-label="Fermer"
      >
        <X size={13} strokeWidth={2.5} />
      </button>
      <div className="toast__progress" />
    </div>
  );
}

function ToastStack() {
  const { toasts, dismissToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-stack" aria-label="Notifications">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  );
}

export default ToastStack;
