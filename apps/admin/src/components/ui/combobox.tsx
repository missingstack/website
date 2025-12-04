"use client";

import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import * as React from "react";
import { Button } from "~/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "~/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";

export interface ComboboxOption {
	value: string;
	label: string;
}

interface ComboboxProps {
	options?: ComboboxOption[];
	value?: string;
	onValueChange?: (value: string) => void;
	placeholder?: string;
	searchPlaceholder?: string;
	emptyText?: string;
	multiple?: boolean;
	selectedValues?: string[];
	onSelectedValuesChange?: (values: string[]) => void;
	searchFn?: (search: string) => Promise<ComboboxOption[]>;
	defaultLimit?: number;
}

export function Combobox({
	options: staticOptions = [],
	value,
	onValueChange,
	placeholder = "Select option...",
	searchPlaceholder = "Search...",
	emptyText = "No option found.",
	multiple = false,
	selectedValues = [],
	onSelectedValuesChange,
	searchFn,
	defaultLimit = 10,
}: ComboboxProps) {
	const [open, setOpen] = React.useState(false);
	const [search, setSearch] = React.useState("");
	const [searchResults, setSearchResults] = React.useState<ComboboxOption[]>(
		[],
	);
	const [isSearching, setIsSearching] = React.useState(false);
	const debounceTimerRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

	// Use search results if searchFn is provided and search is active, otherwise use static options
	const options =
		searchFn && search
			? searchResults
			: searchFn && !search
				? staticOptions.slice(0, defaultLimit)
				: staticOptions;

	// Debounced search function
	React.useEffect(() => {
		if (!searchFn) return;

		// Clear previous timer
		if (debounceTimerRef.current) {
			clearTimeout(debounceTimerRef.current);
		}

		// If search is empty, reset to default options
		if (!search.trim()) {
			setSearchResults([]);
			setIsSearching(false);
			return;
		}

		// Set loading state
		setIsSearching(true);

		// Debounce the search
		debounceTimerRef.current = setTimeout(async () => {
			try {
				const results = await searchFn(search);
				setSearchResults(results);
			} catch (error) {
				console.error("Search error:", error);
				setSearchResults([]);
			} finally {
				setIsSearching(false);
			}
		}, 300);

		return () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}
		};
	}, [search, searchFn]);

	// Reset search when popover closes
	React.useEffect(() => {
		if (!open) {
			setSearch("");
			setSearchResults([]);
		}
	}, [open]);

	if (multiple) {
		return (
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						role="combobox"
						aria-expanded={open}
						className="w-full justify-between"
					>
						{selectedValues.length > 0
							? `${selectedValues.length} selected`
							: placeholder}
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-full p-0" align="start">
					<Command shouldFilter={!searchFn}>
						<CommandInput
							placeholder={searchPlaceholder}
							value={search}
							onValueChange={setSearch}
						/>
						<CommandList>
							{isSearching ? (
								<div className="flex items-center justify-center py-6">
									<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
								</div>
							) : (
								<>
									<CommandEmpty>{emptyText}</CommandEmpty>
									<CommandGroup>
										{options.map((option) => {
											const isSelected = selectedValues.includes(option.value);
											return (
												<CommandItem
													key={option.value}
													value={option.value}
													onSelect={() => {
														const newValues = isSelected
															? selectedValues.filter((v) => v !== option.value)
															: [...selectedValues, option.value];
														onSelectedValuesChange?.(newValues);
													}}
												>
													<Check
														className={cn(
															"mr-2 h-4 w-4",
															isSelected ? "opacity-100" : "opacity-0",
														)}
													/>
													{option.label}
												</CommandItem>
											);
										})}
									</CommandGroup>
								</>
							)}
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		);
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="w-full justify-between"
				>
					{value
						? options.find((option) => option.value === value)?.label
						: placeholder}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-full p-0" align="start">
				<Command shouldFilter={!searchFn}>
					<CommandInput
						placeholder={searchPlaceholder}
						value={search}
						onValueChange={setSearch}
					/>
					<CommandList>
						{isSearching ? (
							<div className="flex items-center justify-center py-6">
								<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
							</div>
						) : (
							<>
								<CommandEmpty>{emptyText}</CommandEmpty>
								<CommandGroup>
									{options.map((option) => (
										<CommandItem
											key={option.value}
											value={option.value}
											onSelect={(currentValue) => {
												onValueChange?.(
													currentValue === value ? "" : currentValue,
												);
												setOpen(false);
											}}
										>
											<Check
												className={cn(
													"mr-2 h-4 w-4",
													value === option.value ? "opacity-100" : "opacity-0",
												)}
											/>
											{option.label}
										</CommandItem>
									))}
								</CommandGroup>
							</>
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
