import { Suspense } from "react";
import { CTASection } from "~/components/home/cta-section";
import { Footer } from "~/components/home/footer";
import { Header } from "~/components/home/header";
import { HeroSection } from "~/components/home/hero-section";
import { HomepageSections } from "~/components/home/homepage-sections";
import { NewsletterSection } from "~/components/home/newsletter-section";
import { ToolCardSkeleton } from "~/components/home/tool-card";
import { Container } from "~/components/ui/container";
import { Skeleton } from "~/components/ui/skeleton";

export default function Home() {
	return (
		<div className="flex min-h-screen flex-col bg-background">
			<Header />
			<HeroSection />
			<main className="flex-1">
				{/* Cached content: Homepage sections - included in static shell
            Wrapped in Suspense for progressive enhancement and error boundaries
            Component has "use cache" with cacheLife("days") */}
				<Suspense
					fallback={
						<div className="bg-secondary/10">
							<Container className="py-8 sm:py-12 lg:py-16">
								<div className="space-y-8 sm:space-y-12 lg:space-y-16">
									{[1, 2, 3].map((sectionIndex) => (
										<div
											key={`section-skeleton-${sectionIndex}`}
											className="space-y-4 sm:space-y-6"
										>
											<Skeleton className="h-7 w-48 sm:h-8 sm:w-64" />
											<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
												{Array.from({ length: 3 }, (_, toolIndex) => {
													return (
														<ToolCardSkeleton
															key={`skeleton-${sectionIndex * 10 + toolIndex}`}
														/>
													);
												})}
											</div>
										</div>
									))}
								</div>
							</Container>
						</div>
					}
				>
					<HomepageSections />
				</Suspense>
				<NewsletterSection />
				<CTASection />
			</main>
			<Footer />
		</div>
	);
}
