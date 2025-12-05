"use client";

import { useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";
import { DatePicker } from "~/components/ui/date-picker";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "~/components/ui/field";
import type { SponsorshipFormValues } from "../shared/sponsorship-form-schema";

interface SponsorshipDateFieldsProps {
	form: UseFormReturn<SponsorshipFormValues>;
}

export function SponsorshipDateFields({ form }: SponsorshipDateFieldsProps) {
	// Get today's date for min date constraint
	const today = useMemo(() => {
		const date = new Date();
		date.setHours(0, 0, 0, 0);
		return date;
	}, []);

	const startDate = form.watch("startDate");
	const endDate = form.watch("endDate");

	return (
		<>
			<Field>
				<FieldLabel htmlFor="startDate">Start Date *</FieldLabel>
				<DatePicker
					date={startDate}
					onDateChange={(date) => {
						if (date) {
							form.setValue("startDate", date);
							// Reset end date if it's before the new start date
							if (endDate && endDate <= date) {
								form.setValue("endDate", undefined as unknown as Date);
							}
						}
					}}
					placeholder="Select start date"
					minDate={today}
				/>
				<FieldError errors={[form.formState.errors.startDate]} />
			</Field>

			<Field>
				<FieldLabel htmlFor="endDate">End Date *</FieldLabel>
				<DatePicker
					date={endDate}
					onDateChange={(date) => {
						if (date) {
							form.setValue("endDate", date);
						}
					}}
					placeholder="Select end date"
					minDate={startDate || today}
				/>
				<FieldDescription>Must be after start date</FieldDescription>
				<FieldError errors={[form.formState.errors.endDate]} />
			</Field>
		</>
	);
}
