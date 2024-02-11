import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PageWrapper from "./components/utils/PageWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: process.env.METADATA_TITLE,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PageWrapper>{children}</PageWrapper>
      </body>
    </html>
  );
}
