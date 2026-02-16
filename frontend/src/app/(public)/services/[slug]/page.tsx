import { Metadata } from "next";
import ProductDetailClient from "./ProductDetailClient";
import { getProductBySlug } from "@/lib/api";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const response = await getProductBySlug(slug);

  if (!response.success || !response.data) {
    return {
      title: "Product Not Found | EnStore",
      description: "The product you are looking for does not exist.",
    };
  }

  const product = response.data;
  return {
    title: `${product.name} | EnStore - Direct Top-Up`,
    description: `Top-up ${product.name} instantly on EnStore. Safe, secure, and reliable game services with the best prices.`,
    openGraph: {
      title: `${product.name} | EnStore`,
      description: `Get the best deals on ${product.name} top-ups. Instant processing and 24/7 support.`,
      images: [
        {
          url: product.image || "/assets/logo.png",
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | EnStore`,
      description: `Cheap and fast ${product.name} top-ups starting now!`,
      images: [product.image || "/assets/logo.png"],
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <ProductDetailClient slug={slug} />;
}
