// App.tsx
import { ToastProvider, useToast } from "./components/ui/toast/ToastContext";

function DemoToasts() {
  const { addToast } = useToast();
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button onClick={() => addToast("Saved successfully", { variant: "success" })}>Success</button>
      <button onClick={() => addToast("Failed to save", { variant: "error" })}>Error</button>
      <button onClick={() => addToast("Check your input", { variant: "warning" })}>Warning</button>
      <button onClick={() => addToast("Welcome back!", { variant: "info" })}>Info</button>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider position="top-right">
      <DemoToasts />
      {/* rest of your app */}
    </ToastProvider>
  );
}
