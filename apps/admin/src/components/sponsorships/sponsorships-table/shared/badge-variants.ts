export function getTierBadgeVariant(
	tier: string,
): "default" | "blue" | "secondary" | "outline" {
	switch (tier) {
		case "enterprise":
			return "default";
		case "premium":
			return "blue";
		case "basic":
			return "secondary";
		default:
			return "outline";
	}
}

export function getPaymentStatusBadgeVariant(
	status: string,
): "default" | "secondary" | "destructive" | "outline" {
	switch (status) {
		case "completed":
			return "default";
		case "pending":
			return "secondary";
		case "failed":
			return "destructive";
		case "refunded":
			return "outline";
		default:
			return "outline";
	}
}
