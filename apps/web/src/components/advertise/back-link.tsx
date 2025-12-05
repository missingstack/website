import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "~/lib/utils";

interface BackLinkProps {
	href?: string;
	className?: string;
}

export function BackLink({ href = "/", className }: BackLinkProps) {
	return (
		<Link
			href={href}
			className={cn(
				"mb-6 inline-flex min-h-[44px] items-center gap-2 text-muted-foreground text-xs transition-all duration-200 hover:gap-2.5 hover:text-primary active:scale-95 sm:mb-8 sm:text-sm",
				className,
			)}
		>
			<ArrowLeft className="group-hover:-translate-x-0.5 h-3.5 w-3.5 transition-transform duration-200 sm:h-4 sm:w-4" />
			Back to home
		</Link>
	);
}
