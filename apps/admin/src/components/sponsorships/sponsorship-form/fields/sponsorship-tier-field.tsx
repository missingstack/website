"use client";

import type { UseFormReturn } from "react-hook-form";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "~/components/ui/field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import type { SponsorshipFormValues } from "../shared/sponsorship-form-schema";

interface SponsorshipTierFieldProps {
	form: UseFormReturn<SponsorshipFormValues>;
}

export function SponsorshipTierField({ form }: SponsorshipTierFieldProps) {
	return (
		<Field>
			<FieldLabel htmlFor="tier">Tier *</FieldLabel>
			<Select
				value={form.watch("tier")}
				onValueChange={(value) =>
					form.setValue("tier", value as SponsorshipFormValues["tier"])
				}
			>
				<SelectTrigger id="tier">
					<SelectValue placeholder="Select tier" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="basic">Basic</SelectItem>
					<SelectItem value="premium">Premium</SelectItem>
					<SelectItem value="enterprise">Enterprise</SelectItem>
				</SelectContent>
			</Select>
			<FieldDescription>
				Sponsorship tier level (basic, premium, enterprise)
			</FieldDescription>
			<FieldError errors={[form.formState.errors.tier]} />
		</Field>
	);
}
