import { Inter, Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
	variable: "--font-playfair",
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
});

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
});

export const config = {
	url: "https://missingstack.com",
	title: "Missing stack",
	description:
		"A curated directory of the tools for developers, builders and entrepreneurs. Build your modern product stack with awesome tools",
	locale: "en_US",
	keywords: ["Missing Stack", "AI tools directory", "SaaS tools"],
	fonts: {
		playfair,
		inter,
	},
};

export type SiteConfig = typeof config;
