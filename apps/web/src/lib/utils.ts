import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Formats kebab-case enum values to readable display names
 * Converts "open-source" -> "Open Source", "free" -> "Free", etc.
 */
export function formatEnumDisplay(value: string): string {
	// Handle special cases with custom mappings
	const customMappings: Record<string, string> = {
		"open-source": "Open Source",
		free: "Free",
		freemium: "Freemium",
		paid: "Paid",
		enterprise: "Enterprise",
		// Platforms
		web: "Web",
		mac: "macOS",
		windows: "Windows",
		linux: "Linux",
		ios: "iOS",
		android: "Android",
		extension: "Extension",
		api: "API",
	};

	// Return custom mapping if exists, otherwise convert kebab-case to Title Case
	if (customMappings[value.toLowerCase()]) {
		return customMappings[value.toLowerCase()];
	}

	// Fallback: convert kebab-case to Title Case
	return value
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(" ");
}

/**
 * Format pricing enum for display
 */
export function formatPricingDisplay(pricing: string): string {
	return formatEnumDisplay(pricing);
}

/**
 * Format platform enum for display
 */
export function formatPlatformDisplay(platform: string): string {
	return formatEnumDisplay(platform);
}
