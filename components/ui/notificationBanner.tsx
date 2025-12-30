"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";

export default function NotificationBanner({
  show,
  onCloseAction,
  duration = 2500,
  message = "Changes saved",
  className,
  variant = "success",
}: {
  /** Controls visibility */
  show: boolean;
  /** Called after the banner auto-hides (optional) */
  onCloseAction?: () => void;
  /** Auto-hide after N ms (default 2500) */
  duration?: number;
  /** Message to display */
  message?: string;
  /** Extra classes to customize the panel */
  className?: string;
  /** Optional style variant */
  variant?: "success" | "info" | "warning" | "error";
}) {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    setVisible(show);
    if (show) {
      const id = setTimeout(() => {
        setVisible(false);
        onCloseAction?.(); // ← same semantics as your old onHide
      }, duration);
      return () => clearTimeout(id);
    }
  }, [show, duration, onCloseAction]);

  const palette: Record<NonNullable<typeof variant>, { container: string }> = {
    success: {
      container: "bg-emerald-50 text-emerald-800 border-emerald-200",
    },
    info: {
      container: "bg-blue-50 text-blue-800 border-blue-200",
    },
    warning: {
      container: "bg-amber-50 text-amber-900 border-amber-200",
    },
    error: {
      container: "bg-rose-50 text-rose-800 border-rose-200",
    },
  };

  return (
    <div
      className={clsx(
        "fixed top-0 left-0 right-0 z-50 flex justify-center",
        "pointer-events-none",
        "transition-all duration-200",
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2",
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        className={clsx(
          "mx-3 mt-3 w-fit rounded-md border px-4 py-2 shadow-sm",
          palette[variant].container,
          "pointer-events-auto",
          className,
        )}
        role="status"
      >
        {message}
      </div>
    </div>
  );
}
