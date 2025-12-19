
export type ToastVariant = "success" | "error" | "warning" | "info";
export type ToastPosition = "top-right" | "top-left" | "bottom-right" | "bottom-left";

export type ToastItem = {
  id: string;
  message: React.ReactNode;
  variant?: ToastVariant;
  duration?: number; // ms; if omitted, falls back to CSS var or default
};
