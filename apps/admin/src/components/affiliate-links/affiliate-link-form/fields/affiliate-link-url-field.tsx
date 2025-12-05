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

interface AffiliateLinkUrlFieldProps {
	form: UseFormReturn<AffiliateLinkFormValues>;
}

export function AffiliateLinkUrlField({ form }: AffiliateLinkUrlFieldProps) {
	return (
		<Field>
			<FieldLabel htmlFor="affiliateUrl">Affiliate URL *</FieldLabel>
			<Input
				id="affiliateUrl"
				type="url"
				{...form.register("affiliateUrl")}
				placeholder="https://example.com/affiliate-link"
			/>
			<FieldDescription>The affiliate URL for this tool</FieldDescription>
			<FieldError errors={[form.formState.errors.affiliateUrl]} />
		</Field>
	);
}
