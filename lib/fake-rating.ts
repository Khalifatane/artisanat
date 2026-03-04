export function generateFakeRating(productId: string) {
	const hash = Array.from(productId).reduce(
		(acc, char) => char.charCodeAt(0) + ((acc << 5) - acc),
		0,
	);

	const normalized = Math.abs(hash % 200) / 100;
	const rating = 3 + normalized;
	const reviewCount = 20 + (Math.abs(hash) % 180);

	return {
		rating: Number(rating.toFixed(1)),
		reviewCount,
	};
}
