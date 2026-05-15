import * as React from "react";
import { cn } from "@/lib/utils";

const variants = {
  default: "bg-primary/12 text-primary border-primary/30",
  secondary: "bg-muted text-muted-foreground border-border",
  success: "bg-emerald-400/10 text-emerald-300 border-emerald-400/30",
  warning: "bg-amber-400/10 text-amber-300 border-amber-400/30",
  danger: "bg-rose-400/10 text-rose-300 border-rose-400/30",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: keyof typeof variants }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
