import React, { useEffect } from "react";
import { router, useNavigation } from "expo-router";
import {
	Alert,
	Pressable,
	ScrollView,
	StyleSheet,
	View,
} from "react-native";
import { Image, Text, XStack, YStack } from "tamagui";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "@expo/vector-icons/Ionicons";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import { useAuth } from "@/context/AuthProvider";
import { useCart } from "@/context/CartProvider";
import ProductCart from "@/components/Screens/cart/ProductCart";
import { DeliveryLocation } from "@/components/Shared/DeliveryLocation";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
};

export default function Cart() {
	const { items, subTotal } = useCart();
	const { session } = useAuth();
	const navigation = useNavigation();
	const insets = useSafeAreaInsets();

	useEffect(() => {
		navigation.setOptions({ headerShown: false });
	}, [navigation.setOptions]);

	const isEmpty = items.length === 0;

	return (
		<View style={{ flex: 1, backgroundColor: COLORS.background }}>

			{/* ── Custom header ── */}
			<View style={[styles.header, { paddingTop: insets.top > 0 ? insets.top + 12 : 52 }]}>
				<XStack ai="center" jc="space-between">
					<Pressable onPress={() => router.back()} style={styles.headerIconBtn} hitSlop={6}>
						<Icon name="arrow-back" size={20} color={COLORS.textDark} />
					</Pressable>

					<YStack ai="center" gap={2}>
						<Text fos={17} fow="900" color={COLORS.textDark} letterSpacing={1.5}>
							MY CART
						</Text>
						{!isEmpty && (
							<Text fos={12} color={COLORS.textLight} fow="500">
								{items.length} {items.length === 1 ? "item" : "items"}
							</Text>
						)}
					</YStack>

					<Pressable style={styles.headerIconBtn} hitSlop={6}>
						<Icon name="heart-outline" size={20} color={COLORS.textDark} />
					</Pressable>
				</XStack>
			</View>

			{isEmpty ? (
				/* ── Empty state ── */
				<View style={styles.emptyContainer}>
					<View style={styles.emptyIconWrap}>
						<MCIcon name="cart-outline" size={52} color={COLORS.primary} />
					</View>

					<Text fos={22} fow="900" color={COLORS.textDark} letterSpacing={-0.3} mt={24}>
						Your cart is empty
					</Text>
					<Text fos={14} color={COLORS.textLight} ta="center" mt={8} px={40} lineHeight={21}>
						Looks like you haven't added any pieces to your collection yet.
					</Text>

					<Pressable onPress={() => router.back()} style={{ marginTop: 32 }}>
						<LinearGradient
							colors={[COLORS.primary, COLORS.primaryDeep]}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 0 }}
							style={styles.gradientBtn}
						>
							<Icon name="arrow-back" size={16} color="white" style={{ marginRight: 8 }} />
							<Text fos={15} fow="700" color="white">
								Continue Shopping
							</Text>
						</LinearGradient>
					</Pressable>

					{!session && (
						<YStack w="100%" px={24} gap={12} mt={20}>
							<View style={styles.dividerRow}>
								<View style={styles.dividerLine} />
								<Text fos={11} fow="700" color={COLORS.textLight} letterSpacing={1}>
									OR
								</Text>
								<View style={styles.dividerLine} />
							</View>

							<Pressable onPress={() => router.push("/login")}>
								<LinearGradient
									colors={[COLORS.primary, COLORS.primaryDeep]}
									start={{ x: 0, y: 0 }}
									end={{ x: 1, y: 0 }}
									style={styles.gradientBtn}
								>
									<Text fos={15} fow="700" color="white">Sign In</Text>
								</LinearGradient>
							</Pressable>

							<Pressable
								onPress={() => router.push("/login")}
								style={styles.outlineBtn}
							>
								<Text fos={15} fow="700" color={COLORS.primary}>
									Create Account
								</Text>
							</Pressable>
						</YStack>
					)}
				</View>
			) : (
				/* ── Cart with items ── */
				<>
					<ScrollView
						showsVerticalScrollIndicator={false}
						contentContainerStyle={{ paddingBottom: 200 }}
					>
						{/* Delivery location strip */}
						<View style={styles.deliveryStrip}>
							<DeliveryLocation />
						</View>

						{/* Items */}
						<YStack px={20} pt={8} gap={12}>
							{items.map((item) => (
								<ProductCart key={item.product.id} {...item} />
							))}
						</YStack>

						{/* Order summary card */}
						<View style={styles.summaryCard}>
							<Text fos={16} fow="800" color={COLORS.textDark} mb={16} letterSpacing={-0.2}>
								Order Summary
							</Text>

							<XStack jc="space-between" ai="center" mb={10}>
								<Text fos={14} color={COLORS.textMid}>
									Subtotal ({items.length} items)
								</Text>
								<Text fos={14} fow="600" color={COLORS.textDark}>
									{"\u20B9"}{subTotal}
								</Text>
							</XStack>

							<XStack jc="space-between" ai="center" mb={10}>
								<Text fos={14} color={COLORS.textMid}>Delivery</Text>
								<XStack ai="center" gap={4}>
									<Icon name="checkmark-circle" size={14} color={COLORS.success} />
									<Text fos={14} fow="600" color={COLORS.success}>Free</Text>
								</XStack>
							</XStack>

							<View style={styles.summaryDivider} />

							<XStack jc="space-between" ai="center" mt={14}>
								<Text fos={17} fow="800" color={COLORS.textDark}>Total</Text>
								<Text fos={20} fow="900" color={COLORS.textDark} letterSpacing={-0.5}>
									{"\u20B9"}{subTotal}
								</Text>
							</XStack>
						</View>
					</ScrollView>

					{/* ── Sticky checkout footer ── */}
					<View
						style={[
							styles.checkoutFooter,
							{ paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 24 },
						]}
					>
						{!session ? (
							<YStack gap={10} w="100%">
								<Pressable onPress={() => router.push("/login")}>
									<LinearGradient
										colors={[COLORS.primary, COLORS.primaryDeep]}
										start={{ x: 0, y: 0 }}
										end={{ x: 1, y: 0 }}
										style={styles.gradientBtn}
									>
										<Icon name="person-outline" size={16} color="white" style={{ marginRight: 8 }} />
										<Text fos={15} fow="700" color="white">
											Sign In to Checkout
										</Text>
									</LinearGradient>
								</Pressable>
								<Pressable
									onPress={() => router.push("/login")}
									style={styles.outlineBtn}
								>
									<Text fos={15} fow="700" color={COLORS.primary}>
										Create Account
									</Text>
								</Pressable>
							</YStack>
						) : (
							<YStack w="100%" gap={10}>
								<XStack jc="space-between" ai="center" mb={4}>
									<Text fos={13} color={COLORS.textLight}>Total amount</Text>
									<Text fos={22} fow="900" color={COLORS.textDark} letterSpacing={-0.5}>
										{"\u20B9"}{subTotal}
									</Text>
								</XStack>
								<Pressable onPress={() => {}}>
									<LinearGradient
										colors={[COLORS.primary, COLORS.primaryDeep]}
										start={{ x: 0, y: 0 }}
										end={{ x: 1, y: 0 }}
										style={styles.gradientBtn}
									>
										<Text fos={16} fow="700" color="white">
											Proceed to Checkout
										</Text>
										<View style={styles.checkoutBadge}>
											<Text fos={12} fow="800" color={COLORS.primary}>
												{items.length}
											</Text>
										</View>
									</LinearGradient>
								</Pressable>
							</YStack>
						)}
					</View>
				</>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	/* Header */
	header: {
		backgroundColor: COLORS.surface,
		paddingHorizontal: 20,
		paddingBottom: 16,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.borderLight,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.04,
		shadowRadius: 10,
		elevation: 3,
	},
	headerIconBtn: {
		width: 40,
		height: 40,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: COLORS.border,
		backgroundColor: COLORS.surface,
		alignItems: "center",
		justifyContent: "center",
	},

	/* Empty state */
	emptyContainer: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 24,
		paddingBottom: 60,
	},
	emptyIconWrap: {
		width: 100,
		height: 100,
		borderRadius: 50,
		backgroundColor: COLORS.primaryMuted,
		alignItems: "center",
		justifyContent: "center",
		shadowColor: COLORS.primary,
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.15,
		shadowRadius: 20,
		elevation: 4,
	},

	/* Delivery */
	deliveryStrip: {
		backgroundColor: COLORS.surface,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.borderLight,
		marginBottom: 8,
	},

	/* Summary card */
	summaryCard: {
		marginHorizontal: 20,
		marginTop: 20,
		backgroundColor: COLORS.surface,
		borderRadius: 18,
		padding: 20,
		borderWidth: 1,
		borderColor: COLORS.borderLight,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.05,
		shadowRadius: 12,
		elevation: 2,
	},
	summaryDivider: {
		height: 1,
		backgroundColor: COLORS.borderLight,
		marginTop: 4,
	},

	/* Checkout footer */
	checkoutFooter: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: COLORS.surface,
		paddingHorizontal: 20,
		paddingTop: 16,
		borderTopWidth: 1,
		borderTopColor: COLORS.borderLight,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: -4 },
		shadowOpacity: 0.06,
		shadowRadius: 16,
		elevation: 10,
	},
	checkoutBadge: {
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: "white",
		alignItems: "center",
		justifyContent: "center",
		marginLeft: 10,
	},

	/* Shared buttons */
	gradientBtn: {
		height: 52,
		borderRadius: 14,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		shadowColor: COLORS.primary,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 10,
		elevation: 5,
	},
	outlineBtn: {
		height: 52,
		borderRadius: 14,
		borderWidth: 1.5,
		borderColor: COLORS.primary,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: COLORS.primaryMuted,
	},

	/* Divider */
	dividerRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	dividerLine: {
		flex: 1,
		height: 1,
		backgroundColor: COLORS.border,
	},
});