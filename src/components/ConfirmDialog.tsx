"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { useEffect } from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Delete",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const variants = {
    danger: {
      icon: <AlertTriangle className="w-6 h-6 text-red-400" />,
      button: "bg-red-500 hover:bg-red-600 shadow-red-500/20",
      bg: "bg-red-500/10 border-red-500/20",
    },
    warning: {
      icon: <AlertTriangle className="w-6 h-6 text-amber-400" />,
      button: "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    info: {
      icon: <AlertTriangle className="w-6 h-6 text-blue-400" />,
      button: "bg-blue-500 hover:bg-blue-600 shadow-blue-500/20",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
  };

  const activeVariant = variants[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-[#0a0a0f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Header pattern */}
            <div className={`absolute top-0 inset-x-0 h-24 bg-gradient-to-b ${variant === 'danger' ? 'from-red-500/10' : variant === 'warning' ? 'from-amber-500/10' : 'from-blue-500/10'} to-transparent`} />
            
            <div className="relative p-6 sm:p-8">
              <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-2xl ${activeVariant.bg} border`}>
                  {activeVariant.icon}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-xl text-gray-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 mb-8">
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {description}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-2xl transition-all disabled:opacity-50"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`flex-1 px-6 py-3.5 ${activeVariant.button} text-white font-semibold rounded-2xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center`}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    confirmText
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
