import { ProductGrid } from "@/components/sections/product-grid";

export default function ProductsPage() {
	return (
		<main>
			<ProductGrid title="All Products" description="Browse everything in the catalog" limit={36} />
		</main>
	);
}
