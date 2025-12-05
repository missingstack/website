import type { LucideIcon } from "lucide-react";
import { ArrowRight, DollarSign, Heart } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Container } from "~/components/ui/container";

// CTACard Component
interface CTACardProps {
	icon: LucideIcon;
	title: string;
	description: string;
	action: {
		label: string;
		href?: string;
		onClick?: () => void;
	};
}

function CTACard({ icon: Icon, title, description, action }: CTACardProps) {
	return (
		<div className="text-center md:text-left">
			<div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition-transform duration-200 hover:scale-110 sm:mb-5 sm:h-12 sm:w-12">
				<Icon className="h-5 w-5 sm:h-6 sm:w-6" />
			</div>
			<h2 className="mb-2 text-white text-xl leading-tight sm:mb-3 sm:text-2xl md:text-3xl">
				{title}
			</h2>
			<p className="mb-5 max-w-md text-sm text-white/70 sm:mb-6 sm:text-base">
				{description}
			</p>
			{action.href ? (
				<Button
					size="lg"
					className="gap-2 rounded-full bg-white px-6 text-primary transition-all duration-300 hover:scale-105 hover:bg-white/90 active:scale-95 sm:px-8"
					asChild
				>
					<Link href={action.href}>
						{action.label}
						<ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1 sm:h-4 sm:w-4" />
					</Link>
				</Button>
			) : (
				<Button
					size="lg"
					className="gap-2 rounded-full bg-white px-6 text-primary transition-all duration-300 hover:scale-105 hover:bg-white/90 active:scale-95 sm:px-8"
					onClick={action.onClick}
				>
					{action.label}
					<ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1 sm:h-4 sm:w-4" />
				</Button>
			)}
		</div>
	);
}

// Main CTASection Component
export function CTASection() {
	return (
		<section className="bg-primary py-12 text-white sm:py-16 lg:py-20">
			<Container>
				<div className="relative grid grid-cols-1 items-center gap-10 sm:gap-12 md:grid-cols-2">
					<CTACard
						icon={DollarSign}
						title="Sponsor Your Product"
						description="Reach thousands of developers, founders, and builders. Choose from our sponsorship opportunities to grow your product's visibility."
						action={{
							label: "Sponsor with Us",
							href: "/advertise",
						}}
					/>

					<div className="absolute left-1/2 hidden h-24 w-px bg-white/20 md:block lg:h-32" />

					<CTACard
						icon={Heart}
						title="Support Missing stack"
						description="We're building this in public. Follow our journey and help us grow the best tool discovery platform."
						action={{
							label: "Follow on X",
							href: "https://twitter.com/@MissingstackHQ",
						}}
					/>
				</div>
			</Container>
		</section>
	);
}

// Export sub-components for reuse
export { CTACard };
