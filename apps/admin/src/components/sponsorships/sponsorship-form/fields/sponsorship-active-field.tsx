"use client";

import type { UseFormReturn } from "react-hook-form";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "~/components/ui/field";
import { Switch } from "~/components/ui/switch";
import type { SponsorshipFormValues } from "../shared/sponsorship-form-schema";

interface SponsorshipActiveFieldProps {
	form: UseFormReturn<SponsorshipFormValues>;
}

export function SponsorshipActiveField({ form }: SponsorshipActiveFieldProps) {
	return (
		<Field>
			<div className="flex items-center justify-between">
				<div className="space-y-0.5">
					<FieldLabel htmlFor="isActive">Active</FieldLabel>
					<FieldDescription>
						Whether this sponsorship is currently active
					</FieldDescription>
				</div>
				<Switch
					id="isActive"
					checked={form.watch("isActive")}
					onCheckedChange={(checked) => form.setValue("isActive", checked)}
				/>
			</div>
			<FieldError errors={[form.formState.errors.isActive]} />
		</Field>
	);
}
