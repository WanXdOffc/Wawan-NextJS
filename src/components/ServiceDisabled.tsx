"use client";

import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ServiceDisabledProps {
  serviceName: string;
}

export function ServiceDisabled({ serviceName }: ServiceDisabledProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-3">Service Unavailable</h1>
        <p className="text-muted-foreground mb-6">
          {serviceName} is currently disabled by administrator.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent hover:bg-accent/80 text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </motion.div>
    </div>
  );
}
