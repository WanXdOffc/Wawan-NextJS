import { Metadata } from "next";
import { ProjectsContent } from "./ProjectsContent";

export const metadata: Metadata = {
  title: "Projects | Wanyzx",
  description: "A collection of projects I've worked on - web apps, tools, and experiments",
  openGraph: {
    title: "Projects | Wanyzx",
    description: "A collection of projects I've worked on - web apps, tools, and experiments",
    type: "website",
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://wanyzx.com"}/projects`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects | Wanyzx",
    description: "A collection of projects I've worked on - web apps, tools, and experiments",
  },
};

export default function ProjectsPage() {
  return <ProjectsContent />;
}
