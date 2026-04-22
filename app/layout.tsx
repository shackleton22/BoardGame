import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";

import { AnalyticsScripts } from "@/components/shared/analytics-scripts";
import { APP_NAME } from "@/lib/constants";
import { getSupportEmail } from "@/lib/env";
import "./globals.css";

const headingFont = Cormorant_Garamond({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const bodyFont = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "Turn your life, relationship, family, or friend group into a custom board game gift.",
  metadataBase: new URL("http://localhost:3000"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supportEmail = getSupportEmail();

  return (
    <html
      lang="en"
      className={`${headingFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <AnalyticsScripts />
        {children}
        <div className="sr-only" aria-hidden="true">
          {supportEmail}
        </div>
      </body>
    </html>
  );
}
