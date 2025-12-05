import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

interface SectionProps {
	title?: string;
	children: ReactNode;
	className?: string;
	titleClassName?: string;
}

export function Section({
	title,
	children,
	className,
	titleClassName,
}: SectionProps) {
	return (
		<section className={cn("mb-12 sm:mb-16", className)}>
			{title && (
				<h2
					className={cn(
						"mb-4 text-2xl text-primary sm:mb-6 sm:text-3xl",
						titleClassName,
					)}
				>
					{title}
				</h2>
			)}
			{children}
		</section>
	);
}
