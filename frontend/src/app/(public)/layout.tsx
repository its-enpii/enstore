
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="h-full bg-cloud-200 min-h-screen w-full pt-16 lg:pt-[88px]">
        {children}
      </main>
      <Footer />
    </>
  );
}
