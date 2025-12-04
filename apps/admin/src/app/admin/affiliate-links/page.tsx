"use client";

import { Plus } from "lucide-react";
import { Suspense, useState } from "react";
import { AffiliateLinksTable } from "~/components/affiliate-links/affiliate-links-table";
import { NewAffiliateLinkForm } from "~/components/affiliate-links/new-affiliate-link-form";
import { TableSkeleton } from "~/components/table-skeleton";
import { Button } from "~/components/ui/button";

export default function AdminAffiliateLinksPage() {
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);

	return (
		<div className="flex flex-1 flex-col gap-4">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="font-bold text-2xl tracking-tight">Affiliate Links</h2>
					<p className="text-muted-foreground text-sm">
						Manage tool affiliate links and maximize revenue
					</p>
				</div>
				<Button onClick={() => setIsDrawerOpen(true)}>
					<Plus className="mr-2 h-4 w-4" />
					New Affiliate Link
				</Button>
			</div>
			<Suspense fallback={<TableSkeleton columnCount={8} />}>
				<AffiliateLinksTable />
			</Suspense>
			<Suspense fallback={null}>
				<NewAffiliateLinkForm
					open={isDrawerOpen}
					onOpenChange={setIsDrawerOpen}
				/>
			</Suspense>
		</div>
	);
}
