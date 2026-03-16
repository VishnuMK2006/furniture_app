import React, { useEffect, useRef } from "react";
import { router, useNavigation } from "expo-router";
import {
	Alert,
	Animated,
	Pressable,
	ScrollView,
	StyleSheet,
	View,
	Text as RNText,
} from "react-native";
import { XStack, YStack } from "tamagui";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "@expo/vector-icons/Ionicons";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import { useAuth } from "@/context/AuthProvider";
import { useCart } from "@/context/CartProvider";
import ProductCart from "@/components/Screens/cart/ProductCart";
import { DeliveryLocation } from "@/components/Shared/DeliveryLocation";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createOrder } from "@/utils/orders";

// ─── Use RN Text everywhere to avoid Tamagui color inheritance bugs ───
const T = RNText;

const COLORS = {
	primary: "#D97706",
	primaryDeep: "#B45309",
	primaryMuted: "#FEF3C7",
	primaryBorder: "#FDE68A",
	textDark: "#0F172A",
	textMid: "#475569",
	textLight: "#94A3B8",
	background: "#FAFAF8",
	surface: "#FFFFFF",
	border: "#E2E8F0",
	borderLight: "#F1F5F9",
	success: "#10B981",
	successMuted: "#ECFDF5",
	successBorder: "#A7F3D0",
	white: "#FFFFFF",
};

function usePressFeedback() {
	const scale = useRef(new Animated.Value(1)).current;
	const onPressIn = () =>
		Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 60, bounciness: 0 }).start();
	const onPressOut = () =>
		Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 10 }).start();
	return { scale, onPressIn, onPressOut };
}

function SuccessBanner({ orderId, onDismiss }: { orderId: string; onDismiss: () => void }) {
	const translateY = useRef(new Animated.Value(-80)).current;
	useEffect(() => {
		Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 160 }).start();
	}, []);
	return (
		<Animated.View style={[styles.successBanner, { transform: [{ translateY }] }]}>
			<View style={styles.successIconWrap}>
				<Icon name="checkmark" size={14} color={COLORS.success} />
			</View>
			<View style={{ flex: 1, marginLeft: 10, gap: 2 }}>
				<T style={styles.successTitle}>Order placed successfully</T>
				<T style={styles.successSub}>Order #{orderId}</T>
			</View>
			<Pressable onPress={onDismiss} hitSlop={10}>
				<Icon name="close" size={16} color={COLORS.textLight} />
			</Pressable>
		</Animated.View>
	);
}

function SummaryRow({
	label,
	value,
	valueColor,
	icon,
	large,
}: {
	label: string;
	value: string;
	valueColor?: string;
	icon?: React.ReactNode;
	large?: boolean;
}) {
	return (
		<View style={styles.summaryRow}>
			<T style={large ? styles.summaryLabelLarge : styles.summaryLabel}>{label}</T>
			<View style={styles.summaryValueRow}>
				{icon}
				<T style={[large ? styles.summaryValueLarge : styles.summaryValue, valueColor ? { color: valueColor } : null]}>
					{value}
				</T>
			</View>
		</View>
	);
}

export default function Cart() {
	const { items, subTotal, clearCart } = useCart();
	const { session } = useAuth();
	const navigation = useNavigation();
	const insets = useSafeAreaInsets();
	const [isPlacingOrder, setIsPlacingOrder] = React.useState(false);
	const [placedOrderId, setPlacedOrderId] = React.useState<string | null>(null);
	const checkoutPress = usePressFeedback();

	useEffect(() => {
		navigation.setOptions({ headerShown: false });
	}, [navigation.setOptions]);

	const isEmpty = items.length === 0;

	const handleCheckout = async () => {
		if (!session?.token) { router.push("/login"); return; }
		if (items.length === 0) return;

		setIsPlacingOrder(true);
		const result = await createOrder(session.token, {
			items: items.map((i) => ({ productId: String(i.product.id), quantity: i.quantity })),
			deliveryAddress: { line1: "Home", line2: "", city: "Bengaluru", state: "Karnataka", postalCode: "560001", country: "India" },
			paymentMethod: "Cash on Delivery",
		});
		setIsPlacingOrder(false);

		if (!result.ok || !result.order) {
			Alert.alert("Order Failed", result.message || "Could not place order. Please try again.");
			return;
		}
		clearCart();
		setPlacedOrderId(result.order.id.slice(-6).toUpperCase());
	};

	return (
		<View style={{ flex: 1, backgroundColor: COLORS.background }}>

			{/* ── Header ── */}
			<View style={[styles.header, { paddingTop: insets.top > 0 ? insets.top + 12 : 52 }]}>
				<View style={styles.headerRow}>
					<Pressable onPress={() => router.back()} style={styles.headerIconBtn} hitSlop={6}>
						<Icon name="arrow-back" size={20} color={COLORS.textDark} />
					</Pressable>

					<View style={styles.headerCenter}>
						<T style={styles.headerTitle}>MY CART</T>
						<T style={styles.headerSub}>
							{isEmpty ? "Nothing here yet" : `${items.length} ${items.length === 1 ? "item" : "items"}`}
						</T>
					</View>

					<Pressable style={styles.headerIconBtn} hitSlop={6}>
						<Icon name="heart-outline" size={20} color={COLORS.textDark} />
					</Pressable>
				</View>
			</View>

			{/* ── Success banner ── */}
			{placedOrderId && (
				<SuccessBanner orderId={placedOrderId} onDismiss={() => setPlacedOrderId(null)} />
			)}

			{isEmpty ? (
				/* ── Empty state ── */
				<View style={styles.emptyContainer}>
					<View style={styles.emptyRingOuter}>
						<View style={styles.emptyRingInner}>
							<View style={styles.emptyIconWrap}>
								<MCIcon name="cart-outline" size={44} color={COLORS.primary} />
							</View>
						</View>
					</View>

					<T style={styles.emptyTitle}>Your cart is empty</T>
					<T style={styles.emptySub}>
						Looks like you haven't added any pieces to your collection yet.
					</T>

					<Pressable onPress={() => router.back()} style={styles.emptyAction}>
						<LinearGradient colors={[COLORS.primary, COLORS.primaryDeep]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientBtn}>
							<Icon name="storefront-outline" size={17} color={COLORS.white} style={{ marginRight: 8 }} />
							<T style={styles.btnTextWhite}>Browse Collection</T>
						</LinearGradient>
					</Pressable>

					{!session && (
						<View style={styles.emptyAuthBlock}>
							<View style={styles.dividerRow}>
								<View style={styles.dividerLine} />
								<T style={styles.dividerLabel}>OR</T>
								<View style={styles.dividerLine} />
							</View>
							<Pressable onPress={() => router.push("/login")}>
								<LinearGradient colors={[COLORS.primary, COLORS.primaryDeep]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientBtn}>
									<T style={styles.btnTextWhite}>Sign In</T>
								</LinearGradient>
							</Pressable>
							<Pressable onPress={() => router.push("/login")} style={styles.outlineBtn}>
								<T style={styles.btnTextPrimary}>Create Account</T>
							</Pressable>
						</View>
					)}
				</View>
			) : (
				<>
					<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 220 }}>

						{/* Delivery strip */}
						<View style={styles.deliveryStrip}>
							<DeliveryLocation />
						</View>

						{/* Cart items */}
						<View style={styles.itemsSection}>
							{items.map((item) => (
								<ProductCart key={item.product.id} {...item} />
							))}
						</View>

						{/* Promo code row */}
						<Pressable style={styles.promoCard}>
							<View style={styles.promoIconWrap}>
								<Icon name="pricetag-outline" size={16} color={COLORS.primary} />
							</View>
							<T style={styles.promoLabel}>Apply promo code</T>
							<Icon name="chevron-forward" size={16} color={COLORS.textLight} />
						</Pressable>

						{/* Order summary */}
						<View style={styles.summaryCard}>
							<View style={styles.summaryHeader}>
								<Icon name="receipt-outline" size={16} color={COLORS.primary} />
								<T style={styles.summaryTitle}>Order Summary</T>
							</View>

							<SummaryRow
								label={`Subtotal (${items.length} ${items.length === 1 ? "item" : "items"})`}
								value={`\u20B9${subTotal}`}
							/>
							<View style={styles.summaryRowGap} />
							<SummaryRow
								label="Delivery"
								value="Free"
								valueColor={COLORS.success}
								icon={<Icon name="checkmark-circle" size={14} color={COLORS.success} style={{ marginRight: 4 }} />}
							/>
							<View style={styles.summaryRowGap} />
							<SummaryRow label="Discount" value="\u20B90" valueColor={COLORS.textLight} />

							<View style={styles.summaryDivider} />

							<SummaryRow label="Total" value={`\u20B9${subTotal}`} large />

							<View style={styles.savingsChip}>
								<Icon name="happy-outline" size={14} color={COLORS.success} />
								<T style={styles.savingsText}>You save on free delivery with this order</T>
							</View>
						</View>

						{/* Payment method */}
						<View style={styles.paymentCard}>
							<View style={styles.paymentInner}>
								<View style={styles.paymentIconWrap}>
									<Icon name="cash-outline" size={18} color={COLORS.primary} />
								</View>
								<View style={styles.paymentTextBlock}>
									<T style={styles.paymentMethod}>Cash on Delivery</T>
									<T style={styles.paymentSub}>Pay when your order arrives</T>
								</View>
								<View style={styles.paymentBadge}>
									<T style={styles.paymentBadgeText}>Selected</T>
								</View>
							</View>
						</View>
					</ScrollView>

					{/* ── Sticky footer ── */}
					<View style={[styles.footer, { paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 24 }]}>
						{!session ? (
							<View style={styles.footerStack}>
								<Pressable onPress={() => router.push("/login")}>
									<LinearGradient colors={[COLORS.primary, COLORS.primaryDeep]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientBtn}>
										<Icon name="person-outline" size={16} color={COLORS.white} style={{ marginRight: 8 }} />
										<T style={styles.btnTextWhite}>Sign In to Checkout</T>
									</LinearGradient>
								</Pressable>
								<Pressable onPress={() => router.push("/login")} style={styles.outlineBtn}>
									<T style={styles.btnTextPrimary}>Create Account</T>
								</Pressable>
							</View>
						) : (
							<View style={styles.footerStack}>
								{/* Total row */}
								<View style={styles.footerTotalRow}>
									<View>
										<T style={styles.footerTotalLabel}>Total payable</T>
										<T style={styles.footerTotalAmount}>{"\u20B9"}{subTotal}</T>
									</View>
									<View style={styles.itemCountPill}>
										<T style={styles.itemCountText}>
											{items.length} {items.length === 1 ? "item" : "items"}
										</T>
									</View>
								</View>

								{/* Checkout button */}
								<Animated.View style={{ transform: [{ scale: checkoutPress.scale }] }}>
									<Pressable
										onPress={handleCheckout}
										onPressIn={checkoutPress.onPressIn}
										onPressOut={checkoutPress.onPressOut}
										disabled={isPlacingOrder}
									>
										<LinearGradient
											colors={[COLORS.primary, COLORS.primaryDeep]}
											start={{ x: 0, y: 0 }}
											end={{ x: 1, y: 0 }}
											style={[styles.checkoutBtn, isPlacingOrder && { opacity: 0.7 }]}
										>
											{isPlacingOrder ? (
												<T style={styles.btnTextWhite}>Placing order...</T>
											) : (
												<>
													<Icon name="bag-check-outline" size={20} color={COLORS.white} style={{ marginRight: 10 }} />
													<T style={styles.checkoutBtnText}>Place Order</T>
													<View style={styles.checkoutArrow}>
														<Icon name="arrow-forward" size={16} color={COLORS.primary} />
													</View>
												</>
											)}
										</LinearGradient>
									</Pressable>
								</Animated.View>

								<T style={styles.termsText}>By placing order you agree to our Terms of Service</T>
							</View>
						)}
					</View>
				</>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	/* ── Header ── */
	header: {
		backgroundColor: COLORS.surface,
		paddingHorizontal: 20,
		paddingBottom: 14,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.borderLight,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.04,
		shadowRadius: 10,
		elevation: 3,
	},
	headerRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	headerCenter: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 8,
	},
	headerTitle: {
		fontSize: 17,
		fontWeight: "900",
		color: COLORS.textDark,
		letterSpacing: 1.8,
		textAlign: "center",
	},
	headerSub: {
		fontSize: 12,
		color: COLORS.textLight,
		fontWeight: "500",
		textAlign: "center",
		marginTop: 1,
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

	/* ── Success banner ── */
	successBanner: {
		flexDirection: "row",
		alignItems: "center",
		marginHorizontal: 20,
		marginTop: 12,
		backgroundColor: COLORS.successMuted,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: COLORS.successBorder,
		paddingHorizontal: 14,
		paddingVertical: 12,
	},
	successIconWrap: {
		width: 28,
		height: 28,
		borderRadius: 14,
		backgroundColor: COLORS.white,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 1,
		borderColor: COLORS.successBorder,
	},
	successTitle: {
		fontSize: 14,
		fontWeight: "700",
		color: COLORS.success,
	},
	successSub: {
		fontSize: 12,
		color: COLORS.textMid,
		marginTop: 1,
	},

	/* ── Empty state ── */
	emptyContainer: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 24,
		paddingBottom: 60,
	},
	emptyRingOuter: {
		width: 140,
		height: 140,
		borderRadius: 70,
		borderWidth: 1,
		borderColor: COLORS.primaryBorder,
		alignItems: "center",
		justifyContent: "center",
	},
	emptyRingInner: {
		width: 116,
		height: 116,
		borderRadius: 58,
		borderWidth: 1.5,
		borderColor: "#FDE68A",
		alignItems: "center",
		justifyContent: "center",
	},
	emptyIconWrap: {
		width: 92,
		height: 92,
		borderRadius: 46,
		backgroundColor: COLORS.primaryMuted,
		alignItems: "center",
		justifyContent: "center",
		shadowColor: COLORS.primary,
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.18,
		shadowRadius: 20,
		elevation: 4,
	},
	emptyTitle: {
		fontSize: 22,
		fontWeight: "900",
		color: COLORS.textDark,
		letterSpacing: -0.4,
		marginTop: 28,
		textAlign: "center",
	},
	emptySub: {
		fontSize: 14,
		color: COLORS.textLight,
		textAlign: "center",
		marginTop: 8,
		lineHeight: 21,
		paddingHorizontal: 24,
	},
	emptyAction: {
		marginTop: 28,
		width: "80%",
	},
	emptyAuthBlock: {
		width: "80%",
		gap: 10,
		marginTop: 16,
	},

	/* ── Delivery ── */
	deliveryStrip: {
		backgroundColor: COLORS.surface,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.borderLight,
	},
	itemsSection: {
		paddingHorizontal: 20,
		paddingTop: 12,
		gap: 12,
	},

	/* ── Promo ── */
	promoCard: {
		flexDirection: "row",
		alignItems: "center",
		marginHorizontal: 20,
		marginTop: 16,
		backgroundColor: COLORS.surface,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: COLORS.borderLight,
		paddingHorizontal: 14,
		paddingVertical: 14,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.03,
		shadowRadius: 6,
		elevation: 1,
	},
	promoIconWrap: {
		width: 32,
		height: 32,
		borderRadius: 8,
		backgroundColor: COLORS.primaryMuted,
		alignItems: "center",
		justifyContent: "center",
	},
	promoLabel: {
		flex: 1,
		fontSize: 14,
		fontWeight: "600",
		color: COLORS.textDark,
		marginLeft: 10,
	},

	/* ── Summary ── */
	summaryCard: {
		marginHorizontal: 20,
		marginTop: 14,
		backgroundColor: COLORS.surface,
		borderRadius: 18,
		padding: 20,
		borderWidth: 1,
		borderColor: COLORS.borderLight,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.04,
		shadowRadius: 12,
		elevation: 2,
	},
	summaryHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		marginBottom: 16,
	},
	summaryTitle: {
		fontSize: 15,
		fontWeight: "800",
		color: COLORS.textDark,
		letterSpacing: -0.2,
	},
	summaryRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	summaryRowGap: {
		height: 12,
	},
	summaryValueRow: {
		flexDirection: "row",
		alignItems: "center",
	},
	summaryLabel: {
		fontSize: 14,
		fontWeight: "500",
		color: COLORS.textMid,
	},
	summaryLabelLarge: {
		fontSize: 16,
		fontWeight: "800",
		color: COLORS.textDark,
	},
	summaryValue: {
		fontSize: 14,
		fontWeight: "600",
		color: COLORS.textDark,
	},
	summaryValueLarge: {
		fontSize: 20,
		fontWeight: "900",
		color: COLORS.textDark,
		letterSpacing: -0.5,
	},
	summaryDivider: {
		height: 1,
		backgroundColor: COLORS.borderLight,
		marginVertical: 14,
	},
	savingsChip: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: COLORS.successMuted,
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 8,
		marginTop: 14,
		borderWidth: 1,
		borderColor: COLORS.successBorder,
		gap: 6,
	},
	savingsText: {
		fontSize: 12,
		fontWeight: "600",
		color: COLORS.success,
		flex: 1,
	},

	/* ── Payment ── */
	paymentCard: {
		marginHorizontal: 20,
		marginTop: 14,
		backgroundColor: COLORS.surface,
		borderRadius: 14,
		padding: 16,
		borderWidth: 1,
		borderColor: COLORS.borderLight,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.03,
		shadowRadius: 6,
		elevation: 1,
	},
	paymentInner: {
		flexDirection: "row",
		alignItems: "center",
	},
	paymentIconWrap: {
		width: 40,
		height: 40,
		borderRadius: 12,
		backgroundColor: COLORS.primaryMuted,
		alignItems: "center",
		justifyContent: "center",
	},
	paymentTextBlock: {
		flex: 1,
		marginLeft: 12,
		gap: 2,
	},
	paymentMethod: {
		fontSize: 14,
		fontWeight: "700",
		color: COLORS.textDark,
	},
	paymentSub: {
		fontSize: 12,
		color: COLORS.textLight,
		marginTop: 1,
	},
	paymentBadge: {
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 6,
		backgroundColor: COLORS.primaryMuted,
		borderWidth: 1,
		borderColor: COLORS.primaryBorder,
	},
	paymentBadgeText: {
		fontSize: 11,
		fontWeight: "700",
		color: COLORS.primary,
	},

	/* ── Footer ── */
	footer: {
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
	footerStack: {
		width: "100%",
		gap: 10,
	},
	footerTotalRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 4,
	},
	footerTotalLabel: {
		fontSize: 12,
		color: COLORS.textLight,
		letterSpacing: 0.3,
	},
	footerTotalAmount: {
		fontSize: 22,
		fontWeight: "900",
		color: COLORS.textDark,
		letterSpacing: -0.5,
		marginTop: 1,
	},
	itemCountPill: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 20,
		backgroundColor: COLORS.primaryMuted,
		borderWidth: 1,
		borderColor: COLORS.primaryBorder,
	},
	itemCountText: {
		fontSize: 13,
		fontWeight: "700",
		color: COLORS.primary,
	},
	checkoutBtn: {
		height: 56,
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
	checkoutBtnText: {
		fontSize: 16,
		fontWeight: "700",
		color: COLORS.white,
	},
	checkoutArrow: {
		position: "absolute",
		right: 16,
		width: 30,
		height: 30,
		borderRadius: 15,
		backgroundColor: COLORS.white,
		alignItems: "center",
		justifyContent: "center",
	},
	termsText: {
		fontSize: 11,
		color: COLORS.textLight,
		textAlign: "center",
	},

	/* ── Shared buttons ── */
	gradientBtn: {
		height: 52,
		borderRadius: 14,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		shadowColor: COLORS.primary,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.28,
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
	btnTextWhite: {
		fontSize: 15,
		fontWeight: "700",
		color: COLORS.white,
	},
	btnTextPrimary: {
		fontSize: 15,
		fontWeight: "700",
		color: COLORS.primary,
	},

	/* ── Divider ── */
	dividerRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	dividerLine: {
		flex: 1,
		height: 1,
		backgroundColor: COLORS.border,
	},
	dividerLabel: {
		fontSize: 10,
		fontWeight: "700",
		color: COLORS.textLight,
		letterSpacing: 1.2,
	},
});