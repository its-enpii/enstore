import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

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
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-cloud-200 font-sans antialiased">
        <Header />
        <main className="h-full min-h-screen w-full pt-16 lg:pt-[88px]">{children}</main>
        <Footer />
        <Toaster position="top-center" reverseOrder={false} />
      </body>
    </html>
  );
}
