import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Combines class names conditionally and merges Tailwind classes
export function cn(...inputs: any[]) {
  return twMerge(clsx(...inputs));
}
