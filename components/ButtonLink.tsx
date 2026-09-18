import type { ReactNode } from "react";

export function ButtonLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost" | "outline";
}) {
  return (
    <a className={`button button--${variant}`} href={href}>
      <span>{children}</span>
      <span aria-hidden="true">↗</span>
    </a>
  );
}
