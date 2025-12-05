"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "~/components/ui/drawer";
import { FieldGroup, FieldSet } from "~/components/ui/field";
import {
	useCreateSponsorship,
	useSponsorshipFormData,
} from "~/hooks/sponsorships";
import {
	SponsorshipActiveField,
	SponsorshipDateFields,
	SponsorshipPaymentStatusField,
	SponsorshipPriorityField,
	SponsorshipTierField,
	SponsorshipToolField,
} from "./fields";
import {
	type SponsorshipFormValues,
	defaultSponsorshipFormValues,
	sponsorshipFormSchema,
} from "./shared/sponsorship-form-schema";

interface NewSponsorshipFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function NewSponsorshipForm({
	open,
	onOpenChange,
}: NewSponsorshipFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { toolOptions } = useSponsorshipFormData();
	const createMutation = useCreateSponsorship();

	const form = useForm<SponsorshipFormValues>({
		resolver: zodResolver(sponsorshipFormSchema),
		defaultValues: defaultSponsorshipFormValues,
	});

	const onSubmit = async (data: SponsorshipFormValues) => {
		setIsSubmitting(true);
		try {
			await createMutation.mutateAsync(
				{
					toolId: data.toolId,
					tier: data.tier,
					startDate: data.startDate.toISOString(),
					endDate: data.endDate.toISOString(),
					isActive: data.isActive,
					priorityWeight: data.priorityWeight,
					paymentStatus: data.paymentStatus,
				},
				{
					onSuccess: () => {
						form.reset();
						onOpenChange(false);
					},
				},
			);
		} catch (_error) {
			// Error is handled by the mutation hook
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Drawer open={open} onOpenChange={onOpenChange} direction="right">
			<DrawerContent className="flex h-full flex-col data-[vaul-drawer-direction=right]:max-w-lg! sm:data-[vaul-drawer-direction=right]:max-w-lg!">
				<DrawerHeader className="shrink-0 border-b">
					<DrawerTitle>Create New Sponsorship</DrawerTitle>
					<DrawerDescription>
						Add a new sponsorship for a tool. Fill in all required fields.
					</DrawerDescription>
				</DrawerHeader>

				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="flex min-h-0 flex-1 flex-col"
				>
					<div className="no-scrollbar flex-1 overflow-y-auto px-4 py-4">
						<FieldGroup>
							<FieldSet>
								<FieldGroup>
									<SponsorshipToolField form={form} toolOptions={toolOptions} />
									<SponsorshipTierField form={form} />
									<div className="grid grid-cols-2 gap-4">
										<SponsorshipDateFields form={form} />
									</div>
									<SponsorshipPriorityField form={form} />
									<SponsorshipPaymentStatusField form={form} />
									<SponsorshipActiveField form={form} />
								</FieldGroup>
							</FieldSet>
						</FieldGroup>
					</div>

					<DrawerFooter className="shrink-0 border-t">
						<div className="flex gap-2">
							<DrawerClose asChild>
								<Button
									type="button"
									variant="outline"
									disabled={isSubmitting || createMutation.isPending}
								>
									Cancel
								</Button>
							</DrawerClose>
							<Button
								type="submit"
								disabled={isSubmitting || createMutation.isPending}
							>
								{(isSubmitting || createMutation.isPending) && (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								)}
								Create Sponsorship
							</Button>
						</div>
					</DrawerFooter>
				</form>
			</DrawerContent>
		</Drawer>
	);
}
