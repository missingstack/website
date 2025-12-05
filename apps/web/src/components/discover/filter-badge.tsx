"use client";

import { X } from "lucide-react";
import { Badge } from "~/components/ui/badge";

interface FilterBadgeProps {
	label: string;
	onRemove: () => void;
	ariaLabel?: string;
}

export function FilterBadge({ label, onRemove, ariaLabel }: FilterBadgeProps) {
	return (
		<Badge variant="secondary" className="gap-1 pr-1">
			{label}
			<button
				type="button"
				onClick={onRemove}
				className="ml-1 rounded-full p-0.5 hover:bg-muted"
				aria-label={ariaLabel}
			>
				<X className="h-3 w-3" />
			</button>
		</Badge>
	);
}
