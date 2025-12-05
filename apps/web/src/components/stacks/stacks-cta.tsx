import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Container } from "~/components/ui/container";

export function StacksCTA() {
	return (
		<Container className="mt-12 sm:mt-16 lg:mt-20">
			<div className="rounded-2xl bg-primary p-8 text-center text-white transition-all duration-300 hover:shadow-primary/20 hover:shadow-xl sm:rounded-3xl sm:p-10 lg:p-12">
				<h2 className="mb-3 text-2xl sm:mb-4 sm:text-3xl md:text-4xl">
					Can&apos;t find what you&apos;re looking for?
				</h2>
				<p className="mx-auto mb-6 max-w-xl text-sm text-white/70 sm:mb-8 sm:text-base">
					Contribute a Tool you love and help fellow builders discover it.
				</p>
				<Link
					href="/submit"
					rel="nofollow"
					className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-white px-6 py-2.5 font-medium text-primary transition-all duration-300 hover:scale-105 hover:bg-white/90 active:scale-95 sm:px-8 sm:py-3"
				>
					Contribute a Tool
					<ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1 sm:h-4 sm:w-4" />
				</Link>
			</div>
		</Container>
	);
}
