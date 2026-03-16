import React, { useState, useEffect, useRef } from "react";
import { useLocalSearchParams, router, useNavigation } from "expo-router";
import {
	ScrollView,
	Pressable,
	Dimensions,
	Alert,
	StyleSheet,
	View,
	Animated,
} from "react-native";
import { Image, Text, XStack, YStack } from "tamagui";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "@expo/vector-icons/Ionicons";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { Product } from "@/types/product";
import { getProductById } from "@/utils/products";
import { useCart } from "@/context/CartProvider";
import {
	isInWishlist,
	removeWishlistItem,
	upsertWishlistItem,
} from "@/utils/customerProfile";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const IMAGE_HEIGHT = SCREEN_HEIGHT * 0.46;

const COLORS = {
	primary: "#D97706",
	primaryDeep: "#B45309",
	primaryMuted: "#FEF3C7",
	textDark: "#0F172A",
	textMid: "#475569",
	textLight: "#94A3B8",
	background: "#FAFAF8",
	surface: "#FFFFFF",
	border: "#E2E8F0",
	borderLight: "#F1F5F9",
	success: "#10B981",
	successMuted: "#ECFDF5",
	heartRed: "#EF4444",
};

const SPECS = [
	{ label: "Material", value: "Velvet Blend" },
	{ label: "Weight Limit", value: "300 lbs" },
	{ label: "Assembly", value: "None Required" },
	{ label: "Care", value: "Spot Clean Only" },
	{ label: "Frame", value: "Solid Hardwood" },
	{ label: "Warranty", value: "5 Years" },
];

const HIGHLIGHTS = [
	{ icon: "leaf-outline", label: "Premium Material" },
	{ icon: "rocket-outline", label: "Free Shipping" },
	{ icon: "shield-checkmark-outline", label: "5-Year Warranty" },
	{ icon: "refresh-outline", label: "Easy Returns" },
];

export default function ProductDetails() {
	const { id } = useLocalSearchParams();
	const navigation = useNavigation();
	const insets = useSafeAreaInsets();
	const { addItem } = useCart();

	const [product, setProduct] = useState<Product | null>(null);
	const [isFavorite, setIsFavorite] = useState(false);
	const [addedToCart, setAddedToCart] = useState(false);

	const heartScale = useRef(new Animated.Value(1)).current;
	const cartScale = useRef(new Animated.Value(1)).current;

	useEffect(() => {
		navigation.setOptions({ headerShown: false });
		if (id) {
			setProduct(null);
			getProductById(id as any).then(async (p) => {
				if (!p) return;
				setProduct(p);
				setIsFavorite(await isInWishlist(String(p.id)));
			});
		}
	}, [id, navigation]);

	if (!product) {
		return (
			<View style={styles.loadingContainer}>
				<View style={styles.loadingIcon}>
					<MCIcon name="sofa" size={36} color={COLORS.primary} />
				</View>
				<Text fos={14} color={COLORS.textLight} mt={12}>
					Loading product...
				</Text>
			</View>
		);
	}

	const hasDiscount =
		product.previousPrice && product.previousPrice > product.currentPrice;
	const discountPct = hasDiscount
		? Math.round(
				((product.previousPrice - product.currentPrice) / product.previousPrice) * 100
		  )
		: null;

	const handleFavorite = async () => {
		if (!product) return;

		if (isFavorite) {
			await removeWishlistItem(String(product.id));
			setIsFavorite(false);
		} else {
			await upsertWishlistItem({
				productId: String(product.id),
				name: product.name,
				imageUrl: product.imageUrl,
				currentPrice: product.currentPrice,
			});
			setIsFavorite(true);
		}

		Animated.sequence([
			Animated.spring(heartScale, { toValue: 1.4, useNativeDriver: true, speed: 40, bounciness: 14 }),
			Animated.spring(heartScale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 8 }),
		]).start();
	};

	const handleAddToCart = () => {
		addItem(product, 1);
		setAddedToCart(true);
		Animated.sequence([
			Animated.spring(cartScale, { toValue: 0.85, useNativeDriver: true, speed: 60, bounciness: 0 }),
			Animated.spring(cartScale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 12 }),
		]).start(() => setTimeout(() => setAddedToCart(false), 2000));
	};

	return (
		<View style={{ flex: 1, backgroundColor: COLORS.background }}>
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 120 }}
			>
				{/* ── Hero image ── */}
				<View style={styles.imageContainer}>
					<Image
						src={product.imageUrl ?? "https://via.placeholder.com/400"}
						objectFit="contain"
						w="100%"
						h="100%"
					/>

					{/* Soft bottom fade into background */}
					<LinearGradient
						colors={["transparent", "rgba(250,250,248,0.9)"]}
						style={styles.imageGradient}
						pointerEvents="none"
					/>

					{/* Floating top actions */}
					<View style={[styles.topActions, { top: insets.top + 12 }]}>
						<Pressable onPress={() => router.back()} style={styles.floatBtn} hitSlop={6}>
							<Icon name="arrow-back" size={20} color={COLORS.textDark} />
						</Pressable>

						<XStack gap={10}>
							<Pressable style={styles.floatBtn} hitSlop={6}>
								<Icon name="share-social-outline" size={20} color={COLORS.textDark} />
							</Pressable>
							<Pressable onPress={handleFavorite} style={styles.floatBtn} hitSlop={6}>
								<Animated.View style={{ transform: [{ scale: heartScale }] }}>
									<Icon
										name={isFavorite ? "heart" : "heart-outline"}
										size={20}
										color={isFavorite ? COLORS.heartRed : COLORS.textDark}
									/>
								</Animated.View>
							</Pressable>
						</XStack>
					</View>

					{/* Discount badge */}
					{discountPct && (
						<View style={styles.discountBadge}>
							<Text fos={11} fow="800" color="white" letterSpacing={0.3}>
								{discountPct}% OFF
							</Text>
						</View>
					)}

					{/* AR floating button */}
					{product.model3DUrl && (
						<XStack style={styles.arRow}>
							<Pressable
								onPress={() =>
									router.push({
										pathname: "/product/AR",
										params: { modelUrl: product.model3DUrl, productId: String(product.id) },
									})
								}
							>
								<LinearGradient
									colors={[COLORS.primary, COLORS.primaryDeep]}
									start={{ x: 0, y: 0 }}
									end={{ x: 1, y: 0 }}
									style={styles.arBtnFilled}
								>
									<MCIcon name="augmented-reality" size={17} color="white" />
									<Text fos={13} fow="700" color="white" ml={6}>
										AR Viewer
									</Text>
								</LinearGradient>
							</Pressable>
						</XStack>
					)}
				</View>

				{/* ── Content ── */}
				<YStack px={20} pt={20}>

					{/* Name & price */}
					<XStack jc="space-between" ai="flex-start" mb={12}>
						<YStack f={1} pr={16} gap={4}>
							<Text
								fos={11}
								fow="700"
								color={COLORS.textLight}
								letterSpacing={1.2}
								tt="uppercase"
							>
								Furniture Collection
							</Text>
							<Text
								fos={24}
								fow="900"
								color={COLORS.textDark}
								lineHeight={30}
								letterSpacing={-0.4}
							>
								{product.name}
							</Text>
						</YStack>

						<YStack ai="flex-end" gap={2}>
							{hasDiscount && (
								<Text
									fos={13}
									color={COLORS.textLight}
									textDecorationLine="line-through"
								>
									{"\u20B9"}{product.previousPrice.toFixed(0)}
								</Text>
							)}
							<Text fos={26} fow="900" color={COLORS.primary} letterSpacing={-0.5}>
								{"\u20B9"}{product.currentPrice.toFixed(0)}
							</Text>
						</YStack>
					</XStack>

					{/* Stock + rating */}
					<XStack gap={10} mb={20} flexWrap="wrap">
						<View style={styles.stockBadge}>
							<View style={styles.stockDot} />
							<Text fos={12} fow="700" color={COLORS.success} letterSpacing={0.4}>
								{product.amountInStock} in Stock
							</Text>
						</View>
						<View style={styles.ratingBadge}>
							<Icon name="star" size={12} color={COLORS.primary} />
							<Text fos={12} fow="700" color={COLORS.textDark} ml={4}>4.8</Text>
							<Text fos={12} color={COLORS.textLight} ml={3}>(124 reviews)</Text>
						</View>
					</XStack>

					{/* Highlight pills */}
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={{ gap: 8, paddingRight: 4, marginBottom: 24 }}
					>
						{HIGHLIGHTS.map((h) => (
							<View key={h.label} style={styles.highlightPill}>
								<Icon name={h.icon as any} size={14} color={COLORS.primary} />
								<Text fos={12} fow="600" color={COLORS.textMid} ml={5}>
									{h.label}
								</Text>
							</View>
						))}
					</ScrollView>

					<View style={styles.divider} />

					{/* Description */}
					<YStack mt={22} mb={26} gap={8}>
						<Text fos={17} fow="800" color={COLORS.textDark} letterSpacing={-0.2}>
							About this piece
						</Text>
						<Text fos={14} color={COLORS.textMid} lineHeight={22}>
							Experience the perfect blend of modern aesthetics and unparalleled comfort.
							Crafted with meticulous attention to detail, this piece features high-density
							foam cushions, a solid hardwood frame, and premium upholstery designed to
							withstand daily life while maintaining its sophisticated look.
						</Text>
					</YStack>

					<View style={styles.divider} />

					{/* Specs */}
					<YStack mt={22} gap={14}>
						<Text fos={17} fow="800" color={COLORS.textDark} letterSpacing={-0.2}>
							Specifications
						</Text>
						<View style={styles.specsCard}>
							{SPECS.map((spec, i) => (
								<React.Fragment key={spec.label}>
									<XStack jc="space-between" ai="center" px={16} py={13}>
										<Text fos={13} color={COLORS.textLight} fow="600">
											{spec.label}
										</Text>
										<Text fos={14} color={COLORS.textDark} fow="700">
											{spec.value}
										</Text>
									</XStack>
									{i < SPECS.length - 1 && (
										<View style={styles.specDivider} />
									)}
								</React.Fragment>
							))}
						</View>
					</YStack>
				</YStack>
			</ScrollView>

			{/* ── Sticky bottom bar ── */}
			<View
				style={[
					styles.bottomBar,
					{ paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 24 },
				]}
			>
				<XStack ai="center" gap={12}>
					<Animated.View style={{ transform: [{ scale: cartScale }] }}>
						<Pressable
							onPress={handleAddToCart}
							style={[styles.cartBtn, addedToCart && styles.cartBtnAdded]}
						>
							<Icon
								name={addedToCart ? "checkmark" : "cart-outline"}
								size={22}
								color={addedToCart ? COLORS.success : COLORS.primary}
							/>
						</Pressable>
					</Animated.View>

					<Pressable
						onPress={() => Alert.alert("Checkout", "Proceeding to checkout...")}
						style={{ flex: 1 }}
					>
						<LinearGradient
							colors={[COLORS.primary, COLORS.primaryDeep]}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 0 }}
							style={styles.buyBtn}
						>
							<Text fos={16} fow="800" color="white" letterSpacing={0.2}>
								Buy Now
							</Text>
							<Text fos={13} color="rgba(255,255,255,0.75)" ml={8}>
								{"\u20B9"}{product.currentPrice.toFixed(0)}
							</Text>
						</LinearGradient>
					</Pressable>
				</XStack>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	loadingContainer: {
		flex: 1,
		backgroundColor: COLORS.background,
		alignItems: "center",
		justifyContent: "center",
	},
	loadingIcon: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: COLORS.primaryMuted,
		alignItems: "center",
		justifyContent: "center",
	},

	/* Image area */
	imageContainer: {
		width: "100%",
		height: IMAGE_HEIGHT,
		backgroundColor: COLORS.surface,
		position: "relative",
	},
	imageGradient: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		height: 110,
	},
	topActions: {
		position: "absolute",
		left: 20,
		right: 20,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		zIndex: 10,
	},
	floatBtn: {
		width: 42,
		height: 42,
		borderRadius: 13,
		backgroundColor: "rgba(255,255,255,0.92)",
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 3,
	},
	discountBadge: {
		position: "absolute",
		top: 18,
		left: 18,
		backgroundColor: COLORS.primary,
		borderRadius: 7,
		paddingHorizontal: 9,
		paddingVertical: 4,
	},
	arRow: {
		position: "absolute",
		bottom: 22,
		left: 0,
		right: 0,
		justifyContent: "center",
	},
	arBtn: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "rgba(255,255,255,0.93)",
		borderRadius: 22,
		paddingHorizontal: 16,
		paddingVertical: 10,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 3,
	},
	arBtnFilled: {
		flexDirection: "row",
		alignItems: "center",
		borderRadius: 22,
		paddingHorizontal: 16,
		paddingVertical: 10,
		shadowColor: COLORS.primary,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 10,
		elevation: 4,
	},

	/* Badges */
	stockBadge: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: COLORS.successMuted,
		borderRadius: 7,
		paddingHorizontal: 10,
		paddingVertical: 5,
		gap: 6,
	},
	stockDot: {
		width: 7,
		height: 7,
		borderRadius: 4,
		backgroundColor: COLORS.success,
	},
	ratingBadge: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: COLORS.primaryMuted,
		borderRadius: 7,
		paddingHorizontal: 10,
		paddingVertical: 5,
	},

	/* Highlights */
	highlightPill: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 20,
		borderWidth: 1.5,
		borderColor: COLORS.border,
		backgroundColor: COLORS.surface,
	},

	/* Divider */
	divider: {
		height: 1,
		backgroundColor: COLORS.borderLight,
	},

	/* Specs */
	specsCard: {
		backgroundColor: COLORS.surface,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: COLORS.borderLight,
		overflow: "hidden",
	},
	specDivider: {
		height: 1,
		backgroundColor: COLORS.borderLight,
		marginHorizontal: 16,
	},

	/* Bottom bar */
	bottomBar: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: COLORS.surface,
		paddingHorizontal: 20,
		paddingTop: 14,
		borderTopWidth: 1,
		borderTopColor: COLORS.borderLight,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: -4 },
		shadowOpacity: 0.06,
		shadowRadius: 16,
		elevation: 10,
	},
	cartBtn: {
		width: 54,
		height: 54,
		borderRadius: 15,
		borderWidth: 1.5,
		borderColor: COLORS.primary,
		backgroundColor: COLORS.primaryMuted,
		alignItems: "center",
		justifyContent: "center",
	},
	cartBtnAdded: {
		borderColor: COLORS.success,
		backgroundColor: COLORS.successMuted,
	},
	buyBtn: {
		height: 54,
		borderRadius: 15,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		shadowColor: COLORS.primary,
		shadowOffset: { width: 0, height: 5 },
		shadowOpacity: 0.32,
		shadowRadius: 12,
		elevation: 6,
	},
});