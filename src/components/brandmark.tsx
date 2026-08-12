import { cn } from "@/lib/utils";

export function Brandmark({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 64 64" 
      className={cn("w-full h-full", className)}
      role="img" 
      aria-label="Deepen Mark"
      fill="currentColor"
    >
      <rect x="10" y="13" width="44" height="4" rx="2" />
      <rect x="10" y="24" width="44" height="9" rx="2" />
      <rect x="10" y="39" width="44" height="12" rx="2" />
    </svg>
  );
}
