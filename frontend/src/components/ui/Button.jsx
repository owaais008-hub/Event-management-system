import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  disabled,
  onClick,
  type = "button",
  ...props
}) {
  const baseClasses = "relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";
  
  const variants = {
    primary: "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl hover:scale-105 focus:ring-indigo-500/50",
    secondary: "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-xl hover:scale-105 focus:ring-emerald-500/50",
    outline: "border-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500 hover:text-white hover:scale-105 focus:ring-indigo-500/50",
    ghost: "hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:scale-105",
    danger: "bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg hover:shadow-xl hover:scale-105 focus:ring-red-500/50",
  };
  
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <motion.button
      type={type}
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      disabled={disabled}
      onClick={onClick}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      {...props}
    >
      {children}
    </motion.button>
  );
}