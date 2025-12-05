import type { Metadata } from "next";
import {
	BackLink,
	ContactSection,
	Hero,
	Section,
	SponsorshipCard,
} from "~/components/advertise";
import { Footer } from "~/components/home/footer";
import { Header } from "~/components/home/header";
import { StructuredData } from "~/components/structured-data";
import { Container } from "~/components/ui/container";
import { Separator } from "~/components/ui/separator";
import { breadcrumb, generateSEOMetadata } from "~/lib/seo";

export const metadata: Metadata = generateSEOMetadata({
	title: "Advertise on Missing Stack",
	description:
		"Reach an engaged developer audience with Missing Stack. Advertise your developer tools, APIs, cloud services, and tech products to thousands of active users.",
	url: "/advertise",
});

const SPONSORSHIP_FEATURES = [
	"Priority placement in search results and category pages",
	"Time-limited campaigns with flexible start and end dates",
	"Multiple sponsorship tiers to match your budget",
	"Full control over campaign activation and deactivation",
] as const;

export default async function AdvertisePage() {
	return (
		<div className="flex min-h-screen flex-col bg-background">
			<StructuredData
				data={breadcrumb([
					{ name: "Home", url: "/" },
					{ name: "Advertise", url: "/advertise" },
				])}
			/>
			<Header />

			<main className="flex-1 py-8 sm:py-12 lg:py-16">
				<Container>
					<BackLink />

					<div className="mx-auto max-w-4xl">
						<Hero title="Advertise on Missing Stack" />

						<Section title="Reach an Engaged Developer Audience">
							<p className="mb-6 text-base text-muted-foreground leading-relaxed sm:mb-8 sm:text-lg">
								Missing Stack attracts thousands of unique visitors monthly -
								and we're growing steadily. Our audience consists of developers,
								engineering leaders, and technical decision-makers who are
								actively seeking ways to improve their development workflow and
								productivity.
							</p>
						</Section>

						<Section title="Why Advertise With Us">
							<p className="mb-4 text-base text-muted-foreground leading-relaxed sm:mb-6 sm:text-lg">
								Our community is highly engaged with developer tools, AI
								solutions, and productivity enhancers. If you're offering
								developer tools, APIs, cloud services, or any tech product, our
								platform provides direct access to your ideal audience. Our
								users are early adopters who actively influence technology
								choices within their organizations.
							</p>
						</Section>

						<Section title="Advertising Options">
							<p className="mb-8 text-base text-muted-foreground leading-relaxed sm:mb-10 sm:text-lg">
								We offer various advertising opportunities including:
							</p>

							<div className="space-y-6 sm:space-y-8">
								<SponsorshipCard
									title="Sponsorships"
									description="Premium placement and priority visibility for your tool. Sponsored tools appear higher in search results, get featured placement on category pages, and receive priority weighting in our ranking algorithm. Ideal for tools launching new features, running time-limited campaigns, or looking to maximize visibility during specific periods."
									features={SPONSORSHIP_FEATURES}
								/>
							</div>
						</Section>

						<Separator className="my-12 sm:my-16" />

						<ContactSection />
					</div>
				</Container>
			</main>
			<Footer />
		</div>
	);
}
