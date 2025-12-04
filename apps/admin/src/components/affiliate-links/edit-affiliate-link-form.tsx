"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Combobox } from "~/components/ui/combobox";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "~/components/ui/drawer";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSet,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Switch } from "~/components/ui/switch";
import { api } from "~/lib/eden";

// Form schema
const affiliateLinkFormSchema = z.object({
	toolId: z.string().uuid("Please select a tool"),
	affiliateUrl: z.string().url("Please enter a valid URL").max(512),
	commissionRate: z.number().min(0).max(1),
	trackingCode: z.string().max(100).optional(),
	isPrimary: z.boolean(),
});

type AffiliateLinkFormValues = z.infer<typeof affiliateLinkFormSchema>;

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
	const queryClient = useQueryClient();
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Fetch default tools (top 10)
	const { data: toolsData } = useQuery({
		queryKey: ["tools", "default"],
		queryFn: async () => {
			const { data, error } = await api.v1.tools.get({
				query: { limit: 10 },
			});
			if (error)
				throw new Error(error.value.message ?? "Failed to fetch tools");
			return data;
		},
	});

	// Fetch affiliate link data
	const { data: affiliateLinkData, isLoading: isLoadingAffiliateLink } =
		useQuery({
			queryKey: ["affiliateLink", affiliateLinkId],
			queryFn: async () => {
				if (!affiliateLinkId) return null;
				const { data, error } = await api.v1["affiliate-links"]({
					id: affiliateLinkId,
				}).get();
				if (error)
					throw new Error(
						error.value.message ?? "Failed to fetch affiliate link",
					);
				return data;
			},
			enabled: !!affiliateLinkId && open,
		});

	const form = useForm<AffiliateLinkFormValues>({
		resolver: zodResolver(affiliateLinkFormSchema),
		defaultValues: {
			toolId: "",
			affiliateUrl: "",
			commissionRate: 0,
			trackingCode: "",
			isPrimary: false,
		},
	});

	// Populate form when affiliate link data loads
	useEffect(() => {
		if (affiliateLinkData) {
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
	}, [affiliateLinkData, form]);

	const onSubmit = async (data: AffiliateLinkFormValues) => {
		if (!affiliateLinkId) return;
		setIsSubmitting(true);
		try {
			const { error } = await api.v1["affiliate-links"]({
				id: affiliateLinkId,
			}).put({
				toolId: data.toolId,
				affiliateUrl: data.affiliateUrl,
				commissionRate: data.commissionRate,
				trackingCode: data.trackingCode || undefined,
				isPrimary: data.isPrimary,
			});

			if (error) {
				throw new Error(
					error.value.message ?? "Failed to update affiliate link",
				);
			}

			toast.success("Affiliate link updated successfully!");
			queryClient.resetQueries({ queryKey: ["adminAffiliateLinks"] });
			queryClient.resetQueries({
				queryKey: ["affiliateLink", affiliateLinkId],
			});
			onOpenChange(false);
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to update affiliate link",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const toolOptions =
		toolsData?.items.map((tool) => ({
			value: tool.id,
			label: tool.name,
		})) ?? [];

	// Search function for API-based searching
	const searchTools = async (search: string) => {
		const { data, error } = await api.v1.tools.get({
			query: { search, limit: 10 },
		});
		if (error) throw new Error(error.value.message ?? "Failed to search tools");
		return (
			data?.items.map((tool) => ({
				value: tool.id,
				label: tool.name,
			})) ?? []
		);
	};

	if (isLoadingAffiliateLink) {
		return (
			<Drawer open={open} onOpenChange={onOpenChange} direction="right">
				<DrawerContent className="flex h-full flex-col data-[vaul-drawer-direction=right]:max-w-lg! sm:data-[vaul-drawer-direction=right]:max-w-lg!">
					<DrawerHeader className="shrink-0 border-b">
						<DrawerTitle>Edit Affiliate Link</DrawerTitle>
						<DrawerDescription>
							Loading affiliate link data...
						</DrawerDescription>
					</DrawerHeader>
					<div className="flex flex-1 items-center justify-center">
						<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
					</div>
				</DrawerContent>
			</Drawer>
		);
	}

	return (
		<Drawer open={open} onOpenChange={onOpenChange} direction="right">
			<DrawerContent className="flex h-full flex-col data-[vaul-drawer-direction=right]:max-w-lg! sm:data-[vaul-drawer-direction=right]:max-w-lg!">
				<DrawerHeader className="shrink-0 border-b">
					<DrawerTitle>Edit Affiliate Link</DrawerTitle>
					<DrawerDescription>
						Update affiliate link details. Fill in all required fields.
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
									<Field>
										<FieldLabel htmlFor="toolId">Tool *</FieldLabel>
										<Combobox
											options={toolOptions}
											value={form.watch("toolId")}
											onValueChange={(value) => form.setValue("toolId", value)}
											placeholder="Select a tool"
											searchPlaceholder="Search tools..."
											searchFn={searchTools}
											defaultLimit={10}
										/>
										<FieldDescription>
											Select the tool for this affiliate link
										</FieldDescription>
										<FieldError errors={[form.formState.errors.toolId]} />
									</Field>

									<Field>
										<FieldLabel htmlFor="affiliateUrl">
											Affiliate URL *
										</FieldLabel>
										<Input
											id="affiliateUrl"
											type="url"
											{...form.register("affiliateUrl")}
											placeholder="https://example.com/affiliate-link"
										/>
										<FieldDescription>
											The affiliate URL for this tool
										</FieldDescription>
										<FieldError errors={[form.formState.errors.affiliateUrl]} />
									</Field>

									<Field>
										<FieldLabel htmlFor="commissionRate">
											Commission Rate
										</FieldLabel>
										<Input
											id="commissionRate"
											type="number"
											step="0.01"
											min="0"
											max="1"
											{...form.register("commissionRate", {
												valueAsNumber: true,
											})}
											placeholder="0.20"
										/>
										<FieldDescription>
											Commission rate as decimal (e.g., 0.20 = 20%)
										</FieldDescription>
										<FieldError
											errors={[form.formState.errors.commissionRate]}
										/>
									</Field>

									<Field>
										<FieldLabel htmlFor="trackingCode">
											Tracking Code
										</FieldLabel>
										<Input
											id="trackingCode"
											type="text"
											maxLength={100}
											{...form.register("trackingCode")}
											placeholder="Optional tracking code"
										/>
										<FieldDescription>
											Optional tracking code for analytics
										</FieldDescription>
										<FieldError errors={[form.formState.errors.trackingCode]} />
									</Field>

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
												onCheckedChange={(checked) =>
													form.setValue("isPrimary", checked)
												}
											/>
										</div>
										<FieldError errors={[form.formState.errors.isPrimary]} />
									</Field>
								</FieldGroup>
							</FieldSet>
						</FieldGroup>
					</div>

					<DrawerFooter className="shrink-0 border-t">
						<div className="flex gap-2">
							<DrawerClose asChild>
								<Button type="button" variant="outline" disabled={isSubmitting}>
									Cancel
								</Button>
							</DrawerClose>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Updating...
									</>
								) : (
									"Update Affiliate Link"
								)}
							</Button>
						</div>
					</DrawerFooter>
				</form>
			</DrawerContent>
		</Drawer>
	);
}
