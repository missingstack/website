import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Footer } from "~/components/home/footer";
import { Header } from "~/components/home/header";

export default function TermsPage() {
	return (
		<div className="flex min-h-screen flex-col bg-background">
			<Header />

			<main className="flex-1 py-12">
				<div className="mx-auto max-w-3xl px-6">
					<Link
						href="/"
						className="mb-8 inline-flex items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-primary"
					>
						<ArrowLeft className="h-4 w-4" />
						Back to home
					</Link>

					<h1 className="mb-8 font-serif text-4xl text-primary">
						Terms of Service
					</h1>

					<div className="prose prose-neutral max-w-none">
						<p className="mb-8 text-lg text-muted-foreground">
							Last updated: January 2024
						</p>

						<section className="mb-8">
							<h2 className="mb-4 font-serif text-2xl text-primary">
								1. Acceptance of Terms
							</h2>
							<p className="text-muted-foreground leading-relaxed">
								By accessing and using Missing stack, you accept and agree to be
								bound by the terms and provision of this agreement.
							</p>
						</section>

						<section className="mb-8">
							<h2 className="mb-4 font-serif text-2xl text-primary">
								2. Use License
							</h2>
							<p className="text-muted-foreground leading-relaxed">
								Permission is granted to temporarily access the materials on
								Missing stack for personal, non-commercial transitory viewing
								only.
							</p>
						</section>

						<section className="mb-8">
							<h2 className="mb-4 font-serif text-2xl text-primary">
								3. User Submissions
							</h2>
							<p className="text-muted-foreground leading-relaxed">
								When you contribute a tool to Missing stack, you grant us a
								non-exclusive license to display and promote the tool on our
								platform. You represent that you have the right to submit the
								information provided.
							</p>
						</section>

						<section className="mb-8">
							<h2 className="mb-4 font-serif text-2xl text-primary">
								4. Disclaimer
							</h2>
							<p className="text-muted-foreground leading-relaxed">
								The materials on Missing stack are provided on an 'as is' basis.
								Missing stack makes no warranties, expressed or implied, and
								hereby disclaims and negates all other warranties including,
								without limitation, implied warranties or conditions of
								merchantability, fitness for a particular purpose, or
								non-infringement of intellectual property or other violation of
								rights.
							</p>
						</section>

						<section className="mb-8">
							<h2 className="mb-4 font-serif text-2xl text-primary">
								5. Contact
							</h2>
							<p className="text-muted-foreground leading-relaxed">
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
