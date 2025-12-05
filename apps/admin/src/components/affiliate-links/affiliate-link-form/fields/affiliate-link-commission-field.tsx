"use client";

import type { UseFormReturn } from "react-hook-form";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import type { AffiliateLinkFormValues } from "../shared/affiliate-link-form-schema";

interface AffiliateLinkCommissionFieldProps {
	form: UseFormReturn<AffiliateLinkFormValues>;
}

export function AffiliateLinkCommissionField({
	form,
}: AffiliateLinkCommissionFieldProps) {
	return (
		<Field>
			<FieldLabel htmlFor="commissionRate">Commission Rate</FieldLabel>
			<Input
				id="commissionRate"
				type="number"
				step="0.01"
				min="0"
				max="1"
				{...form.register("commissionRate", {
					valueAsNumber: true,
				})}
				placeholder="0.20"
			/>
			<FieldDescription>
				Commission rate as decimal (e.g., 0.20 = 20%)
			</FieldDescription>
			<FieldError errors={[form.formState.errors.commissionRate]} />
		</Field>
	);
}
