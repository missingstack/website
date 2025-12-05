import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

interface SponsorshipCardProps {
	title: string;
	description: string;
	features: readonly string[];
	icon?: ReactNode;
	className?: string;
}

export function SponsorshipCard({
	title,
	description,
	features,
	icon,
	className,
}: SponsorshipCardProps) {
	return (
		<div
			className={cn(
				"rounded-xl border border-border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md sm:p-8",
				className,
			)}
		>
			<div className="mb-4 flex items-center gap-3 sm:mb-6">
				<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 sm:h-12 sm:w-12">
					{icon || <Sparkles className="h-5 w-5 text-primary sm:h-6 sm:w-6" />}
				</div>
				<h3 className="text-primary text-xl sm:text-2xl">{title}</h3>
			</div>
			<p className="mb-4 text-muted-foreground text-sm leading-relaxed sm:mb-6 sm:text-base">
				{description}
			</p>
			<ul className="space-y-2 text-muted-foreground text-sm sm:text-base">
				{features.map((feature) => (
					<li key={feature} className="flex items-start gap-3">
						<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>{feature}</span>
					</li>
				))}
			</ul>
		</div>
	);
}
