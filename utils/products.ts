import { Product } from "@/types/product";

import { endpoints } from "./api";

// Fetch products dynamically from the backend
export const getAllProducts = async (category?: string): Promise<Product[]> => {
	let finalUrl = endpoints.products;
	try {
		const url = category && category !== "All" 
			? `${endpoints.products}?category=${category}` 
			: endpoints.products;
			
		const timestamp = new Date().getTime();
		const separator = url.includes('?') ? '&' : '?';
		finalUrl = `${url}${separator}t=${timestamp}`;
			
		const res = await fetch(finalUrl);
		if (!res.ok) return [];
		return await res.json();
	} catch (error) {
		console.error("Failed to fetch products", { error, url: finalUrl });
		return [];
	}
};

export const searchProductsByName = async (query: string): Promise<Product[]> => {
	const q = query.trim().toLowerCase();
	if (!q) return [];
	try {
		const all = await getAllProducts();
		return all.filter((product) =>
			product.name.toLowerCase().includes(q)
		);
	} catch (error) {
		return [];
	}
};

export const getProductById = async (id: string | number): Promise<Product | null> => {
	try {
		const res = await fetch(`${endpoints.products}`); // Could be more efficient if backend had /products/<id>
		if (!res.ok) return null;
		const all: Product[] = await res.json();
		return all.find((product) => String(product.id) === String(id)) ?? null;
	} catch (error) {
		console.error("Failed to fetch product by id", { error, url: endpoints.products, id });
		return null;
	}
};
