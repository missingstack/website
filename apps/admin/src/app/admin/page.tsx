import { AdminStats } from "~/components/admin/admin-stats";

export default function AdminDashboardPage() {
	return (
		<div className="flex flex-1 flex-col gap-4">
			<div>
				<h2 className="font-bold text-2xl tracking-tight">Dashboard</h2>
				<p className="text-muted-foreground text-sm">
					Welcome to the Missing Stack admin panel
				</p>
			</div>
			<AdminStats />
		</div>
	);
}
