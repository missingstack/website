"use client";

import { Search, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

interface StacksTableSearchProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
}

export function StacksTableSearch({
	value,
	onChange,
	placeholder = "Search stacks...",
}: StacksTableSearchProps) {
	return (
		<div className="relative max-w-sm flex-1">
			<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
			<Input
				type="text"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				className="pr-9 pl-9"
			/>
			{value && (
				<Button
					variant="ghost"
					size="sm"
					onClick={() => onChange("")}
					className="-translate-y-1/2 absolute top-1/2 right-1 h-7 w-7 p-0"
				>
					<X className="h-4 w-4" />
					<span className="sr-only">Clear search</span>
				</Button>
			)}
		</div>
	);
}
