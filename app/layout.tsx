import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";
import Script from "next/script";

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
      <body className={`${lexend.className} text-maintext antialiased`}>
        {children}
      </body>
      <Script src="https://scripts.simpleanalyticscdn.com/latest.js" />
    </html>
  );
}
