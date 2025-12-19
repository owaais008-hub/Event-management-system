import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

// Unified Card Theme - Consistent across all pages
export function Card({ children, className, hover = false, ...props }) {
  return (
    <motion.div
      className={cn(
        // Unified theme: glassmorphism with consistent colors
        "bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl",
        "border border-white/30 dark:border-slate-700/30",
        "shadow-lg shadow-gray-200/50 dark:shadow-black/20",
        hover && "hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -4, scale: 1.01 } : {}}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ children, className }) {
  return (
    <div className={cn("p-6 pb-4 border-b border-gray-100 dark:border-slate-700/50", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }) {
  return (
    <h3 className={cn("text-xl font-bold text-gray-900 dark:text-white", className)}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className }) {
  return (
    <p className={cn("text-sm text-gray-600 dark:text-gray-400 mt-2", className)}>
      {children}
    </p>
  );
}

export function CardContent({ children, className }) {
  return (
    <div className={cn("p-6 pt-4", className)}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className }) {
  return (
    <div className={cn("p-6 pt-4 border-t border-gray-100 dark:border-slate-700/50", className)}>
      {children}
    </div>
  );
}
