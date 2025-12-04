"use client";

import { format } from "date-fns";
import { CalendarIcon, ChevronDownIcon } from "lucide-react";
import * as React from "react";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";

interface DatePickerProps {
	date?: Date;
	onDateChange: (date: Date | undefined) => void;
	placeholder?: string;
	disabled?: boolean;
	minDate?: Date;
	className?: string;
}

export function DatePicker({
	date,
	onDateChange,
	placeholder = "Pick a date",
	disabled = false,
	minDate,
	className,
}: DatePickerProps) {
	const [open, setOpen] = React.useState(false);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className={cn(
						"w-full justify-between text-left font-normal",
						!date && "text-muted-foreground",
						className,
					)}
					disabled={disabled}
				>
					<div className="flex items-center">
						<CalendarIcon className="mr-2 h-4 w-4" />
						{date ? format(date, "PPP") : <span>{placeholder}</span>}
					</div>
					<ChevronDownIcon className="ml-2 h-4 w-4 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<Calendar
					mode="single"
					selected={date}
					onSelect={(selectedDate) => {
						onDateChange(selectedDate);
						setOpen(false);
					}}
					disabled={minDate ? { before: minDate } : undefined}
					captionLayout="dropdown"
					initialFocus
				/>
			</PopoverContent>
		</Popover>
	);
}
