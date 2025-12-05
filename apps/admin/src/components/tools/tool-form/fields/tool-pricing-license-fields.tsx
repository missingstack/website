"use client";

import {
	LICENSE_OPTIONS,
	PRICING_OPTIONS,
} from "@missingstack/api/constants/enums";
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
import { formatPricingDisplay } from "~/lib/utils";
import type { ToolFormValues } from "../shared/tool-form-schema";

interface ToolPricingLicenseFieldsProps {
	form: UseFormReturn<ToolFormValues>;
	toolId?: string | null;
}

const pricingOptions = PRICING_OPTIONS;
const licenseOptions = LICENSE_OPTIONS;

export function ToolPricingLicenseFields({
	form,
	toolId,
}: ToolPricingLicenseFieldsProps) {
	return (
		<div className="grid grid-cols-2 gap-4">
			<Field>
				<FieldLabel htmlFor="pricing">Pricing *</FieldLabel>
				<Select
					key={`pricing-${toolId ?? "new"}-${form.watch("pricing")}`}
					value={form.watch("pricing")}
					onValueChange={(value) => {
						form.setValue("pricing", value as ToolFormValues["pricing"], {
							shouldValidate: true,
						});
					}}
				>
					<SelectTrigger id="pricing">
						<SelectValue placeholder="Select pricing" />
					</SelectTrigger>
					<SelectContent>
						{pricingOptions.map((option) => (
							<SelectItem key={option} value={option}>
								{formatPricingDisplay(option)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<FieldError errors={[form.formState.errors.pricing]} />
			</Field>

			<Field>
				<FieldLabel htmlFor="license">License</FieldLabel>
				<Select
					key={`license-${toolId ?? "new"}-${form.watch("license") ?? ""}`}
					value={form.watch("license") ?? undefined}
					onValueChange={(value) => {
						form.setValue(
							"license",
							(value || undefined) as ToolFormValues["license"],
							{ shouldValidate: true },
						);
					}}
				>
					<SelectTrigger id="license">
						<SelectValue placeholder="Select license (optional)" />
					</SelectTrigger>
					<SelectContent>
						{licenseOptions.map((option) => (
							<SelectItem key={option} value={option}>
								{option.toUpperCase()}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<FieldDescription>Optional license type for the tool</FieldDescription>
				<FieldError errors={[form.formState.errors.license]} />
			</Field>
		</div>
	);
}
