interface FilterSectionProps {
	title: string;
	children: React.ReactNode;
	className?: string;
}

export function FilterSection({
	title,
	children,
	className,
}: FilterSectionProps) {
	return (
		<div
			className={`overflow-hidden rounded-xl border border-border/50 bg-white p-5 ${className ?? ""}`}
		>
			<h3 className="mb-4 font-semibold text-sm">{title}</h3>
			{children}
		</div>
	);
}
