"use client";

import { useLocale } from "next-intl";

export function BlogDate({ date }: { date: Date | string }) {
  const locale = useLocale();
  const bcp47 = locale === "fr" ? "fr-FR" : "en-US";
  const d = typeof date === "string" ? new Date(date) : date;
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  };
  return (
    <time dateTime={d.toISOString()}>
      {d.toLocaleDateString(bcp47, options)}
    </time>
  );
}
