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
  description: "Mon portfolio",
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
