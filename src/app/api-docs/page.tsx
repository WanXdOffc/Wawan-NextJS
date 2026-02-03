import { Metadata } from "next";
import { ApiDocsContent } from "./ApiDocsContent";

export const metadata: Metadata = {
  title: "API Documentation | Wanyzx",
  description: "Explore and test our collection of free APIs - AI, Downloaders, and Tools",
  openGraph: {
    title: "API Documentation | Wanyzx",
    description: "Explore and test our collection of free APIs - AI, Downloaders, and Tools",
    type: "website",
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://wanyzx.com"}/api-docs`,
  },
  twitter: {
    card: "summary_large_image",
    title: "API Documentation | Wanyzx",
    description: "Explore and test our collection of free APIs - AI, Downloaders, and Tools",
  },
};

export default function ApiDocsPage() {
  return <ApiDocsContent />;
}
