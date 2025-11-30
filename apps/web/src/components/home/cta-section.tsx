import { ArrowRight, Heart, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Container } from "~/components/ui/container";

export function CTASection() {
	return (
		<section className="bg-primary py-12 text-white sm:py-16 lg:py-20">
			<Container>
				<div className="grid grid-cols-1 items-center gap-10 sm:gap-12 md:grid-cols-2">
					<div className="text-center md:text-left">
						<div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition-transform duration-200 hover:scale-110 sm:mb-5 sm:h-12 sm:w-12">
							<Plus className="h-5 w-5 sm:h-6 sm:w-6" />
						</div>
						<h2 className="mb-2 font-serif text-white text-xl leading-tight sm:mb-3 sm:text-2xl md:text-3xl">
							Know a great tool?
						</h2>
						<p className="mb-5 max-w-md text-sm text-white/70 sm:mb-6 sm:text-base">
							Help fellow builders discover it. Submit tools you love and
							contribute to the community.
						</p>
						<Button
							size="lg"
							className="gap-2 rounded-full bg-white px-6 text-primary transition-all duration-300 hover:scale-105 hover:bg-white/90 active:scale-95 sm:px-8"
							asChild
						>
							<Link href="/submit">
								Contribute a Tool
								<ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1 sm:h-4 sm:w-4" />
							</Link>
						</Button>
					</div>

					<div className="absolute left-1/2 hidden h-24 w-px bg-white/20 md:block lg:h-32" />

					<div className="text-center md:text-left">
						<div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition-transform duration-200 hover:scale-110 sm:mb-5 sm:h-12 sm:w-12">
							<Heart className="h-5 w-5 sm:h-6 sm:w-6" />
						</div>
						<h2 className="mb-2 font-serif text-white text-xl leading-tight sm:mb-3 sm:text-2xl md:text-3xl">
							Support Missing stack
						</h2>
						<p className="mb-5 max-w-md text-sm text-white/70 sm:mb-6 sm:text-base">
							We're building this in public. Follow our journey and help us grow
							the best tool discovery platform.
						</p>
						<div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:justify-start">
							<Button
								size="lg"
								className="gap-2 rounded-full bg-white px-6 text-primary transition-all duration-300 hover:scale-105 hover:bg-white/90 active:scale-95 sm:px-8"
								asChild
							>
								<a
									href="https://twitter.com/@MissingstackHQ"
									target="_blank"
									rel="noopener noreferrer"
								>
									Follow on X
								</a>
							</Button>
						</div>
					</div>
				</div>
			</Container>
		</section>
	);
}
