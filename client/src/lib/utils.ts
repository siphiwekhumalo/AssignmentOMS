/**
 * Utility functions for the React application
 * 
 * Contains common helper functions used throughout the frontend
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function for merging CSS class names
 * Combines clsx for conditional classes with tailwind-merge for proper Tailwind CSS merging
 * 
 * @param inputs - Array of class values (strings, objects, arrays, etc.)
 * @returns Merged and deduplicated class string
 * 
 * Example:
 * cn("px-2 py-1", condition && "bg-blue-500", { "text-white": isActive })
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
