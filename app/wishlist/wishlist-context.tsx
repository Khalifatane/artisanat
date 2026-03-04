"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "yns_wishlist";

export type WishlistItem = {
	id: string;
	name: string;
	slug: string;
	image?: string | null;
	price?: string | null;
};

type WishlistContextValue = {
	items: WishlistItem[];
	addToWishlist: (item: WishlistItem) => void;
	removeFromWishlist: (id: string) => void;
	isInWishlist: (id: string) => boolean;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

type WishlistProviderProps = {
	children: ReactNode;
};

export function WishlistProvider({ children }: WishlistProviderProps) {
	const [items, setItems] = useState<WishlistItem[]>([]);

	useEffect(() => {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (!raw) return;
			const parsed = JSON.parse(raw) as WishlistItem[];
			if (Array.isArray(parsed)) {
				setItems(parsed);
			}
		} catch {
			// Ignore storage errors
		}
	}, []);

	useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
		} catch {
			// Ignore storage errors
		}
	}, [items]);

	const addToWishlist = useCallback((item: WishlistItem) => {
		setItems((prev) => {
			if (prev.some((entry) => entry.id === item.id)) return prev;
			return [...prev, item];
		});
	}, []);

	const removeFromWishlist = useCallback((id: string) => {
		setItems((prev) => prev.filter((item) => item.id !== id));
	}, []);

	const isInWishlist = useCallback((id: string) => items.some((item) => item.id === id), [items]);

	const value = useMemo(
		() => ({ items, addToWishlist, removeFromWishlist, isInWishlist }),
		[items, addToWishlist, removeFromWishlist, isInWishlist],
	);

	return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
	const context = useContext(WishlistContext);
	if (!context) {
		throw new Error("useWishlist must be used within a WishlistProvider");
	}
	return context;
}
