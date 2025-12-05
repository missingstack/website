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

interface AffiliateLinkTrackingFieldProps {
	form: UseFormReturn<AffiliateLinkFormValues>;
}

export function AffiliateLinkTrackingField({
	form,
}: AffiliateLinkTrackingFieldProps) {
	return (
		<Field>
			<FieldLabel htmlFor="trackingCode">Tracking Code</FieldLabel>
			<Input
				id="trackingCode"
				type="text"
				maxLength={100}
				{...form.register("trackingCode")}
				placeholder="Optional tracking code"
			/>
			<FieldDescription>Optional tracking code for analytics</FieldDescription>
			<FieldError errors={[form.formState.errors.trackingCode]} />
		</Field>
	);
}
