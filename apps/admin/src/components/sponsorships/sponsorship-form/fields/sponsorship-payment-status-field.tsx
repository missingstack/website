"use client";

import type { UseFormReturn } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import type { SponsorshipFormValues } from "../shared/sponsorship-form-schema";

interface SponsorshipPaymentStatusFieldProps {
	form: UseFormReturn<SponsorshipFormValues>;
}

export function SponsorshipPaymentStatusField({
	form,
}: SponsorshipPaymentStatusFieldProps) {
	return (
		<Field>
			<FieldLabel htmlFor="paymentStatus">Payment Status *</FieldLabel>
			<Select
				value={form.watch("paymentStatus")}
				onValueChange={(value) =>
					form.setValue(
						"paymentStatus",
						value as SponsorshipFormValues["paymentStatus"],
					)
				}
			>
				<SelectTrigger id="paymentStatus">
					<SelectValue placeholder="Select payment status" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="pending">Pending</SelectItem>
					<SelectItem value="completed">Completed</SelectItem>
					<SelectItem value="failed">Failed</SelectItem>
					<SelectItem value="refunded">Refunded</SelectItem>
				</SelectContent>
			</Select>
			<FieldError errors={[form.formState.errors.paymentStatus]} />
		</Field>
	);
}
