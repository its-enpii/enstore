import type { Metadata } from "next";
import "./globals.css";

import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";

export const metadata: Metadata = {
  title: "EnStore | The Professional Standard for Game Top-Ups",
  description:
    "EnStore is a professional platform for game top-ups, providing fast, secure, and reliable services for gamers worldwide.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cloud-200 antialiased">
        <Header />
        <main className="h-full min-h-screen w-full pt-[88px]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
