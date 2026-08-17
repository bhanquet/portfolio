"use client";

import { Field, Label, Switch as HeadlessSwitch } from "@headlessui/react";
import clsx from "clsx";

export default function Switch({
  checked,
  onChange,
  onLabel = "Public",
  offLabel = "Draft",
  className,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  onLabel?: string;
  offLabel?: string;
  className?: string;
}) {
  return (
    <Field className={clsx("flex items-center gap-2.5", className)}>
      <HeadlessSwitch
        checked={checked}
        onChange={onChange}
        className={clsx(
          "group relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full",
          "bg-text/15 transition-colors duration-200 ease-in-out data-[checked]:bg-emerald-500",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2",
        )}
      >
        <span className="sr-only">{checked ? onLabel : offLabel}</span>
        <span
          aria-hidden="true"
          className="pointer-events-none inline-block h-4 w-4 translate-x-1 rounded-full bg-white shadow-md transition duration-200 ease-in-out group-data-[checked]:translate-x-6"
        />
      </HeadlessSwitch>
      <Label
        className={clsx(
          "cursor-pointer text-sm font-medium transition-colors",
          checked ? "text-emerald-600" : "text-text-muted",
        )}
      >
        {checked ? onLabel : offLabel}
      </Label>
    </Field>
  );
}
