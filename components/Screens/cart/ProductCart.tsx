import React from "react";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartProvider";
import { Button, Image, Text, XStack, YStack } from "tamagui";
import { deliveryDate } from "@/utils/date";

interface Props {
	product: Product;
	quantity: number;
}

export default function ProductCart({ product, quantity }: Props) {
	const { addItem, removeItem } = useCart();

	return (
		<YStack gap={10}>
			<XStack bg="$gray2Light" minHeight={200} minWidth="90%">
				<Image
					src={product.imageUrl ?? ""}
					objectFit="contain"
					h={"100%"}
					w={"35%"}
					bg={"$shadowColor"}
					bblr={5}
					btlr={5}
					p={10}
				/>
				<YStack w="65%" p={20} gap={10}>
					<Text numberOfLines={4} ellipsizeMode="tail" color="#0F172A">
						{product.name}
					</Text>
					<Text fos={24} color="#0F172A">₹{product.currentPrice}</Text>
					{product.isAmazonChoice && (
						<Text bg="#111827" color="white" px={8} py={4} br={6} fos={11} fow="700" style={{ alignSelf: "flex-start" }}>
							Prime
						</Text>
					)}
					<XStack>
						<Text color="#0F172A">
							{product.deliveryPrice === 0
								? "FREE"
								: `₹${product.deliveryPrice}`}
							{" Delivery "}
						</Text>
					</XStack>
				</YStack>
			</XStack>

			<XStack gap={20}>
				<Button
					w={100}
					br={50}
					bw={3}
					bc="$yellow10Light"
					onPress={() => addItem(product)}
				>
					<Text mr="auto" fow="bold">
						{quantity.toString()}
					</Text>
					<MCIcon name="plus" size={24} />
				</Button>
				<Button
					br={50}
					bw={1}
					bc={"$gray8Light"}
					bg={"white"}
					color="#0F172A"
					onPress={() => removeItem(product)}
				>
					Delete
				</Button>
			</XStack>
		</YStack>
	);
}
