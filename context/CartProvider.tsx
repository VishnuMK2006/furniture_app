import { Product } from "@/types/product";
import {
	createContext,
	PropsWithChildren,
	useContext,
	useMemo,
	useState,
} from "react";

interface CartItem {
	product: Product;
	quantity: number;
}

interface CartContextType {
	items: CartItem[];
	subTotal: number;
	addItem: (product: Product, quantity?: number) => void;
	removeItem: (product: Product, quantity?: number) => void;
}

const CartContext = createContext({} as CartContextType);

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }: PropsWithChildren) => {
	const [items, setItems] = useState<CartItem[]>([]);

	const subTotal = useMemo(() => {
		return items.reduce((acc, item) => {
			return Number(
				(acc + item.product.currentPrice * item.quantity).toFixed(2)
			);
		}, 0);
	}, [items]);

	const addItem = (product: Product, quantity: number = 1) => {
		const item = items.find((item) => product.id === item.product.id);

		if (item) {
			setItems((items) => {
				return items.map((item) => {
					if (item.product.id === product.id) {
						return {
							...item,
							quantity: item.quantity + quantity,
						};
					}
					return item;
				});
			});
		} else {
			setItems((prev) => [...prev, { product, quantity }]);
		}
	};

	const removeItem = (product: Product, quantity: number = 1) => {
		const item = items.find((item) => product.id === item.product.id);

		if (!item) return;

		if (item.quantity > quantity) {
			setItems((items) => {
				return items.map((item) => {
					if (item.product.id === product.id) {
						return {
							...item,
							quantity: item.quantity - quantity,
						};
					}
					return item;
				});
			});
		} else {
			setItems((prev) =>
				prev.filter((item) => item.product.id !== product.id)
			);
		}
	};

	return (
		<CartContext.Provider
			value={{
				items,
				subTotal,
				addItem,
				removeItem,
			}}
		>
			{children}
		</CartContext.Provider>
	);
};
