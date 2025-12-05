"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
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
	useSponsorship,
	useSponsorshipFormData,
	useUpdateSponsorship,
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

interface EditSponsorshipFormProps {
	sponsorshipId: string | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function EditSponsorshipForm({
	sponsorshipId,
	open,
	onOpenChange,
}: EditSponsorshipFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { data: sponsorshipData, isLoading: isLoadingSponsorship } =
		useSponsorship(sponsorshipId);
	const { toolOptions } = useSponsorshipFormData();
	const updateMutation = useUpdateSponsorship(sponsorshipId);

	const form = useForm<SponsorshipFormValues>({
		resolver: zodResolver(sponsorshipFormSchema),
		defaultValues: defaultSponsorshipFormValues,
	});

	useEffect(() => {
		if (!open) {
			form.reset(defaultSponsorshipFormValues);
		}
	}, [open, form]);

	useEffect(() => {
		if (sponsorshipData && open) {
			const startDate = new Date(sponsorshipData.startDate);
			const endDate = new Date(sponsorshipData.endDate);

			form.reset({
				toolId: sponsorshipData.toolId,
				tier: sponsorshipData.tier,
				startDate,
				endDate,
				isActive: sponsorshipData.isActive,
				priorityWeight: sponsorshipData.priorityWeight,
				paymentStatus: sponsorshipData.paymentStatus,
			});
		}
	}, [sponsorshipData, open, form]);

	const onSubmit = async (data: SponsorshipFormValues) => {
		if (!sponsorshipId) return;

		setIsSubmitting(true);
		try {
			await updateMutation.mutateAsync(
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
					<DrawerTitle>Edit Sponsorship</DrawerTitle>
					<DrawerDescription>
						Update sponsorship details. Fill in all required fields.
					</DrawerDescription>
				</DrawerHeader>

				{isLoadingSponsorship ? (
					<div className="flex flex-1 items-center justify-center">
						<div className="flex flex-col items-center gap-2">
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
							<span className="text-muted-foreground text-sm">
								Loading sponsorship data...
							</span>
						</div>
					</div>
				) : (
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="flex min-h-0 flex-1 flex-col"
					>
						<div className="no-scrollbar flex-1 overflow-y-auto px-4 py-4">
							<FieldGroup>
								<FieldSet>
									<FieldGroup>
										<SponsorshipToolField
											form={form}
											toolOptions={toolOptions}
										/>
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
										disabled={isSubmitting || updateMutation.isPending}
									>
										Cancel
									</Button>
								</DrawerClose>
								<Button
									type="submit"
									disabled={isSubmitting || updateMutation.isPending}
								>
									{(isSubmitting || updateMutation.isPending) && (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									)}
									Update Sponsorship
								</Button>
							</div>
						</DrawerFooter>
					</form>
				)}
			</DrawerContent>
		</Drawer>
	);
}
