import React, { useState, useRef } from "react";
import { Product } from "@/types/product";
import {
	Animated,
	Pressable,
	StyleSheet,
	TouchableOpacity,
	View,
} from "react-native";
import { Image, Text, XStack, YStack } from "tamagui";
import Icon from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";

const COLORS = {
	primary: "#D97706",
	primaryDeep: "#B45309",
	primaryMuted: "#FEF3C7",
	textDark: "#0F172A",
	textMid: "#475569",
	textLight: "#94A3B8",
	surface: "#F8FAFC",
	surfaceWarm: "#FFFBF5",
	white: "#FFFFFF",
	border: "#E2E8F0",
	heartRed: "#EF4444",
};

interface Props {
	product: Product;
	onPress: VoidFunction;
}

export function ProductDealCard({ product, onPress }: Props) {
	const [isFavorite, setIsFavorite] = useState(false);
	const heartScale = useRef(new Animated.Value(1)).current;
	const addScale = useRef(new Animated.Value(1)).current;

	const handleFavorite = () => {
		setIsFavorite((prev) => !prev);
		Animated.sequence([
			Animated.spring(heartScale, {
				toValue: 1.4,
				useNativeDriver: true,
				speed: 40,
				bounciness: 14,
			}),
			Animated.spring(heartScale, {
				toValue: 1,
				useNativeDriver: true,
				speed: 40,
				bounciness: 8,
			}),
		]).start();
	};

	const handleAddPress = () => {
		Animated.sequence([
			Animated.spring(addScale, {
				toValue: 0.82,
				useNativeDriver: true,
				speed: 60,
				bounciness: 0,
			}),
			Animated.spring(addScale, {
				toValue: 1,
				useNativeDriver: true,
				speed: 40,
				bounciness: 10,
			}),
		]).start();
	};

	const discountPercent =
		product.originalPrice && product.originalPrice > product.currentPrice
			? Math.round(
					((product.originalPrice - product.currentPrice) /
						product.originalPrice) *
						100
			  )
			: null;

	return (
		<TouchableOpacity activeOpacity={0.93} onPress={onPress}>
			<View style={styles.card}>

				{/* Image container */}
				<View style={styles.imageContainer}>
					<Image
						src={product.imageUrl ?? "https://via.placeholder.com/200"}
						objectFit="contain"
						w="100%"
						h="100%"
					/>

					{/* Discount badge */}
					{discountPercent !== null && (
						<View style={styles.discountBadge}>
							<Text style={styles.discountText}>{discountPercent}% OFF</Text>
						</View>
					)}

					{/* Favorite button */}
					<Pressable onPress={handleFavorite} hitSlop={8} style={styles.favoriteBtn}>
						<Animated.View style={{ transform: [{ scale: heartScale }] }}>
							<Icon
								name={isFavorite ? "heart" : "heart-outline"}
								size={20}
								color={isFavorite ? COLORS.heartRed : COLORS.textMid}
							/>
						</Animated.View>
					</Pressable>
				</View>

				{/* Details */}
				<View style={styles.details}>

					{/* Badge row */}
					<View style={styles.badgeRow}>
						<View style={styles.badge}>
							<Icon
								name={product.isAmazonChoice ? "ribbon-outline" : "star-outline"}
								size={10}
								color={COLORS.primary}
								style={{ marginRight: 3 }}
							/>
							<Text style={styles.badgeText}>
								{product.isAmazonChoice ? "Recommended" : "Top Rated"}
							</Text>
						</View>
					</View>

					{/* Product name */}
					<Text
						fos={15}
						fow="800"
						color={COLORS.textDark}
						numberOfLines={2}
						lineHeight={21}
						mt={6}
					>
						{product.name}
					</Text>

					{/* Price row */}
					<XStack mt={10} ai="center" jc="space-between">
						<YStack gap={2}>
							<Text style={styles.currentPrice}>
								{"\u20B9"}{product.currentPrice.toFixed(0)}
							</Text>
							{product.originalPrice && product.originalPrice > product.currentPrice && (
								<Text style={styles.originalPrice}>
									{"\u20B9"}{product.originalPrice.toFixed(0)}
								</Text>
							)}
						</YStack>

						{/* Add button */}
						<Pressable onPress={handleAddPress} hitSlop={4}>
							<Animated.View style={{ transform: [{ scale: addScale }] }}>
								<LinearGradient
									colors={[COLORS.primary, COLORS.primaryDeep]}
									start={{ x: 0, y: 0 }}
									end={{ x: 1, y: 1 }}
									style={styles.addBtn}
								>
									<Icon name="add" size={22} color="white" />
								</LinearGradient>
							</Animated.View>
						</Pressable>
					</XStack>
				</View>

			</View>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	card: {
		width: 210,
		backgroundColor: "#FFFFFF",
		borderRadius: 18,
		borderWidth: 1,
		borderColor: "#E2E8F0",
		overflow: "hidden",
		shadowColor: "#0F172A",
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.07,
		shadowRadius: 16,
		elevation: 4,
	},

	/* Image */
	imageContainer: {
		width: "100%",
		height: 175,
		backgroundColor: "#F8FAFC",
		position: "relative",
	},

	/* Discount badge */
	discountBadge: {
		position: "absolute",
		top: 12,
		left: 12,
		backgroundColor: "#D97706",
		borderRadius: 6,
		paddingHorizontal: 7,
		paddingVertical: 3,
	},
	discountText: {
		fontSize: 10,
		fontWeight: "800",
		color: "white",
		letterSpacing: 0.4,
	},

	/* Favorite */
	favoriteBtn: {
		position: "absolute",
		top: 10,
		right: 10,
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: "rgba(255,255,255,0.92)",
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 6,
		elevation: 2,
	},

	/* Details */
	details: {
		paddingHorizontal: 14,
		paddingTop: 12,
		paddingBottom: 14,
	},

	/* Badge */
	badgeRow: {
		flexDirection: "row",
	},
	badge: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#FEF3C7",
		borderRadius: 5,
		paddingHorizontal: 7,
		paddingVertical: 3,
	},
	badgeText: {
		fontSize: 10,
		fontWeight: "700",
		color: "#D97706",
		letterSpacing: 0.5,
		textTransform: "uppercase",
	},

	/* Price */
	currentPrice: {
		fontSize: 20,
		fontWeight: "900",
		color: "#0F172A",
		letterSpacing: -0.5,
	},
	originalPrice: {
		fontSize: 12,
		fontWeight: "500",
		color: "#94A3B8",
		textDecorationLine: "line-through",
	},

	/* Add button */
	addBtn: {
		width: 40,
		height: 40,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#D97706",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.35,
		shadowRadius: 8,
		elevation: 5,
	},
});