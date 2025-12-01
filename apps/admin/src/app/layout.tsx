import "../index.css";

import type { Metadata } from "next";
import Providers from "~/components/providers";
import { config } from "~/lib/site-config";

const { playfair, inter } = config.fonts;

const ogImageUrl = new URL("/api/og", config.url);
ogImageUrl.searchParams.set("title", config.title);
ogImageUrl.searchParams.set("description", config.description);

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
		siteName: config.title,
		locale: config.locale,
		type: "website",
		images: [
			{
				url: ogImageUrl.toString(),
				width: 1200,
				height: 630,
				alt: config.title,
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: config.title,
		description: config.description,
		images: [ogImageUrl.toString()],
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
					<div className="grid h-svh w-screen grid-rows-[auto_1fr]">
						{children}
					</div>
				</Providers>
			</body>
		</html>
	);
}
