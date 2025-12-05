"use client";

import { Search, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Container } from "~/components/ui/container";
import { Input } from "~/components/ui/input";

interface StackSearchInputProps {
	value: string | null;
	onChange: (value: string | null) => void;
	placeholder: string;
}

export function StackSearchInput({
	value,
	onChange,
	placeholder,
}: StackSearchInputProps) {
	return (
		<Container>
			<div className="mb-6 flex justify-end sm:mb-8">
				<div className="relative w-full lg:w-96">
					<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground sm:left-4 sm:h-5 sm:w-5" />
					<Input
						type="text"
						value={value ?? ""}
						onChange={(e) => onChange(e.target.value || null)}
						placeholder={placeholder}
						className="h-11 rounded-xl border-border bg-white pr-10 pl-10 text-sm transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 sm:h-12 sm:rounded-xl sm:pr-12 sm:pl-12 sm:text-base"
					/>
					{value && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => onChange(null)}
							className="-translate-y-1/2 absolute top-1/2 right-1.5 flex h-8 min-h-[44px] w-8 items-center justify-center p-0 transition-all duration-200 hover:scale-110 active:scale-95 sm:right-2"
						>
							<X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
							<span className="sr-only">Clear search</span>
						</Button>
					)}
				</div>
			</div>
		</Container>
	);
}
