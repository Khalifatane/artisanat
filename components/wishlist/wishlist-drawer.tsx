"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/app/wishlist/wishlist-context";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { YnsLink } from "@/components/yns-link";
import { CURRENCY, LOCALE } from "@/lib/constants";
import { formatMoney } from "@/lib/money";
import { YNSImage } from "@/lib/yns-image";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function WishlistDrawer({ open, onOpenChange }: Props) {
	const { items, removeFromWishlist } = useWishlist();

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="flex flex-col w-full sm:max-w-lg">
				<SheetHeader className="border-b border-border pb-4">
					<SheetTitle className="flex items-center gap-2">
						<Heart className="h-5 w-5" />
						Wishlist
						{items.length > 0 && (
							<span className="text-sm font-normal text-muted-foreground">({items.length} items)</span>
						)}
					</SheetTitle>
				</SheetHeader>

				{items.length === 0 ? (
					<div className="flex-1 flex flex-col items-center justify-center gap-4 py-12">
						<div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
							<Heart className="h-10 w-10 text-muted-foreground" />
						</div>
						<div className="text-center">
							<p className="text-lg font-medium">Your Wishlist is empty</p>
							<p className="text-sm text-muted-foreground mt-1">Save products to find them here</p>
						</div>
						<Button variant="outline" onClick={() => onOpenChange(false)}>
							Continue shopping
						</Button>
					</div>
				) : (
					<>
						<ScrollArea className="flex-1 px-4">
							<div className="divide-y divide-border">
								{items.map((item) => (
									<div key={item.id} className="flex gap-3 py-4">
										<YnsLink
											prefetch={false}
											href={`/product/${item.slug}`}
											onClick={() => onOpenChange(false)}
											className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-secondary"
										>
											{item.image && (
												<YNSImage
													src={item.image}
													alt={item.name}
													fill
													className="object-cover"
													sizes="80px"
												/>
											)}
										</YnsLink>

										<div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
											<div className="flex items-start justify-between gap-2">
												<YnsLink
													prefetch={false}
													href={`/product/${item.slug}`}
													onClick={() => onOpenChange(false)}
													className="text-sm font-medium leading-tight text-foreground hover:underline line-clamp-2"
												>
													{item.name}
												</YnsLink>
												<button
													type="button"
													onClick={() => removeFromWishlist(item.id)}
													className="shrink-0 text-xs text-red-500 hover:text-red-600 transition-colors"
												>
													Remove
												</button>
											</div>

											{item.price ? (
												<p className="text-sm font-semibold">
													{formatMoney({
														amount: BigInt(item.price),
														currency: CURRENCY,
														locale: LOCALE,
													})}
												</p>
											) : null}
										</div>
									</div>
								))}
							</div>
						</ScrollArea>

						<SheetFooter className="border-t border-border pt-4 mt-auto">
							<div className="w-full space-y-4">
								<Button asChild className="w-full h-12 text-base font-medium">
									<YnsLink prefetch={false} href="/wishlist" onClick={() => onOpenChange(false)}>
										View Wishlist
									</YnsLink>
								</Button>
								<button
									type="button"
									onClick={() => onOpenChange(false)}
									className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
								>
									Continue shopping
								</button>
							</div>
						</SheetFooter>
					</>
				)}
			</SheetContent>
		</Sheet>
	);
}
