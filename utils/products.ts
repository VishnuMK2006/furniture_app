import { Product } from "@/types/product";

// Local demo products for offline testing of 3D and AR
const products: Product[] = [
	{
		id: 1,
		name: "Playstation 5 Consola Estandar Modelo Slim",
		amountInStock: 34,
		currentPrice: 640.9,
		previousPrice: 700,
		deliveryPrice: 12.45,
		deliveryInDays: 4,
		isAmazonChoice: true,
		imageUrl: "ps5.png",
		model3DUrl: "ps5.glb",
	},
	{
		id: 2,
		name: "Raptor Series EC Games Red Chair",
		amountInStock: 32,
		currentPrice: 455,
		previousPrice: 500,
		deliveryPrice: 43.5,
		deliveryInDays: 6,
		isAmazonChoice: false,
		imageUrl: "couch.png",
		model3DUrl: "chair.glb",
	},
];

import { endpoints } from "./api";

// Fetch products dynamically from the backend
export const getAllProducts = async (category?: string): Promise<Product[]> => {
	try {
		const url = category && category !== "All" 
			? `${endpoints.products}?category=${category}` 
			: endpoints.products;
			
		const timestamp = new Date().getTime();
		const separator = url.includes('?') ? '&' : '?';
		const finalUrl = `${url}${separator}t=${timestamp}`;
			
		const res = await fetch(finalUrl);
		if (!res.ok) return [];
		return await res.json();
	} catch (error) {
		console.error("Failed to fetch products", error);
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
		return null;
	}
};
