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
	useAffiliateLink,
	useAffiliateLinkFormData,
	useUpdateAffiliateLink,
} from "~/hooks/affiliate-links";
import {
	AffiliateLinkCommissionField,
	AffiliateLinkPrimaryField,
	AffiliateLinkToolField,
	AffiliateLinkTrackingField,
	AffiliateLinkUrlField,
} from "./fields";
import {
	type AffiliateLinkFormValues,
	affiliateLinkFormSchema,
	defaultAffiliateLinkFormValues,
} from "./shared/affiliate-link-form-schema";

interface EditAffiliateLinkFormProps {
	affiliateLinkId: string | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function EditAffiliateLinkForm({
	affiliateLinkId,
	open,
	onOpenChange,
}: EditAffiliateLinkFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { data: affiliateLinkData, isLoading: isLoadingAffiliateLink } =
		useAffiliateLink(affiliateLinkId);
	const { toolOptions } = useAffiliateLinkFormData();
	const updateMutation = useUpdateAffiliateLink(affiliateLinkId);

	const form = useForm<AffiliateLinkFormValues>({
		resolver: zodResolver(affiliateLinkFormSchema),
		defaultValues: defaultAffiliateLinkFormValues,
	});

	useEffect(() => {
		if (!open) {
			form.reset(defaultAffiliateLinkFormValues);
		}
	}, [open, form]);

	useEffect(() => {
		if (affiliateLinkData && open) {
			form.reset({
				toolId: affiliateLinkData.toolId,
				affiliateUrl: affiliateLinkData.affiliateUrl,
				commissionRate: affiliateLinkData.commissionRate
					? Number.parseFloat(affiliateLinkData.commissionRate)
					: 0,
				trackingCode: affiliateLinkData.trackingCode ?? "",
				isPrimary: affiliateLinkData.isPrimary,
			});
		}
	}, [affiliateLinkData, open, form]);

	const onSubmit = async (data: AffiliateLinkFormValues) => {
		if (!affiliateLinkId) return;

		setIsSubmitting(true);
		try {
			await updateMutation.mutateAsync(
				{
					toolId: data.toolId,
					affiliateUrl: data.affiliateUrl,
					commissionRate: data.commissionRate,
					trackingCode: data.trackingCode || undefined,
					isPrimary: data.isPrimary,
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
					<DrawerTitle>Edit Affiliate Link</DrawerTitle>
					<DrawerDescription>
						Update affiliate link details. Fill in all required fields.
					</DrawerDescription>
				</DrawerHeader>

				{isLoadingAffiliateLink ? (
					<div className="flex flex-1 items-center justify-center">
						<div className="flex flex-col items-center gap-2">
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
							<span className="text-muted-foreground text-sm">
								Loading affiliate link data...
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
										<AffiliateLinkToolField
											form={form}
											toolOptions={toolOptions}
										/>
										<AffiliateLinkUrlField form={form} />
										<AffiliateLinkCommissionField form={form} />
										<AffiliateLinkTrackingField form={form} />
										<AffiliateLinkPrimaryField form={form} />
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
									Update Affiliate Link
								</Button>
							</div>
						</DrawerFooter>
					</form>
				)}
			</DrawerContent>
		</Drawer>
	);
}
