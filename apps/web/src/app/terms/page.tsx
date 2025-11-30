import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "~/components/home/footer";
import { Header } from "~/components/home/header";
import { StructuredData } from "~/components/structured-data";
import { breadcrumb, generateSEOMetadata } from "~/lib/seo";

export const metadata: Metadata = generateSEOMetadata({
	title: "Terms of Service",
	description:
		"Read our Terms of Service to understand the terms and conditions for using Missing Stack. Last updated January 2024.",
	url: "/terms",
	noindex: true,
});

export default function TermsPage() {
	return (
		<div className="flex min-h-screen flex-col bg-background">
			<StructuredData
				data={breadcrumb([
					{ name: "Home", url: "/" },
					{ name: "Terms of Service", url: "/terms" },
				])}
			/>
			<Header />

			<main className="flex-1 py-8 sm:py-12">
				<div className="mx-auto max-w-3xl px-4 sm:px-6">
					<Link
						href="/"
						className="mb-6 inline-flex min-h-[44px] items-center gap-2 text-muted-foreground text-xs transition-all duration-200 hover:gap-2.5 hover:text-primary active:scale-95 sm:mb-8 sm:text-sm"
					>
						<ArrowLeft className="group-hover:-translate-x-0.5 h-3.5 w-3.5 transition-transform duration-200 sm:h-4 sm:w-4" />
						Back to home
					</Link>

					<h1 className="mb-6 font-serif text-3xl text-primary leading-tight sm:mb-8 sm:text-4xl">
						Terms of Service
					</h1>

					<div className="prose prose-neutral max-w-none">
						<time
							dateTime="2024-01-01"
							className="mb-6 block text-muted-foreground text-sm sm:mb-8 sm:text-base lg:text-lg"
						>
							Last updated: January 2024
						</time>

						<section className="mb-6 sm:mb-8">
							<h2 className="mb-3 font-serif text-primary text-xl sm:mb-4 sm:text-2xl">
								1. Acceptance of Terms
							</h2>
							<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
								By accessing and using Missing stack, you accept and agree to be
								bound by the terms and provision of this agreement.
							</p>
						</section>

						<section className="mb-6 sm:mb-8">
							<h2 className="mb-3 font-serif text-primary text-xl sm:mb-4 sm:text-2xl">
								2. Use License
							</h2>
							<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
								Permission is granted to temporarily access the materials on
								Missing stack for personal, non-commercial transitory viewing
								only.
							</p>
						</section>

						<section className="mb-6 sm:mb-8">
							<h2 className="mb-3 font-serif text-primary text-xl sm:mb-4 sm:text-2xl">
								3. User Submissions
							</h2>
							<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
								When you contribute a tool to Missing stack, you grant us a
								non-exclusive license to display and promote the tool on our
								platform. You represent that you have the right to submit the
								information provided.
							</p>
						</section>

						<section className="mb-6 sm:mb-8">
							<h2 className="mb-3 font-serif text-primary text-xl sm:mb-4 sm:text-2xl">
								4. Disclaimer
							</h2>
							<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
								The materials on Missing stack are provided on an 'as is' basis.
								Missing stack makes no warranties, expressed or implied, and
								hereby disclaims and negates all other warranties including,
								without limitation, implied warranties or conditions of
								merchantability, fitness for a particular purpose, or
								non-infringement of intellectual property or other violation of
								rights.
							</p>
						</section>

						<section className="mb-6 sm:mb-8">
							<h2 className="mb-3 font-serif text-primary text-xl sm:mb-4 sm:text-2xl">
								5. Contact
							</h2>
							<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
								If you have any questions about these Terms, please contact us.
							</p>
						</section>
					</div>
				</div>
			</main>

			<Footer />
		</div>
	);
}
