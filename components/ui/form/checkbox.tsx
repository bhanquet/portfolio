import React, { forwardRef, useRef } from "react";
import clsx from "clsx";

export interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "size"
> {
  label?: React.ReactNode;
  /** Extra classes to tweak the visible box */
  boxClassName?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, disabled, className = "", boxClassName = "", ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);

    // Forward the inner input ref
    React.useImperativeHandle(
      ref,
      () => inputRef.current as HTMLInputElement,
      [],
    );

    return (
      <label
        className={clsx(
          "group inline-flex items-center gap-2 select-none",
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        )}
      >
        {/* Native input (visually hidden, semantic & focusable) */}
        <input
          ref={inputRef}
          type="checkbox"
          disabled={disabled}
          className={clsx("peer sr-only", className)}
          {...props}
          aria-label={typeof label === "string" ? label : undefined}
        />

        {/* Visual box (drives its children via arbitrary selectors) */}
        <span
          className={clsx(
            "relative grid place-items-center w-5 h-5 rounded-md border transition shadow-sm",
            "border-slate-300 bg-white dark:bg-slate-900 dark:border-slate-600",
            // Checked styles
            "peer-checked:bg-slate-700 peer-checked:border-slate-700",
            // Focus-visible (keyboard)
            "peer-focus-visible:outline peer-focus-visible:outline-offset-2 peer-focus-visible:outline-slate-500",
            // Hover/active feedback when not disabled
            !disabled &&
              "group-hover:shadow-md motion-safe:group-active:scale-[0.98]",
            // ✅ Show the check icon when checked
            "peer-checked:[&>svg]:opacity-100 peer-checked:[&>svg]:scale-100",
            boxClassName,
          )}
          aria-hidden="true"
        >
          {/* Check icon */}
          <svg
            className="pointer-events-none h-3.5 w-3.5 text-white opacity-0 scale-75 transition"
            viewBox="0 0 20 20"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth={1}
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </span>

        {label && (
          <span className="text-sm text-slate-800 dark:text-slate-100">
            {label}
          </span>
        )}
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";
export default Checkbox;
