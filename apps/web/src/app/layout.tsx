import "../index.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import Providers from "~/components/providers";
import { config } from "~/lib/site-config";

const { playfair, inter } = config.fonts;

export const metadata: Metadata = {
	metadataBase: new URL(config.url),
	alternates: { canonical: "/" },
	title: {
		default: config.title,
		template: `%s | ${config.title}`,
	},
	description: config.description,
	openGraph: {
		title: config.title,
		description: config.description,
		url: config.url,
		locale: "en_US",
		type: "website",
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="light" style={{ colorScheme: "light" }}>
			<body className={`${playfair.variable} ${inter.variable} antialiased`}>
				<Providers>
					<div className="grid h-svh grid-rows-[auto_1fr]">{children}</div>
					<Analytics />
					<SpeedInsights />
				</Providers>
			</body>
		</html>
	);
}
