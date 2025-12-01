import { ArrowLeft, Mail, Sparkles, Twitter } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "~/components/home/footer";
import { Header } from "~/components/home/header";
import { StructuredData } from "~/components/structured-data";
import { Button } from "~/components/ui/button";
import { Container } from "~/components/ui/container";
import { Separator } from "~/components/ui/separator";
import { breadcrumb, generateSEOMetadata } from "~/lib/seo";

export const metadata: Metadata = generateSEOMetadata({
	title: "Advertise on Missing Stack",
	description:
		"Reach an engaged developer audience with Missing Stack. Advertise your developer tools, APIs, cloud services, and tech products to thousands of active users.",
	url: "/advertise",
});

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
					<Link
						href="/"
						className="mb-6 inline-flex min-h-[44px] items-center gap-2 text-muted-foreground text-xs transition-all duration-200 hover:gap-2.5 hover:text-primary active:scale-95 sm:mb-8 sm:text-sm"
					>
						<ArrowLeft className="group-hover:-translate-x-0.5 h-3.5 w-3.5 transition-transform duration-200 sm:h-4 sm:w-4" />
						Back to home
					</Link>

					<div className="mx-auto max-w-4xl">
						<div className="mb-12 text-center sm:mb-16">
							<h1 className="mb-4 font-serif text-3xl text-primary leading-tight sm:mb-6 sm:text-4xl md:text-5xl">
								Advertise on Missing Stack
							</h1>
						</div>

						<section className="mb-12 sm:mb-16">
							<h2 className="mb-4 font-serif text-2xl text-primary sm:mb-6 sm:text-3xl">
								Reach an Engaged Developer Audience
							</h2>
							<p className="mb-6 text-base text-muted-foreground leading-relaxed sm:mb-8 sm:text-lg">
								Missing Stack attracts thousands of unique visitors monthly -
								and we're growing steadily. Our audience consists of developers,
								engineering leaders, and technical decision-makers who are
								actively seeking ways to improve their development workflow and
								productivity.
							</p>
						</section>

						<section className="mb-12 sm:mb-16">
							<h2 className="mb-4 font-serif text-2xl text-primary sm:mb-6 sm:text-3xl">
								Why Advertise With Us
							</h2>
							<p className="mb-4 text-base text-muted-foreground leading-relaxed sm:mb-6 sm:text-lg">
								Our community is highly engaged with developer tools, AI
								solutions, and productivity enhancers. If you're offering
								developer tools, APIs, cloud services, or any tech product, our
								platform provides direct access to your ideal audience. Our
								users are early adopters who actively influence technology
								choices within their organizations.
							</p>
						</section>

						<section className="mb-12 sm:mb-16">
							<h2 className="mb-6 font-serif text-2xl text-primary sm:mb-8 sm:text-3xl">
								Advertising Options
							</h2>
							<p className="mb-8 text-base text-muted-foreground leading-relaxed sm:mb-10 sm:text-lg">
								We offer various advertising opportunities including:
							</p>

							<div className="space-y-6 sm:space-y-8">
								<div className="rounded-xl border border-border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md sm:p-8">
									<div className="mb-4 flex items-center gap-3 sm:mb-6">
										<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 sm:h-12 sm:w-12">
											<Sparkles className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
										</div>
										<h3 className="font-serif text-primary text-xl sm:text-2xl">
											Sponsorships
										</h3>
									</div>
									<p className="mb-4 text-muted-foreground text-sm leading-relaxed sm:mb-6 sm:text-base">
										Premium placement and priority visibility for your tool.
										Sponsored tools appear higher in search results, get
										featured placement on category pages, and receive priority
										weighting in our ranking algorithm. Ideal for tools
										launching new features, running time-limited campaigns, or
										looking to maximize visibility during specific periods.
									</p>
									<ul className="space-y-2 text-muted-foreground text-sm sm:text-base">
										<li className="flex items-start gap-3">
											<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
											<span>
												Priority placement in search results and category pages
											</span>
										</li>
										<li className="flex items-start gap-3">
											<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
											<span>
												Time-limited campaigns with flexible start and end dates
											</span>
										</li>
										<li className="flex items-start gap-3">
											<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
											<span>
												Multiple sponsorship tiers to match your budget
											</span>
										</li>
										<li className="flex items-start gap-3">
											<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
											<span>
												Full control over campaign activation and deactivation
											</span>
										</li>
									</ul>
								</div>
							</div>
						</section>

						<Separator className="my-12 sm:my-16" />

						<section className="rounded-2xl bg-primary p-8 text-center text-white sm:p-10 lg:p-12">
							<div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 transition-transform duration-200 hover:scale-110 sm:mb-8 sm:h-16 sm:w-16">
								<Mail className="h-7 w-7 sm:h-8 sm:w-8" />
							</div>
							<h2 className="mb-4 font-serif text-2xl leading-tight sm:mb-6 sm:text-3xl md:text-4xl">
								Get in Touch
							</h2>
							<p className="mx-auto mb-8 max-w-xl text-sm text-white/80 sm:mb-10 sm:text-base">
								Contact yadav at{" "}
								<a
									href="https://twitter.com/iamya6av"
									target="_blank"
									rel="noopener noreferrer"
									className="font-medium underline transition-colors hover:text-white"
								>
									@iamya6av
								</a>{" "}
								to discuss how we can help you reach our engaged developer
								community Or{" "}
								<a
									href="mailto:pravven.yadav@missing.studio"
									className="font-medium underline transition-colors hover:text-white"
								>
									Email
								</a>{" "}
								us
							</p>
							<Button
								size="lg"
								className="gap-2 rounded-full bg-white px-8 text-primary transition-all duration-300 hover:scale-105 hover:bg-white/90 active:scale-95 sm:px-10"
								asChild
							>
								<a
									href="https://twitter.com/iamya6av"
									target="_blank"
									rel="noopener noreferrer"
								>
									<Twitter className="h-4 w-4 sm:h-5 sm:w-5" />
									Contact on X
								</a>
							</Button>
						</section>
					</div>
				</Container>
			</main>
			<Footer />
		</div>
	);
}
