import { cn } from "~/lib/utils";

interface HeroProps {
	title: string;
	className?: string;
}

export function Hero({ title, className }: HeroProps) {
	return (
		<div className={cn("mb-12 text-center sm:mb-16", className)}>
			<h1 className="mb-4 text-3xl text-primary leading-tight sm:mb-6 sm:text-4xl md:text-5xl">
				{title}
			</h1>
		</div>
	);
}
