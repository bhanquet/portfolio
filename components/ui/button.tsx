import Link from "next/link";
import { ReactNode } from "react";
import clsx from "clsx";
import { ExternalLink } from "lucide-react";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "default";
  className?: string;
  onClick?: (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => void | Promise<void>;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
};

export default function Button({
  children,
  href,
  variant = "primary",
  className,
  onClick,
  type = "button",
  disabled = false,
}: ButtonProps) {
  const classes = clsx(
    "rounded-md py-2 px-4 shadow-md inline-block transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
    {
      "bg-accent hover:bg-accent-dark text-white": variant === "primary",
      "bg-muted hover:bg-surface-2 text-text border border-text/10":
        variant !== "primary",
    },
    disabled && "pointer-events-none opacity-60",
    className,
  );

  if (href) {
    const isExternal = /^https?:\/\//.test(href);

    if (isExternal) {
      return (
        <a
          href={href}
          className={classes}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="inline-flex items-center gap-2">
            <ExternalLink size={16} />
            {children}
          </span>
        </a>
      );
    }

    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} onClick={onClick} type={type} disabled={disabled}>
      {children}
    </button>
  );
}
