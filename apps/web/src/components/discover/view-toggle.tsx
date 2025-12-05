"use client";

import { Grid3X3, List } from "lucide-react";

interface ViewToggleProps {
	currentView?: "grid" | "list";
	onViewChange?: (view: "grid" | "list") => void;
	className?: string;
}

export function ViewToggle({
	currentView = "grid",
	onViewChange,
	className,
}: ViewToggleProps) {
	return (
		<div
			className={`hidden items-center overflow-hidden rounded-lg border border-border sm:flex ${className ?? ""}`}
		>
			<button
				type="button"
				onClick={() => onViewChange?.("grid")}
				className={`p-2 transition-colors ${
					currentView === "grid"
						? "bg-primary text-white"
						: "text-muted-foreground hover:bg-secondary/50"
				}`}
				aria-label="Grid view"
			>
				<Grid3X3 className="h-4 w-4" />
			</button>
			<button
				type="button"
				onClick={() => onViewChange?.("list")}
				className={`p-2 transition-colors ${
					currentView === "list"
						? "bg-primary text-white"
						: "text-muted-foreground hover:bg-secondary/50"
				}`}
				aria-label="List view"
			>
				<List className="h-4 w-4" />
			</button>
		</div>
	);
}
