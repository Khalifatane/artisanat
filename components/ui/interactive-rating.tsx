"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";

type InteractiveRatingProps = {
	productId: string;
	defaultRating: number;
	defaultReviewCount: number;
};

type StoredRating = {
	rating: number;
	reviewCount: number;
};

export function InteractiveRating({
	productId,
	defaultRating,
	defaultReviewCount,
}: InteractiveRatingProps) {
	const [rating, setRating] = useState(defaultRating);
	const [reviewCount, setReviewCount] = useState(defaultReviewCount);
	const [hovered, setHovered] = useState<number | null>(null);

	useEffect(() => {
		const stored = localStorage.getItem(`rating-${productId}`);
		if (!stored) return;
		try {
			const parsed = JSON.parse(stored) as StoredRating;
			if (typeof parsed.rating === "number" && typeof parsed.reviewCount === "number") {
				setRating(parsed.rating);
				setReviewCount(parsed.reviewCount);
			}
		} catch {
			// ignore invalid storage
		}
	}, [productId]);

	const handleClick = (value: number) => {
		const newCount = reviewCount + 1;
		const newRating = Number(((rating * reviewCount + value) / newCount).toFixed(1));

		setRating(newRating);
		setReviewCount(newCount);

		localStorage.setItem(
			`rating-${productId}`,
			JSON.stringify({ rating: newRating, reviewCount: newCount }),
		);
	};

	return (
		<div className="flex items-center gap-2 mt-2">
			<div className="flex">
				{[1, 2, 3, 4, 5].map((star) => (
					<Star
						key={star}
						onClick={() => handleClick(star)}
						onMouseEnter={() => setHovered(star)}
						onMouseLeave={() => setHovered(null)}
						className={`h-5 w-5 cursor-pointer transition ${
							(hovered ?? rating) >= star
								? "fill-yellow-400 text-yellow-400"
								: "text-gray-300"
						}`}
					/>
				))}
			</div>

			<span className="text-sm text-muted-foreground">
				{rating} ({reviewCount} reviews)
			</span>
		</div>
	);
}
