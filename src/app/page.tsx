"use client";

import { motion } from "framer-motion";
import { Typewriter } from "@/components/Typewriter";
import { ArrowDown, Mail, Code2, Sparkles, Brain, Bot, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 pt-20">
        <div className="max-w-5xl mx-auto text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase border border-primary/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              Available for work
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter mb-8 leading-tight"
          >
            Hi, I'm <br />
            <span className="gradient-text">Wanyzx.</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl sm:text-2xl font-medium text-muted-foreground mb-4 h-8"
          >
            <Typewriter
              words={[
                "Full Stack Developer",
                "AI Engineer",
                "Prompt Engineer",
                "Problem Solver",
              ]}
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-sm uppercase tracking-[0.3em] font-bold text-primary/60 mb-8"
          >
            Digital Magic Maker & Problem Solver
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="text-base text-muted-foreground max-w-lg mx-auto mb-12"
          >
            Turning complex ideas into elegant digital solutions with a focus on AI integration and scalable architecture.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/contact">
              <Button size="lg" className="rounded-full px-8 font-bold">
                GET IN TOUCH <Mail className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/projects">
              <Button size="lg" variant="outline" className="rounded-full px-8 font-bold">
                VIEW PROJECTS <Rocket className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <ArrowDown className="w-6 h-6 animate-bounce text-muted-foreground/50" />
        </motion.div>
      </section>

      {/* Expertise Section */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4 uppercase">My Expertise</h2>
            <div className="h-1.5 w-20 bg-primary mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Back-End",
                description: "Arsitektur database dan server yang skalabel dan aman untuk kebutuhan bisnis modern.",
                icon: Code2,
                color: "var(--theme-accent)",
              },
              {
                title: "AI Engineer",
                description: "Integrasi LLM dan pengembangan aplikasi berbasis AI untuk solusi masa depan.",
                icon: Brain,
                color: "var(--theme-secondary)",
              },
              {
                title: "Prompt Engineer",
                description: "Optimasi instruksi AI untuk menghasilkan output yang akurat dan berkualitas tinggi.",
                icon: Bot,
                color: "var(--theme-tertiary)",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative p-8 rounded-[2rem] bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300 group overflow-hidden"
              >
                {/* Background Glow */}
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
                
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform duration-300">
                    <item.icon className="w-7 h-7" style={{ color: `hsl(${item.color})` }} />
                  </div>
                  {item.title && <h3 className="text-xl font-bold mb-3 tracking-tight">{item.title}</h3>}
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black mb-6 uppercase">Let's Build Something</h2>
          <p className="text-lg text-muted-foreground mb-10">
            Have a project in mind? Let's turn your idea into reality with cutting-edge technology.
          </p>
          <Link href="/contact">
            <Button size="lg" className="rounded-full px-12 py-8 text-xl font-black">
              HIRE ME
            </Button>
          </Link>
        </div>
      </section>

    </div>
  );
}
