import { Product } from "@/types/product";
import { Pressable, TouchableOpacity } from "react-native";
import { Button, Image, Text, XStack, YStack } from "tamagui";
import PRIME from "@/assets/prime-label.png";
import { deliveryDate } from "@/utils/date";
import { DefaultButton } from "@/components/Shared/DefaultButton";
import { useCart } from "@/context/CartProvider";

interface Props {
	product: Product;
	onPress: VoidFunction;
}

export function ProductCardResult({ product, onPress }: Props) {
	const { addItem } = useCart();

	return (
		<TouchableOpacity activeOpacity={0.8} onPress={onPress}>
			<XStack h={300} bc={"$gray5Light"} br={6} bw={1}>
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
					<Text numberOfLines={4} ellipsizeMode="tail">
						{product.name}
					</Text>
					<Text fos={24}>₹{product.currentPrice}</Text>
					{product.isAmazonChoice && (
						<Image source={PRIME} h={30} w={70} />
					)}
					<XStack>
						<Text>
							{product.deliveryPrice === 0
								? "FREE"
								: `₹${product.deliveryPrice}`}
							{" Delivery "}
						</Text>
						<Text fow={"bold"}>
							{deliveryDate(product.deliveryInDays)}
						</Text>
					</XStack>
					<DefaultButton
						mt={"auto"}
						h={40}
						textProps={{ fos: 14 }}
						onPress={() => addItem(product)}
					>
						Add to basket
					</DefaultButton>
				</YStack>
			</XStack>
		</TouchableOpacity>
	);
}
