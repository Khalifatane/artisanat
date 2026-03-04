"use client";

import { X } from "lucide-react";
import { useWishlist } from "@/app/wishlist/wishlist-context";
import { YnsLink } from "@/components/yns-link";
import { formatMoney } from "@/lib/money";
import { CURRENCY, LOCALE } from "@/lib/constants";
import { YNSImage } from "@/lib/yns-image";

export default function WishlistPage() {
	const { items, removeFromWishlist } = useWishlist();

	if (items.length === 0) {
		return (
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
				<h1 className="text-2xl font-semibold mb-2">My Wishlist</h1>
				<p className="text-muted-foreground">Your saved products will appear here.</p>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
			<h1 className="text-2xl font-semibold mb-6">My Wishlist</h1>
			<div className="space-y-4">
				{items.map((item) => (
					<div key={item.id} className="flex items-center gap-4 border border-border rounded-lg p-4">
						<YnsLink href={`/product/${item.slug}`} prefetch={false} className="shrink-0">
							<div className="relative h-16 w-16 overflow-hidden rounded-lg bg-secondary">
								{item.image && (
									<YNSImage
										src={item.image}
										alt={item.name}
										fill
										className="object-cover"
										sizes="64px"
									/>
								)}
							</div>
						</YnsLink>
						<div className="flex-1 min-w-0">
							<YnsLink href={`/product/${item.slug}`} prefetch={false} className="font-medium">
								{item.name}
							</YnsLink>
							{item.price ? (
								<p className="text-sm text-muted-foreground">
									{formatMoney({ amount: BigInt(item.price), currency: CURRENCY, locale: LOCALE })}
								</p>
							) : null}
						</div>
						<button
							type="button"
							onClick={() => removeFromWishlist(item.id)}
							className="p-2 text-muted-foreground hover:text-foreground"
							aria-label="Remove from Wishlist"
						>
							<X className="h-4 w-4" />
						</button>
					</div>
				))}
			</div>
		</div>
	);
}
