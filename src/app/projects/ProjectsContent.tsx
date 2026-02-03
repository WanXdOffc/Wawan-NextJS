"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ExternalLink, Folder, Search, Filter, Github } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Project {
  _id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  liveUrl: string;
  githubUrl: string;
  featured: boolean;
}

export function ProjectsContent() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        setProjects(data.projects || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const allTags = [...new Set(projects.flatMap((p) => p.tags || []))];

  const filteredProjects = projects.filter((project) => {
    const matchSearch =
      project.title.toLowerCase().includes(search.toLowerCase()) ||
      project.description.toLowerCase().includes(search.toLowerCase());
    const matchTag = !selectedTag || project.tags?.includes(selectedTag);
    return matchSearch && matchTag;
  });

  const handleOpenUrl = (url: string) => {
    if (url && url !== "#") {
      window.parent.postMessage({ type: "OPEN_EXTERNAL_URL", data: { url } }, "*");
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-black mb-4">
            My <span className="gradient-text">Projects</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A collection of projects I&apos;ve worked on
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative w-full max-w-md mx-auto mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 rounded-full bg-card border-border"
            />
          </div>

          {allTags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setSelectedTag(null)}
                className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  !selectedTag
                    ? "bg-gradient-to-r from-[hsl(var(--theme-primary))] to-[hsl(var(--theme-accent))] text-white"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedTag === tag
                      ? "bg-gradient-to-r from-[hsl(var(--theme-primary))] to-[hsl(var(--theme-accent))] text-white"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[hsl(var(--theme-primary))] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Folder className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">Belum tersedia</p>
          </motion.div>
        ) : filteredProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Folder className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">No projects found</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group"
              >
                <div className="relative overflow-hidden rounded-2xl bg-card border border-border hover:border-[hsl(var(--theme-primary)/0.5)] transition-all duration-300 h-full flex flex-col">
                  <div
                    className="relative h-48 bg-cover bg-center"
                    style={{ backgroundImage: `url(${project.image})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                    {project.featured && (
                      <span className="absolute top-3 right-3 px-2 py-1 rounded-full bg-gradient-to-r from-[hsl(var(--theme-primary))] to-[hsl(var(--theme-accent))] text-white text-xs font-medium">
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-[hsl(var(--theme-primary))] transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-1">
                      {project.description}
                    </p>
                    
                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 rounded-full bg-[hsl(var(--theme-primary)/0.1)] text-[hsl(var(--theme-primary))] text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      {project.liveUrl && project.liveUrl !== "#" && (
                        <button
                          onClick={() => handleOpenUrl(project.liveUrl)}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-[hsl(var(--theme-primary))] to-[hsl(var(--theme-accent))] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Demo
                        </button>
                      )}
                      {project.githubUrl && project.githubUrl !== "#" && (
                        <button
                          onClick={() => handleOpenUrl(project.githubUrl)}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm font-medium hover:bg-accent transition-colors"
                        >
                          <Github className="w-4 h-4" />
                          GitHub
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
