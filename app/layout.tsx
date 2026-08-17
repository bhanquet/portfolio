import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import Script from "next/script";
import Header from "@/components/shared/header";

const lexend = Lexend({
  subsets: ["latin"],
  fallback: ["system-ui", "arial"],
});

export const metadata: Metadata = {
  title: "Brian Hanquet",
  description:
    "I create simple, fast, and beautiful websites that are easy to use.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
      className={`${lexend.className} text-text antialiased bg-background pt-[var(--header-offset)]`}
      style={{ ["--header-offset" as string]: "68px" }}
    >
        <Suspense fallback={null}>
          <Header />
        </Suspense>
        {children}
      </body>
      <Script src="https://scripts.simpleanalyticscdn.com/latest.js" />
    </html>
  );
}
