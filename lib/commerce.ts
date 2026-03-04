import { cache } from "react";
import { toHTML } from "@portabletext/to-html";
import { getCartCookieJson, setCartCookie } from "@/lib/cookies";
import { CURRENCY } from "@/lib/constants";
import { sanityClient, urlFor } from "@/lib/sanity";
import type { CartLineItem } from "@/types/cart";

export type ProductVariant = {
	id: string;
	price: string;
	images: string[];
	size: string;
	color: string;
	stock: number;
	incomingStock?: number;
	restockDate?: string;
};

export type Product = {
	id: string;
	slug: string;
	name: string;
	summary?: string | null;
	images: string[];
	variants: ProductVariant[];
};

export type Collection = {
	id: string;
	slug: string;
	name: string;
	description?: string | null;
	image?: string | null;
	productCollections: { product: Product }[];
};

export type LegalPage = {
	id: string;
	title: string;
	path: string;
	content: string | null;
};

export type Cart = {
	id: string;
	lineItems: CartLineItem[];
};

type SanityProduct = {
	_id: string;
	title: string;
	name?: string | null;
	description?: string | null;
	price: number;
	slug?: { current?: string | null } | null;
	images?: unknown[] | null;
	image?: unknown | null;
	imagesUrls?: string[] | null;
	imageUrl?: string | null;
	variants?: {
		size?: string | null;
		color?: string | null;
		stock?: number | null;
		incomingStock?: number | null;
		restockDate?: string | null;
	}[] | null;
	[key: string]: unknown;
};

type SanityCollection = {
	_id: string;
	title: string;
	name?: string | null;
	description?: string | null;
	slug?: { current?: string | null } | null;
	image?: unknown | null;
	products?: SanityProduct[] | null;
	imageUrl?: string | null;
	[key: string]: unknown;
};

type SanityLegalPage = {
	_id: string;
	title: string;
	slug?: { current?: string | null } | null;
	content?: unknown;
};

const mapImages = (images: unknown[] | null | undefined) =>
	(images ?? [])
		.map((image) => {
			try {
				if (typeof image === "string") {
					return image;
				}
				return urlFor(image).width(1400).auto("format").url();
			} catch {
				return null;
			}
		})
		.filter((image): image is string => Boolean(image));

const collectImageValues = (value: unknown, bucket: unknown[], depth = 0) => {
	if (depth > 6) return;
	if (!value) return;

	if (Array.isArray(value)) {
		value.forEach((entry) => collectImageValues(entry, bucket, depth + 1));
		return;
	}

	if (typeof value === "string") {
		if (value.startsWith("http")) bucket.push(value);
		return;
	}

	if (typeof value === "object") {
		const record = value as Record<string, unknown>;
		if (record._type === "image" || "asset" in record) {
			bucket.push(record);
		}
		Object.values(record).forEach((entry) => collectImageValues(entry, bucket, depth + 1));
	}
};

const extractImagesFromDocument = (doc: Record<string, unknown>) => {
	const bucket: unknown[] = [];
	collectImageValues(doc, bucket);
	return bucket;
};

const mapProduct = (product: SanityProduct): Product => {
	const slug = product.slug?.current ?? product._id;
	const images = mapImages([
		...(product.images ?? []),
		...(product.image ? [product.image] : []),
		...(product.imagesUrls ?? []),
		...(product.imageUrl ? [product.imageUrl] : []),
		...extractImagesFromDocument(product),
	]);
	const price = Number.isFinite(product.price) ? Math.round(product.price) : 0;
	const rawVariants = product.variants ?? [];
	const mappedVariants =
		rawVariants.length > 0
			? rawVariants.map((variant, index) => {
					const size = variant.size?.trim() || "Default";
					const color = variant.color?.trim() || "Default";
					const stock = Number.isFinite(variant.stock) ? Math.max(0, Math.floor(variant.stock ?? 0)) : 50;
					const incomingStock = Number.isFinite(variant.incomingStock)
						? Math.max(0, Math.floor(variant.incomingStock ?? 0))
						: undefined;
					return {
						id: `${product._id}:${size}:${color}:${index}`,
						price: String(price),
						images,
						size,
						color,
						stock,
						incomingStock,
						restockDate: variant.restockDate ?? undefined,
					};
				})
			: [
					{
						id: `${product._id}:Default:Default:0`,
						price: String(price),
						images,
						size: "Default",
						color: "Default",
						stock: 50,
					},
				];

	return {
		id: product._id,
		slug,
		name: product.title ?? product.name ?? "Untitled",
		summary: product.description ?? null,
		images,
		variants: mappedVariants,
	};
};

const fetchProductBySlugOrId = cache(async (idOrSlug: string) => {
	const query = `*[_type == "product" && (slug.current == $value || _id == $value)][0]{
    ...,
    _id,
    title,
    name,
    description,
    price,
    slug,
    images,
    image,
    "imagesUrls": images[].asset->url,
    "imageUrl": image.asset->url,
    variants[]{size, color, stock, incomingStock, restockDate}
  }`;
	const product = await sanityClient.fetch<SanityProduct | null>(query, { value: idOrSlug });
	return product ? mapProduct(product) : null;
});

const fetchProducts = cache(async (limit?: number, search?: string) => {
	const query = `*[_type == "product" ${search ? "&& (title match $search || name match $search)" : ""}] | order(_createdAt desc)${
		typeof limit === "number" ? "[0...$limit]" : ""
	}{
    ...,
    _id,
    title,
    name,
    description,
    price,
    slug,
    images,
    image,
    "imagesUrls": images[].asset->url,
    "imageUrl": image.asset->url,
    variants[]{size, color, stock, incomingStock, restockDate}
  }`;

	const products = await sanityClient.fetch<SanityProduct[]>(query, {
		search: search ? `${search}*` : undefined,
		limit,
	});
	return products.map(mapProduct);
});

const fetchCollectionBySlugOrId = cache(async (idOrSlug: string) => {
	const query = `*[_type == "collection" && (slug.current == $value || _id == $value)][0]{
    ...,
    _id,
    title,
    name,
    description,
    slug,
    image,
    "imageUrl": image.asset->url,
    "products": products[]->{
      ...,
      _id,
      title,
      name,
      description,
      price,
      slug,
      images,
      image,
      "imagesUrls": images[].asset->url,
      "imageUrl": image.asset->url,
      variants[]{size, color, stock, incomingStock, restockDate}
    }
  }`;
	const collection = await sanityClient.fetch<SanityCollection | null>(query, { value: idOrSlug });
	if (!collection) return null;

	const products = (collection.products ?? []).map(mapProduct);

	return {
		id: collection._id,
		slug: collection.slug?.current ?? collection._id,
		name: collection.title ?? collection.name ?? "Untitled",
		description: collection.description ?? null,
		image: mapImages([
			...(collection.image ? [collection.image] : []),
			...(collection.imageUrl ? [collection.imageUrl] : []),
		])[0] ?? null,
		productCollections: products.map((product) => ({ product })),
	} satisfies Collection;
});

const fetchCollections = cache(async (limit?: number) => {
	const query = `*[_type == "collection"] | order(_createdAt desc)${
		typeof limit === "number" ? "[0...$limit]" : ""
	}{
    ...,
    _id,
    title,
    name,
    description,
    slug,
    image,
    "imageUrl": image.asset->url
  }`;
	const collections = await sanityClient.fetch<SanityCollection[]>(query, { limit });
	return collections.map((collection) => ({
		id: collection._id,
		slug: collection.slug?.current ?? collection._id,
		name: collection.title ?? collection.name ?? "Untitled",
		description: collection.description ?? null,
		image:
			mapImages([
				...(collection.image ? [collection.image] : []),
				...(collection.imageUrl ? [collection.imageUrl] : []),
				...extractImagesFromDocument(collection),
			])[0] ?? null,
		productCollections: [],
	}));
});

const fetchLegalPage = cache(async (slug: string) => {
	const query = `*[_type == "legalPage" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    content
  }`;
	const page = await sanityClient.fetch<SanityLegalPage | null>(query, { slug });
	if (!page) return null;

	const contentHtml = page.content ? toHTML(page.content as Parameters<typeof toHTML>[0]) : null;
	return {
		id: page._id,
		title: page.title,
		path: `/${page.slug?.current ?? page._id}`,
		content: contentHtml,
	} satisfies LegalPage;
});

const fetchLegalPages = cache(async () => {
	const query = `*[_type == "legalPage"] | order(_createdAt desc){
    _id,
    title,
    slug
  }`;
	const pages = await sanityClient.fetch<SanityLegalPage[]>(query);
	return pages.map((page) => ({
		id: page._id,
		title: page.title,
		path: `/${page.slug?.current ?? page._id}`,
		content: null,
	}));
});

const computeSubtotal = (items: CartLineItem[]) =>
	items.reduce((sum, item) => sum + BigInt(item.productVariant.price) * BigInt(item.quantity), BigInt(0));

const ensureCart = async () => {
	const cartCookie = await getCartCookieJson();
	if (cartCookie?.id) {
		return {
			id: cartCookie.id,
			lineItems: cartCookie.items,
		} satisfies Cart;
	}

	const id = crypto.randomUUID();
	const cart = { id, lineItems: [] satisfies CartLineItem[] };
	await setCartCookie({
		id,
		items: cart.lineItems,
		subtotal: "0",
		currency: CURRENCY,
	});
	return cart;
};

const writeCart = async (cart: Cart) => {
	const subtotal = computeSubtotal(cart.lineItems);
	await setCartCookie({
		id: cart.id,
		items: cart.lineItems,
		subtotal: subtotal.toString(),
		currency: CURRENCY,
	});
	return cart;
};

export const commerce = {
	productGet: async ({ idOrSlug }: { idOrSlug: string }) => fetchProductBySlugOrId(idOrSlug),
	productBrowse: async (
		{ limit, search }: { limit?: number; search?: string; active?: boolean } = {},
	) => ({
		data: await fetchProducts(limit, search),
	}),
	collectionGet: async ({ idOrSlug }: { idOrSlug: string }) => fetchCollectionBySlugOrId(idOrSlug),
	collectionBrowse: async ({ limit }: { limit?: number } = {}) => ({
		data: await fetchCollections(limit),
	}),
	legalPageGet: async (slug: string) => fetchLegalPage(slug),
	legalPageBrowse: async () => ({ data: await fetchLegalPages() }),
	meGet: async () => ({
		store: {
			subdomain: process.env.NEXT_PUBLIC_STORE_SUBDOMAIN ?? "store",
		},
		publicUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
	}),
	orderGet: async ({ id }: { id: string }) => {
		const { getOrder } = await import("./orders");
		return getOrder(id);
	},
	cartGet: async () => {
		const cartCookie = await getCartCookieJson();
		if (!cartCookie?.id) {
			return null;
		}
		return {
			id: cartCookie.id,
			lineItems: cartCookie.items,
		} satisfies Cart;
	},
	cartCreate: async () => ensureCart(),
	cartUpsert: async (cart: Cart) => writeCart(cart),
	cartAddItem: async (product: Product, variant: ProductVariant, quantity: number) => {
		const cart = await ensureCart();
		const existing = cart.lineItems.find((item) => item.productVariant.id === variant.id);

		const lineItem: CartLineItem = existing
			? {
					...existing,
					quantity: existing.quantity + quantity,
				}
			: {
					quantity,
					productVariant: {
						id: variant.id,
						price: variant.price,
						images: variant.images.length > 0 ? variant.images : product.images,
						size: variant.size,
						color: variant.color,
						stock: variant.stock,
						incomingStock: variant.incomingStock,
						restockDate: variant.restockDate,
						product: {
							id: product.id,
							name: product.name,
							slug: product.slug,
							images: product.images,
						},
					},
				};

		const updatedItems = existing
			? cart.lineItems.map((item) => (item.productVariant.id === variant.id ? lineItem : item))
			: [...cart.lineItems, lineItem];

		return writeCart({ ...cart, lineItems: updatedItems });
	},
	cartRemoveItem: async (productId: string) => {
		const cart = await ensureCart();
		const updatedItems = cart.lineItems.filter((item) => item.productVariant.id !== productId);
		return writeCart({ ...cart, lineItems: updatedItems });
	},
	cartUpdateQuantity: async (productId: string, quantity: number) => {
		const cart = await ensureCart();
		const updatedItems =
			quantity <= 0
				? cart.lineItems.filter((item) => item.productVariant.id !== productId)
				: cart.lineItems.map((item) =>
						item.productVariant.id === productId ? { ...item, quantity } : item,
					);
		return writeCart({ ...cart, lineItems: updatedItems });
	},
};
