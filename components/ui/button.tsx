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
};

export default function Button({
  children,
  href,
  variant = "primary",
  className,
  onClick,
}: ButtonProps) {
  const classes = clsx(
    "rounded-md py-2 px-4 shadow-md inline-block transition-colors",
    {
      "bg-strongcolor hover:bg-[#0c6da6] text-white": variant === "primary",
      "bg-[#dedede] hover:bg-[#C9C9C9] text-black": variant !== "primary",
    },
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
    <button className={classes} onClick={onClick}>
      {children}
    </button>
  );
}
