import { cn } from "../../lib/utils";

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-gray-200 dark:bg-slate-700",
        className
      )}
      {...props}
    />
  );
}

