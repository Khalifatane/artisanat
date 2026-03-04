"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/app/wishlist/wishlist-context";
import { cn } from "@/lib/utils";

export type WishlistProduct = {
	id: string;
	name: string;
	slug: string;
	image?: string | null;
	price?: string | null;
};

export function AddToWishlistButton({ product }: { product: WishlistProduct }) {
	const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
	const exists = isInWishlist(product.id);

	return (
		<button
			type="button"
			onClick={(event) => {
				event.preventDefault();
				event.stopPropagation();
				return exists ? removeFromWishlist(product.id) : addToWishlist(product);
			}}
			aria-label={exists ? "Remove from Wishlist" : "Add to Wishlist"}
			className="rounded-full bg-background/90 backdrop-blur p-2 shadow-md transition hover:shadow-lg"
		>
			<Heart
				className={cn(
					"h-5 w-5 transition-colors",
					exists ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-500",
				)}
			/>
		</button>
	);
}
