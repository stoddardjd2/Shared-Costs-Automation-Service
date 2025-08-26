import { useEffect, useRef, useState } from "react";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * AsyncButton
 * Props:
 * - onAction: () => Promise<any>   // your async function; throw on error
 * - className?: string             // tailwind/classes for styling
 * - disabled?: boolean
 * - minLoaderMs?: number           // minimum spinner time (default 1000ms)
 * - successDurationMs?: number     // how long to show success state (default 1000ms)
 * - showSuccess?: boolean          // flash success state (default true)
 * - showError?: boolean            // flash error state (default true)
 * - loadingLabel?: string | node
 * - successLabel?: string | node
 * - errorLabel?: string | node
 * - startIcon?: ReactNode
 * - LoadingIcon?: Component        // defaults to Loader2 (spins)
 * - SuccessIcon?: Component        // defaults to CheckCircle
 * - ErrorIcon?: Component          // defaults to AlertCircle
 * - afterSuccess?: (result) => void
 * - afterError?: (err) => void
 * - type?: "button" | "submit" | "reset"
 * - children: string | node        // label when idle
 */
export default function AsyncButton({
  onAction,
  className = "",
  disabled = false,
  minLoaderMs = 1000,
  successDurationMs = 1000,
  showSuccess = true,
  showError = true,
  loadingLabel,
  successLabel,
  errorLabel,
  startIcon = null,
  LoadingIcon = Loader2,
  SuccessIcon = CheckCircle,
  ErrorIcon = AlertCircle,
  afterSuccess,
  afterError,
  type = "button",
  children,
  ...props
}) {
  const [state, setState] = useState("idle"); // idle | loading | success | error
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleClick = async (e) => {
    if (disabled || state === "loading") return;
    setState("loading");
    const started = Date.now();

    try {
      const result = await onAction?.(e);

      // enforce minimum loader time
      const elapsed = Date.now() - started;
      if (elapsed < minLoaderMs) await sleep(minLoaderMs - elapsed);

      if (!mountedRef.current) return;

      if (showSuccess) {
        setState("success");
        if (successDurationMs > 0) await sleep(successDurationMs);
      }

      if (!mountedRef.current) return;
      setState("idle");
      afterSuccess?.(result);
    } catch (err) {
      const elapsed = Date.now() - started;
      if (elapsed < minLoaderMs) await sleep(minLoaderMs - elapsed);

      if (!mountedRef.current) return;

      if (showError) {
        setState("error");
        // brief error flash (reuse successDurationMs for symmetry)
        if (successDurationMs > 0)
          await sleep(Math.min(successDurationMs, 1200));
      }

      if (!mountedRef.current) return;
      setState("idle");
      afterError?.(err);
    }
  };

  const isLoading = state === "loading";
  const isSuccess = state === "success";
  const isError = state === "error";

  let content;
  if (isLoading) {
    content = (
      <>
        <LoadingIcon className="w-4 h-4 animate-spin" aria-hidden="true" />
        {loadingLabel ?? children}
      </>
    );
  } else if (isSuccess) {
    content = (
      <>
        <SuccessIcon className="w-4 h-4" aria-hidden="true" />
        {successLabel ?? children}
      </>
    );
  } else if (isError) {
    content = (
      <>
        <ErrorIcon className="w-4 h-4" aria-hidden="true" />
        {errorLabel ?? children}
      </>
    );
  } else {
    content = (
      <>
        {startIcon}
        {children}
      </>
    );
  }

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      aria-busy={isLoading}
      aria-live="polite"
      {...props}
    >
      {content}
    </button>
  );
}
