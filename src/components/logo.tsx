import { cn } from "@/lib/utils";

export function Logo({ className, variant = "dark" }: { className?: string, variant?: "dark" | "light" }) {
  const textColor = variant === "dark" ? "text-teal-ink" : "text-paper";
  const dotColor = "text-terracotta";

  return (
    <div className={cn("text-3xl font-serif font-bold tracking-tight", textColor, className)}>
      deepen<span className={dotColor}>.</span>
    </div>
  );
}
