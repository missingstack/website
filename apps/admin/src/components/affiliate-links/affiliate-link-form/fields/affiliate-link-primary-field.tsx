"use client";

import type { UseFormReturn } from "react-hook-form";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "~/components/ui/field";
import { Switch } from "~/components/ui/switch";
import type { AffiliateLinkFormValues } from "../shared/affiliate-link-form-schema";

interface AffiliateLinkPrimaryFieldProps {
	form: UseFormReturn<AffiliateLinkFormValues>;
}

export function AffiliateLinkPrimaryField({
	form,
}: AffiliateLinkPrimaryFieldProps) {
	return (
		<Field>
			<div className="flex items-center justify-between">
				<div className="space-y-0.5">
					<FieldLabel htmlFor="isPrimary">Primary</FieldLabel>
					<FieldDescription>
						Mark this as the primary affiliate link for the tool
					</FieldDescription>
				</div>
				<Switch
					id="isPrimary"
					checked={form.watch("isPrimary")}
					onCheckedChange={(checked) => form.setValue("isPrimary", checked)}
				/>
			</div>
			<FieldError errors={[form.formState.errors.isPrimary]} />
		</Field>
	);
}
