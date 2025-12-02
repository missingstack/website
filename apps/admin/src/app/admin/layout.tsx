import { Suspense } from "react";
import { AdminHeader } from "~/components/admin/header";
import { AdminSidebar } from "~/components/admin/sidebar";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { Skeleton } from "~/components/ui/skeleton";

function SidebarSkeleton() {
	return (
		<div className="flex h-full w-64 flex-col">
			<div className="border-sidebar-border border-b p-4">
				<div className="flex items-center gap-2">
					<Skeleton className="h-8 w-8 rounded-lg" />
					<div className="flex flex-col gap-1">
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-3 w-16" />
					</div>
				</div>
			</div>
			<div className="flex-1 space-y-4 p-4">
				{["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6", "sk-7", "sk-8"].map(
					(skeletonId) => (
						<Skeleton key={skeletonId} className="h-10 w-full" />
					),
				)}
			</div>
		</div>
	);
}

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<SidebarProvider>
			<Suspense fallback={<SidebarSkeleton />}>
				<AdminSidebar />
			</Suspense>
			<SidebarInset>
				<AdminHeader />
				<div className="-p-4 flex flex-1 flex-col gap-4 p-4 pt-2">
					{children}
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
