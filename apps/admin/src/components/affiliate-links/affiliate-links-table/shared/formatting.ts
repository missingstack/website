export function formatCommissionRate(rate: string | null): string {
	if (!rate) return "0%";
	const num = Number.parseFloat(rate);
	return `${(num * 100).toFixed(2)}%`;
}

export function formatRevenue(cents: number | null): string {
	if (!cents) return "$0.00";
	return `$${(cents / 100).toFixed(2)}`;
}
