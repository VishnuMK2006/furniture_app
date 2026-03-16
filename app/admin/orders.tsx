import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	Alert,
	Animated,
	FlatList,
	Pressable,
	ScrollView,
	StyleSheet,
	Text as RNText,
	TouchableWithoutFeedback,
	View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import Icon from "@expo/vector-icons/Ionicons";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthProvider";
import { Order, OrderStatus } from "@/types/order";
import { getAllOrders, ORDER_STATUSES, updateOrderStatus } from "@/utils/orders";

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
	white: "#FFFFFF",
};

const STATUS_META: Record<string, { color: string; bg: string; border: string; icon: string }> = {
	Pending:   { color: "#D97706", bg: "#FEF3C7", border: "#FDE68A",  icon: "time-outline" },
	Confirmed: { color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE",  icon: "checkmark-circle-outline" },
	Shipped:   { color: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC",  icon: "cube-outline" },
	Delivered: { color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0",  icon: "bag-check-outline" },
	Cancelled: { color: "#EF4444", bg: "#FEF2F2", border: "#FECACA",  icon: "close-circle-outline" },
};

function getMeta(status: string) {
	return STATUS_META[status] ?? { color: COLORS.textLight, bg: COLORS.borderLight, border: COLORS.border, icon: "ellipse-outline" };
}

function formatCurrency(value: number) {
	return `\u20B9${value.toFixed(2)}`;
}

function formatDate(value: string) {
	return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

/* ── Status pill ── */
function StatusPill({ status }: { status: string }) {
	const m = getMeta(status);
	return (
		<View style={[styles.statusPill, { backgroundColor: m.bg, borderColor: m.border }]}>
			<Icon name={m.icon as any} size={12} color={m.color} />
			<T style={[styles.statusPillText, { color: m.color }]}>{status}</T>
		</View>
	);
}

/* ── Order list card ── */
function OrderCard({ item, onPress }: { item: Order; onPress: () => void }) {
	const m = getMeta(item.status);
	return (
		<Pressable onPress={onPress} style={({ pressed }) => [styles.orderCard, pressed && { opacity: 0.8 }]}>
			{/* Left accent bar */}
			<View style={[styles.orderAccent, { backgroundColor: m.color }]} />

			<View style={styles.orderCardInner}>
				<View style={styles.orderCardTop}>
					<T style={styles.orderIdText}>#{item.id.slice(-6).toUpperCase()}</T>
					<StatusPill status={item.status} />
				</View>

				<T style={styles.orderCustomer} numberOfLines={1}>
					{item.customer.name}
				</T>
				<T style={styles.orderEmail} numberOfLines={1}>
					{item.customer.email}
				</T>

				<View style={styles.orderCardFooter}>
					<View style={styles.orderMeta}>
						<Icon name="cube-outline" size={12} color={COLORS.textLight} />
						<T style={styles.orderMetaText}>{item.items.length} items</T>
					</View>
					<View style={styles.orderMeta}>
						<Icon name="cash-outline" size={12} color={COLORS.textLight} />
						<T style={styles.orderMetaText}>{formatCurrency(item.pricing.total)}</T>
					</View>
					<View style={styles.orderMeta}>
						<Icon name="calendar-outline" size={12} color={COLORS.textLight} />
						<T style={styles.orderMetaText}>{new Date(item.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</T>
					</View>
				</View>
			</View>
		</Pressable>
	);
}

/* ── Detail row ── */
function DetailRow({ label, value }: { label: string; value: string }) {
	return (
		<View style={styles.detailRow}>
			<T style={styles.detailLabel}>{label}</T>
			<T style={styles.detailValue}>{value}</T>
		</View>
	);
}

/* ── Section label ── */
function SectionLabel({ title, icon }: { title: string; icon: string }) {
	return (
		<View style={styles.sectionLabelRow}>
			<View style={styles.sectionLabelIcon}>
				<Icon name={icon as any} size={13} color={COLORS.primary} />
			</View>
			<T style={styles.sectionLabelText}>{title}</T>
		</View>
	);
}

export default function OrderManagementScreen() {
	const insets = useSafeAreaInsets();
	const { session } = useAuth();
	const isAdmin = session?.user?.role === "admin";
	const token = session?.token ?? "";

	const [orders, setOrders] = useState<Order[]>([]);
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
	const [activeStatusFilter, setActiveStatusFilter] = useState<OrderStatus | "All">("All");
	const [isLoading, setIsLoading] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);

	// Bottom sheet animation — always in tree
	const sheetAnim = useRef(new Animated.Value(800)).current;
	const overlayAnim = useRef(new Animated.Value(0)).current;
	const sheetVisible = useRef(false);

	const openSheet = (order: Order) => {
		setSelectedOrder(order);
		sheetVisible.current = true;
		Animated.parallel([
			Animated.spring(sheetAnim, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 160 }),
			Animated.timing(overlayAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
		]).start();
	};

	const closeSheet = () => {
		sheetVisible.current = false;
		Animated.parallel([
			Animated.spring(sheetAnim, { toValue: 800, useNativeDriver: true, damping: 20, stiffness: 200 }),
			Animated.timing(overlayAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
		]).start(() => setSelectedOrder(null));
	};

	const loadOrders = useCallback(async () => {
		if (!token) return;
		setIsLoading(true);
		const data = await getAllOrders(token, activeStatusFilter === "All" ? undefined : activeStatusFilter);
		setOrders(data);
		setIsLoading(false);
	}, [token, activeStatusFilter]);

	useFocusEffect(useCallback(() => { void loadOrders(); }, [loadOrders]));

	useEffect(() => {
		if (!isAdmin) router.replace("/(tabs)");
	}, [isAdmin]);

	const onChangeStatus = async (order: Order, status: OrderStatus) => {
		if (!token) { Alert.alert("Session Expired", "Please login again."); router.replace("/login"); return; }
		setIsUpdating(true);
		const result = await updateOrderStatus(token, order.id, status);
		setIsUpdating(false);
		if (!result.ok || !result.order) { Alert.alert("Update Failed", result.message || "Could not update order status"); return; }
		setOrders((prev) => prev.map((item) => (item.id === order.id ? result.order! : item)));
		setSelectedOrder(result.order);
	};

	if (!isAdmin) return null;

	const filterLabels: Array<OrderStatus | "All"> = ["All", ...ORDER_STATUSES];

	// Counts per status
	const counts = orders.reduce<Record<string, number>>((acc, o) => {
		acc[o.status] = (acc[o.status] ?? 0) + 1;
		return acc;
	}, {});

	return (
		<View style={{ flex: 1, backgroundColor: COLORS.background }}>

			{/* ── Header ── */}
			<View style={[styles.header, { paddingTop: insets.top > 0 ? insets.top + 12 : 52 }]}>
				<View style={styles.headerRow}>
					<Pressable onPress={() => router.back()} style={styles.headerIconBtn} hitSlop={6}>
						<Icon name="arrow-back" size={20} color={COLORS.textDark} />
					</Pressable>
					<View style={styles.headerCenter}>
						<T style={styles.headerTitle}>Order Management</T>
						<T style={styles.headerSub}>{orders.length} orders total</T>
					</View>
					<Pressable onPress={loadOrders} style={styles.headerIconBtn} hitSlop={6}>
						<Icon name="refresh-outline" size={20} color={COLORS.textDark} />
					</Pressable>
				</View>
			</View>

			{/* ── Status filter tabs ── */}
			<View style={styles.filterBar}>
				<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>
					{filterLabels.map((status) => {
						const active = status === activeStatusFilter;
						const m = status === "All" ? null : getMeta(status);
						const count = status === "All" ? orders.length : (counts[status] ?? 0);
						return (
							<Pressable key={status} onPress={() => setActiveStatusFilter(status)}>
								{active ? (
									<LinearGradient
										colors={[COLORS.primary, COLORS.primaryDeep]}
										start={{ x: 0, y: 0 }}
										end={{ x: 1, y: 0 }}
										style={styles.filterChipActive}
									>
										{m && <Icon name={m.icon as any} size={12} color={COLORS.white} />}
										<T style={styles.filterChipTextActive}>{status}</T>
										{count > 0 && <View style={styles.filterBadgeActive}><T style={styles.filterBadgeTextActive}>{count}</T></View>}
									</LinearGradient>
								) : (
									<View style={styles.filterChip}>
										{m && <Icon name={m.icon as any} size={12} color={COLORS.textLight} />}
										<T style={styles.filterChipText}>{status}</T>
										{count > 0 && <View style={styles.filterBadge}><T style={styles.filterBadgeText}>{count}</T></View>}
									</View>
								)}
							</Pressable>
						);
					})}
				</ScrollView>
			</View>

			{/* ── Order list ── */}
			<FlatList
				data={orders}
				keyExtractor={(item) => item.id}
				onRefresh={loadOrders}
				refreshing={isLoading}
				contentContainerStyle={styles.listContent}
				ListEmptyComponent={
					<View style={styles.emptyState}>
						<View style={styles.emptyIcon}>
							<MCIcon name="clipboard-text-outline" size={36} color={COLORS.primary} />
						</View>
						<T style={styles.emptyTitle}>No orders found</T>
						<T style={styles.emptySub}>No orders match the selected filter.</T>
					</View>
				}
				renderItem={({ item }) => (
					<OrderCard item={item} onPress={() => openSheet(item)} />
				)}
			/>

			{/* ── Detail sheet ── */}
			{selectedOrder && (
				<>
					{/* Scrim */}
					<TouchableWithoutFeedback onPress={closeSheet}>
						<Animated.View style={[styles.sheetScrim, { opacity: overlayAnim }]} />
					</TouchableWithoutFeedback>

					{/* Sheet */}
					<Animated.View
						style={[
							styles.sheet,
							{
								paddingBottom: insets.bottom > 0 ? insets.bottom + 12 : 24,
								transform: [{ translateY: sheetAnim }],
							},
						]}
					>
						{/* Handle + header */}
						<View style={styles.sheetHandle} />
						<View style={styles.sheetHeaderRow}>
							<View>
								<T style={styles.sheetTitle}>Order #{selectedOrder.id.slice(-6).toUpperCase()}</T>
								<T style={styles.sheetDate}>{formatDate(selectedOrder.created_at)}</T>
							</View>
							<View style={styles.sheetHeaderRight}>
								<StatusPill status={selectedOrder.status} />
								<Pressable onPress={closeSheet} style={styles.sheetCloseBtn} hitSlop={8}>
									<Icon name="close" size={18} color={COLORS.textMid} />
								</Pressable>
							</View>
						</View>

						<ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 12 }}>

							{/* Customer */}
							<View style={styles.detailCard}>
								<SectionLabel title="Customer" icon="person-outline" />
								<DetailRow label="Name" value={selectedOrder.customer.name} />
								<DetailRow label="Email" value={selectedOrder.customer.email} />
								<DetailRow label="Phone" value={selectedOrder.customer.phone || "—"} />
							</View>

							{/* Address */}
							<View style={styles.detailCard}>
								<SectionLabel title="Delivery Address" icon="location-outline" />
								<DetailRow label="Line 1" value={selectedOrder.deliveryAddress.line1} />
								{selectedOrder.deliveryAddress.line2 ? <DetailRow label="Line 2" value={selectedOrder.deliveryAddress.line2} /> : null}
								<DetailRow label="City" value={selectedOrder.deliveryAddress.city} />
								<DetailRow label="State" value={`${selectedOrder.deliveryAddress.state} ${selectedOrder.deliveryAddress.postalCode}`} />
								<DetailRow label="Country" value={selectedOrder.deliveryAddress.country} />
							</View>

							{/* Payment */}
							<View style={styles.detailCard}>
								<SectionLabel title="Payment" icon="card-outline" />
								<DetailRow label="Method" value={selectedOrder.payment.method} />
								<DetailRow label="Status" value={selectedOrder.payment.status} />
								<DetailRow label="Ref" value={selectedOrder.payment.transactionRef || "—"} />
							</View>

							{/* Items */}
							<View style={styles.detailCard}>
								<SectionLabel title="Items" icon="cube-outline" />
								{selectedOrder.items.map((item) => (
									<View key={`${selectedOrder.id}-${item.productId}`} style={styles.orderItem}>
										<View style={styles.orderItemLeft}>
											<T style={styles.orderItemName} numberOfLines={1}>{item.name}</T>
											<T style={styles.orderItemMeta}>Qty {item.quantity}  ×  {formatCurrency(item.unitPrice)}</T>
										</View>
										<T style={styles.orderItemTotal}>{formatCurrency(item.totalPrice)}</T>
									</View>
								))}
							</View>

							{/* Pricing summary */}
							<View style={styles.detailCard}>
								<SectionLabel title="Pricing" icon="receipt-outline" />
								<View style={styles.pricingRow}><T style={styles.pricingLabel}>Subtotal</T><T style={styles.pricingValue}>{formatCurrency(selectedOrder.pricing.subtotal)}</T></View>
								<View style={styles.pricingRow}><T style={styles.pricingLabel}>Shipping</T><T style={styles.pricingValue}>{formatCurrency(selectedOrder.pricing.shipping)}</T></View>
								<View style={styles.pricingDivider} />
								<View style={styles.pricingRow}>
									<T style={styles.pricingLabelBold}>Total</T>
									<T style={styles.pricingValueBold}>{formatCurrency(selectedOrder.pricing.total)}</T>
								</View>
							</View>

							{/* Status updater */}
							<View style={[styles.detailCard, { marginBottom: 20 }]}>
								<SectionLabel title="Update Status" icon="swap-horizontal-outline" />
								<View style={styles.statusGrid}>
									{ORDER_STATUSES.map((status) => {
										const active = selectedOrder.status === status;
										const m = getMeta(status);
										return (
											<Pressable
												key={status}
												disabled={isUpdating}
												onPress={() => onChangeStatus(selectedOrder, status)}
												style={[
													styles.statusChip,
													{
														borderColor: active ? m.color : COLORS.border,
														backgroundColor: active ? m.bg : COLORS.surface,
														opacity: isUpdating ? 0.6 : 1,
													},
												]}
											>
												<Icon name={m.icon as any} size={13} color={active ? m.color : COLORS.textLight} />
												<T style={[styles.statusChipText, { color: active ? m.color : COLORS.textMid }]}>
													{status}
												</T>
												{active && <Icon name="checkmark" size={11} color={m.color} style={{ marginLeft: 2 }} />}
											</Pressable>
										);
									})}
								</View>
							</View>

						</ScrollView>
					</Animated.View>
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
		paddingHorizontal: 8,
	},
	headerTitle: {
		fontSize: 17,
		fontWeight: "900",
		color: COLORS.textDark,
		letterSpacing: 0.3,
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

	/* Filter bar */
	filterBar: {
		backgroundColor: COLORS.surface,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.borderLight,
	},
	filterList: {
		paddingHorizontal: 16,
		paddingVertical: 10,
		gap: 8,
	},
	filterChip: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 12,
		paddingVertical: 7,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: COLORS.border,
		backgroundColor: COLORS.surface,
		gap: 5,
	},
	filterChipActive: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 12,
		paddingVertical: 7,
		borderRadius: 20,
		gap: 5,
	},
	filterChipText: {
		fontSize: 13,
		fontWeight: "500",
		color: COLORS.textMid,
	},
	filterChipTextActive: {
		fontSize: 13,
		fontWeight: "700",
		color: COLORS.white,
	},
	filterBadge: {
		minWidth: 18,
		height: 18,
		borderRadius: 9,
		backgroundColor: COLORS.borderLight,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 4,
	},
	filterBadgeText: {
		fontSize: 10,
		fontWeight: "700",
		color: COLORS.textLight,
	},
	filterBadgeActive: {
		minWidth: 18,
		height: 18,
		borderRadius: 9,
		backgroundColor: "rgba(255,255,255,0.25)",
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 4,
	},
	filterBadgeTextActive: {
		fontSize: 10,
		fontWeight: "700",
		color: COLORS.white,
	},

	/* List */
	listContent: {
		paddingHorizontal: 16,
		paddingTop: 14,
		paddingBottom: 30,
	},

	/* Order card */
	orderCard: {
		flexDirection: "row",
		backgroundColor: COLORS.surface,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: COLORS.borderLight,
		marginBottom: 10,
		overflow: "hidden",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.04,
		shadowRadius: 8,
		elevation: 2,
	},
	orderAccent: {
		width: 4,
	},
	orderCardInner: {
		flex: 1,
		padding: 14,
		gap: 3,
	},
	orderCardTop: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 4,
	},
	orderIdText: {
		fontSize: 15,
		fontWeight: "800",
		color: COLORS.textDark,
		letterSpacing: 0.5,
	},
	orderCustomer: {
		fontSize: 13,
		fontWeight: "600",
		color: COLORS.textDark,
	},
	orderEmail: {
		fontSize: 12,
		color: COLORS.textLight,
		marginTop: 1,
	},
	orderCardFooter: {
		flexDirection: "row",
		gap: 12,
		marginTop: 8,
	},
	orderMeta: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
	},
	orderMetaText: {
		fontSize: 11,
		color: COLORS.textLight,
		fontWeight: "500",
	},

	/* Status pill */
	statusPill: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 20,
		borderWidth: 1,
		gap: 4,
	},
	statusPillText: {
		fontSize: 11,
		fontWeight: "700",
	},

	/* Empty state */
	emptyState: {
		alignItems: "center",
		paddingTop: 60,
		gap: 10,
	},
	emptyIcon: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: COLORS.primaryMuted,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 4,
	},
	emptyTitle: {
		fontSize: 17,
		fontWeight: "700",
		color: COLORS.textDark,
	},
	emptySub: {
		fontSize: 13,
		color: COLORS.textLight,
		textAlign: "center",
	},

	/* Sheet */
	sheetScrim: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(0,0,0,0.45)",
		zIndex: 10,
	},
	sheet: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		maxHeight: "82%",
		backgroundColor: COLORS.surface,
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		paddingHorizontal: 20,
		paddingTop: 12,
		zIndex: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: -6 },
		shadowOpacity: 0.1,
		shadowRadius: 20,
		elevation: 20,
	},
	sheetHandle: {
		width: 36,
		height: 4,
		borderRadius: 2,
		backgroundColor: COLORS.border,
		alignSelf: "center",
		marginBottom: 14,
	},
	sheetHeaderRow: {
		flexDirection: "row",
		alignItems: "flex-start",
		justifyContent: "space-between",
	},
	sheetTitle: {
		fontSize: 18,
		fontWeight: "900",
		color: COLORS.textDark,
		letterSpacing: 0.3,
	},
	sheetDate: {
		fontSize: 12,
		color: COLORS.textLight,
		marginTop: 3,
	},
	sheetHeaderRight: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	sheetCloseBtn: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: COLORS.borderLight,
		alignItems: "center",
		justifyContent: "center",
	},

	/* Detail cards */
	detailCard: {
		backgroundColor: COLORS.surface,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: COLORS.borderLight,
		padding: 14,
		marginBottom: 10,
		gap: 8,
	},
	sectionLabelRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		marginBottom: 4,
	},
	sectionLabelIcon: {
		width: 26,
		height: 26,
		borderRadius: 7,
		backgroundColor: COLORS.primaryMuted,
		alignItems: "center",
		justifyContent: "center",
	},
	sectionLabelText: {
		fontSize: 13,
		fontWeight: "800",
		color: COLORS.textDark,
		letterSpacing: 0.2,
	},
	detailRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		gap: 12,
	},
	detailLabel: {
		fontSize: 12,
		fontWeight: "600",
		color: COLORS.textLight,
		minWidth: 70,
	},
	detailValue: {
		fontSize: 13,
		fontWeight: "500",
		color: COLORS.textDark,
		flex: 1,
		textAlign: "right",
	},

	/* Order items */
	orderItem: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 6,
		borderTopWidth: 1,
		borderTopColor: COLORS.borderLight,
	},
	orderItemLeft: {
		flex: 1,
		paddingRight: 12,
		gap: 2,
	},
	orderItemName: {
		fontSize: 13,
		fontWeight: "600",
		color: COLORS.textDark,
	},
	orderItemMeta: {
		fontSize: 12,
		color: COLORS.textLight,
	},
	orderItemTotal: {
		fontSize: 14,
		fontWeight: "700",
		color: COLORS.textDark,
	},

	/* Pricing */
	pricingRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	pricingLabel: {
		fontSize: 13,
		fontWeight: "500",
		color: COLORS.textMid,
	},
	pricingValue: {
		fontSize: 13,
		fontWeight: "600",
		color: COLORS.textDark,
	},
	pricingLabelBold: {
		fontSize: 15,
		fontWeight: "800",
		color: COLORS.textDark,
	},
	pricingValueBold: {
		fontSize: 16,
		fontWeight: "900",
		color: COLORS.textDark,
		letterSpacing: -0.3,
	},
	pricingDivider: {
		height: 1,
		backgroundColor: COLORS.borderLight,
		marginVertical: 6,
	},

	/* Status chips */
	statusGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
		marginTop: 4,
	},
	statusChip: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 10,
		paddingVertical: 8,
		borderRadius: 10,
		borderWidth: 1.5,
		gap: 5,
	},
	statusChipText: {
		fontSize: 13,
		fontWeight: "600",
	},

	/* Shared */
	textMid: {
		color: COLORS.textMid,
	},
});