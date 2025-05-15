import Link from "next/link";
import { ReactNode } from "react";
import ExternalLinkIcon from "./icons/external-link-icon";

export default function Button({
  children,
  href,
  variant = "primary",
  className = "",
  onClick,
}: {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "secondary";
  className?: string;
  onClick?: (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => void | Promise<void>;
}) {
  const baseStyle = "rounded-md py-2 px-4 shadow-md";
  const variantStyle =
    variant === "primary"
      ? "bg-[#061e36] hover:bg-[#041729] text-white "
      : "bg-[#dedede] hover:bg-[#C9C9C9]";
  const combinedClassName = `${baseStyle} ${variantStyle} ${className}`.trim();

  if (href) {
    const isExternal =
      href.startsWith("http://") || href.startsWith("https://");

    return isExternal ? (
      <>
        <a
          href={href}
          className={combinedClassName}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "flex", alignItems: "center" }}
        >
          <span className="mr-2">
            <ExternalLinkIcon size={16} />
          </span>
          {children}
        </a>
      </>
    ) : (
      <Link className={combinedClassName} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button className={combinedClassName} onClick={onClick}>
      {children}
    </button>
  );
}
