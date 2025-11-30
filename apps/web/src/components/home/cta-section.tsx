import { ArrowRight, Heart, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Container } from "~/components/ui/container";

export function CTASection() {
	return (
		<section className="bg-primary py-20 text-white">
			<Container>
				<div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
					<div className="text-center md:text-left">
						<div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
							<Plus className="h-6 w-6" />
						</div>
						<h2 className="mb-3 font-serif text-2xl md:text-3xl">
							Know a great tool?
						</h2>
						<p className="mb-6 max-w-md text-white/70">
							Help fellow builders discover it. Submit tools you love and
							contribute to the community.
						</p>
						<Button
							size="lg"
							className="gap-2 rounded-full bg-white px-8 text-primary hover:bg-white/90"
							asChild
						>
							<Link href="/submit">
								Contribute a Tool
								<ArrowRight className="h-4 w-4" />
							</Link>
						</Button>
					</div>

					<div className="absolute left-1/2 hidden h-32 w-px bg-white/20 md:block" />

					<div className="text-center md:text-left">
						<div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
							<Heart className="h-6 w-6" />
						</div>
						<h2 className="mb-3 font-serif text-2xl md:text-3xl">
							Support Missing stack
						</h2>
						<p className="mb-6 max-w-md text-white/70">
							We're building this in public. Follow our journey and help us grow
							the best tool discovery platform.
						</p>
						<div className="flex flex-wrap justify-center gap-3 md:justify-start">
							<Button
								size="lg"
								className="gap-2 rounded-full bg-white px-8 text-primary hover:bg-white/90"
								asChild
							>
								<a
									href="https://twitter.com/missingstack"
									target="_blank"
									rel="noopener noreferrer"
								>
									Follow on X
								</a>
							</Button>
							<Button
								size="lg"
								variant="outline"
								className="gap-2 rounded-full border-white/30 bg-transparent px-8 text-white hover:border-white/50 hover:bg-white/10"
								asChild
							>
								<a
									href="https://github.com/missingstack"
									target="_blank"
									rel="noopener noreferrer"
								>
									Star on GitHub
								</a>
							</Button>
						</div>
					</div>
				</div>
			</Container>
		</section>
	);
}
