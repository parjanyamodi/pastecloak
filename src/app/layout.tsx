import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PageWrapper from "./components/utils/PageWrapper";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "PasteCloak — Encrypted Pastebin",
  description: "Share secrets securely with end-to-end encryption",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <PageWrapper>{children}</PageWrapper>
      </body>
    </html>
  );
}
