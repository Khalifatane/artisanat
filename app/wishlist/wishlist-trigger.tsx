"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useWishlist } from "@/app/wishlist/wishlist-context";
import { WishlistDrawer } from "@/components/wishlist/wishlist-drawer";

export function WishlistTrigger() {
	const { items } = useWishlist();
	const [open, setOpen] = useState(false);

	return (
		<>
			<button
				type="button"
				onClick={() => setOpen(true)}
				className="relative p-2 text-muted-foreground hover:text-red-500 transition-colors"
				aria-label="Ouvrir la liste de souhaits"
			>
				<Heart className="w-6 h-6" />
				{items.length > 0 && (
					<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
						{items.length}
					</span>
				)}
			</button>
			<WishlistDrawer open={open} onOpenChange={setOpen} />
		</>
	);
}
