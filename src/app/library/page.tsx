import { Metadata } from "next";
import { LibraryContent } from "./LibraryContent";

export const metadata: Metadata = {
  title: "Code Library | Wanyzx",
  description: "Browse and download code snippets, scripts, and resources",
  openGraph: {
    title: "Code Library | Wanyzx",
    description: "Browse and download code snippets, scripts, and resources",
    type: "website",
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://wanyzx.com"}/library`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Code Library | Wanyzx",
    description: "Browse and download code snippets, scripts, and resources",
  },
};

export default function LibraryPage() {
  return <LibraryContent />;
}
