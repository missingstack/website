interface ToolCountProps {
	count: number;
	isLoading?: boolean;
	className?: string;
}

export function ToolCount({ count, isLoading, className }: ToolCountProps) {
	return (
		<span
			className={`text-muted-foreground text-xs sm:text-sm ${className ?? ""}`}
		>
			{isLoading
				? "Loading..."
				: `Showing ${count} tool${count !== 1 ? "s" : ""}`}
		</span>
	);
}
