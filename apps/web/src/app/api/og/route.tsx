import { headers } from "next/headers";
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { config } from "~/lib/site-config";

async function loadGoogleFont(font: string, text: string) {
	const url = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(text)}`;
	const css = await (await fetch(url)).text();
	const resource = css.match(
		/src: url\((.+)\) format\('(opentype|truetype)'\)/,
	);

	if (resource) {
		const response = await fetch(resource[1]);
		if (response.status === 200) {
			return await response.arrayBuffer();
		}
	}

	throw new Error("failed to load font data");
}

export async function GET(req: NextRequest): Promise<Response | ImageResponse> {
	await headers();

	try {
		const { searchParams } = new URL(req.url);
		const isLight = req.headers.get("Sec-CH-Prefers-Color-Scheme") !== "dark";

		const title = searchParams.get("title") || config.title;
		const description = searchParams.get("description") || config.description;

		// Load Space Grotesk font with multiple weights
		const fontText = `${title}${description || ""}`;
		const spaceGroteskRegular = await loadGoogleFont(
			"Space+Grotesk:wght@400",
			fontText,
		);
		const spaceGroteskBold = await loadGoogleFont(
			"Space+Grotesk:wght@700",
			fontText,
		);

		// Colors matching the site design
		const bgColor = isLight ? "#fafaf8" : "#252525";
		const textColor = isLight ? "#1a1a1a" : "#fafaf8";
		const mutedColor = isLight ? "#4a4a4a" : "#a3a3a3";
		const borderColor = isLight ? "#e5e5e5" : "#404040";
		const patternColor = isLight ? "#1a1a1a" : "#fafaf8";

		return new ImageResponse(
			<div
				style={{
					height: "100%",
					width: "100%",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					backgroundColor: bgColor,
					padding: "80px",
					fontFamily: "Space Grotesk",
					position: "relative",
				}}
			>
				{/* Grid pattern - vertical lines */}
				<div
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundImage: `linear-gradient(to right, ${patternColor} 1px, transparent 1px)`,
						backgroundSize: "48px 100%",
						opacity: isLight ? 0.03 : 0.08,
					}}
				/>

				{/* Grid pattern - horizontal lines */}
				<div
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundImage: `linear-gradient(to bottom, ${patternColor} 1px, transparent 1px)`,
						backgroundSize: "100% 48px",
						opacity: isLight ? 0.03 : 0.08,
					}}
				/>

				{/* Subtle dot pattern overlay */}
				<div
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundImage: `radial-gradient(circle, ${patternColor} 1px, transparent 1px)`,
						backgroundSize: "32px 32px",
						opacity: isLight ? 0.02 : 0.05,
					}}
				/>

				{/* Gradient overlay for depth */}
				<div
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						background: isLight
							? "radial-gradient(circle at 30% 20%, rgba(26, 26, 26, 0.03) 0%, transparent 50%)"
							: "radial-gradient(circle at 30% 20%, rgba(250, 250, 248, 0.05) 0%, transparent 50%)",
					}}
				/>
				<div
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						background: isLight
							? "radial-gradient(circle at 70% 80%, rgba(26, 26, 26, 0.02) 0%, transparent 50%)"
							: "radial-gradient(circle at 70% 80%, rgba(250, 250, 248, 0.03) 0%, transparent 50%)",
					}}
				/>

				{/* Logo */}
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						marginBottom: "20px",
					}}
				>
					<svg
						width="80"
						height="80"
						viewBox="0 0 400 400"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<circle
							cx="200"
							cy="200"
							r="175"
							stroke={textColor}
							strokeWidth="50"
						/>
						<circle cx="200" cy="200" r="60" fill={textColor} />
						<title tw="hidden">Logo</title>
					</svg>
				</div>

				{/* Title */}
				<div
					style={{
						display: "flex",
						fontSize: title.length > 60 ? "56px" : "64px",
						fontWeight: "700",
						color: textColor,
						textAlign: "center",
						lineHeight: "1.1",
						letterSpacing: "-0.04em",
						maxWidth: "1000px",
						marginBottom: description ? "24px" : "0",
						wordWrap: "break-word",
						overflowWrap: "break-word",
					}}
				>
					{title}
				</div>

				{/* Description */}
				{description && (
					<div
						style={{
							display: "flex",
							fontSize: "24px",
							fontWeight: "400",
							color: mutedColor,
							textAlign: "center",
							lineHeight: "1.4",
							maxWidth: "900px",
							marginTop: "24px",
							wordWrap: "break-word",
							overflowWrap: "break-word",
						}}
					>
						{description.length > 120
							? `${description.slice(0, 120)}...`
							: description}
					</div>
				)}

				{/* Decorative border */}
				<div
					style={{
						position: "absolute",
						top: "40px",
						left: "40px",
						right: "40px",
						bottom: "40px",
						border: `2px solid ${borderColor}`,
						borderRadius: "12px",
						pointerEvents: "none",
					}}
				/>
			</div>,
			{
				width: 1200,
				height: 630,
				fonts: [
					{
						name: "Space Grotesk",
						data: spaceGroteskRegular,
						style: "normal",
						weight: 400,
					},
					{
						name: "Space Grotesk",
						data: spaceGroteskBold,
						style: "normal",
						weight: 700,
					},
				],
			},
		);
	} catch (e) {
		if (!(e instanceof Error)) {
			throw e;
		}

		// eslint-disable-next-line no-console
		console.error("OG Image generation error:", e.message);
		return new Response("Failed to generate the image", { status: 500 });
	}
}
