import { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export const Input = forwardRef(({ className, error, ...props }, ref) => {
  return (
    <motion.input
      ref={ref}
      className={cn(
        "w-full px-4 py-3 rounded-xl border-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm",
        "text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400",
        "transition-all duration-300 focus:outline-none focus:ring-4",
        error
          ? "border-red-500 focus:ring-red-500/50 focus:border-red-500"
          : "border-gray-300 dark:border-slate-600 focus:ring-indigo-500/50 focus:border-indigo-500",
        className
      )}
      whileFocus={{ scale: 1.02 }}
      {...props}
    />
  );
});

Input.displayName = "Input";

export const Textarea = forwardRef(({ className, error, ...props }, ref) => {
  return (
    <motion.textarea
      ref={ref}
      className={cn(
        "w-full px-4 py-3 rounded-xl border-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm resize-none",
        "text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400",
        "transition-all duration-300 focus:outline-none focus:ring-4",
        error
          ? "border-red-500 focus:ring-red-500/50 focus:border-red-500"
          : "border-gray-300 dark:border-slate-600 focus:ring-indigo-500/50 focus:border-indigo-500",
        className
      )}
      whileFocus={{ scale: 1.01 }}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

