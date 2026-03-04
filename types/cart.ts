export type CartLineItem = {
	quantity: number;
	productVariant: {
		id: string;
		price: string;
		images: string[];
		size: string;
		color: string;
		stock: number;
		incomingStock?: number;
		restockDate?: string;
		product: {
			id: string;
			name: string;
			slug: string;
			images: string[];
		};
	};
};
