"use client";

import type { UseFormReturn } from "react-hook-form";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import type { SponsorshipFormValues } from "../shared/sponsorship-form-schema";

interface SponsorshipPriorityFieldProps {
	form: UseFormReturn<SponsorshipFormValues>;
}

export function SponsorshipPriorityField({
	form,
}: SponsorshipPriorityFieldProps) {
	return (
		<Field>
			<FieldLabel htmlFor="priorityWeight">Priority Weight</FieldLabel>
			<Input
				id="priorityWeight"
				type="number"
				min="0"
				{...form.register("priorityWeight", {
					valueAsNumber: true,
				})}
				placeholder="0"
			/>
			<FieldDescription>
				Higher values appear first in rankings (default: 0)
			</FieldDescription>
			<FieldError errors={[form.formState.errors.priorityWeight]} />
		</Field>
	);
}
