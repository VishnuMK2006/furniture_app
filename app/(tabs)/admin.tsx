import React, { useState, useCallback, useEffect, useRef } from "react";
import {
	Alert,
	Animated,
	FlatList,
	Pressable,
	ScrollView,
	StyleSheet,
	Text as RNText,
	View,
} from "react-native";
import { Image } from "tamagui";
import { useNavigation, router, useFocusEffect } from "expo-router";
import Icon from "@expo/vector-icons/Ionicons";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthProvider";
import { Product } from "@/types/product";
import { getAllProducts } from "@/utils/products";
import { endpoints } from "@/utils/api";

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
	success: "#10B981",
	successMuted: "#ECFDF5",
	successBorder: "#A7F3D0",
	warning: "#F59E0B",
	warningMuted: "#FFFBEB",
	warningBorder: "#FDE68A",
	danger: "#EF4444",
	dangerMuted: "#FEF2F2",
	dangerBorder: "#FECACA",
	blue: "#2563EB",
	blueMuted: "#EFF6FF",
	blueBorder: "#BFDBFE",
};

const TABS = ["All", "In Stock", "Low Stock", "Out of Stock"] as const;
type Tab = typeof TABS[number];

/* ── Stock badge ── */
function StockBadge({ amount }: { amount: number }) {
	if (amount === 0) {
		return (
			<View style={[styles.badge, { backgroundColor: COLORS.dangerMuted, borderColor: COLORS.dangerBorder }]}>
				<Icon name="close-circle-outline" size={11} color={COLORS.danger} />
				<T style={[styles.badgeText, { color: COLORS.danger }]}>Out of stock</T>
			</View>
		);
	}
	if (amount < 5) {
		return (
			<View style={[styles.badge, { backgroundColor: COLORS.warningMuted, borderColor: COLORS.warningBorder }]}>
				<Icon name="warning-outline" size={11} color={COLORS.warning} />
				<T style={[styles.badgeText, { color: COLORS.warning }]}>Low — {amount} left</T>
			</View>
		);
	}
	return (
		<View style={[styles.badge, { backgroundColor: COLORS.successMuted, borderColor: COLORS.successBorder }]}>
			<Icon name="checkmark-circle-outline" size={11} color={COLORS.success} />
			<T style={[styles.badgeText, { color: COLORS.success }]}>{amount} in stock</T>
		</View>
	);
}

/* ── Quick action button (Manage Orders / Categories) ── */
function QuickAction({
	icon,
	label,
	color,
	bg,
	border,
	onPress,
}: {
	icon: string;
	label: string;
	color: string;
	bg: string;
	border: string;
	onPress: () => void;
}) {
	return (
		<Pressable
			onPress={onPress}
			style={({ pressed }) => [styles.quickAction, { backgroundColor: bg, borderColor: border }, pressed && { opacity: 0.75 }]}
		>
			<Icon name={icon as any} size={16} color={color} />
			<T style={[styles.quickActionText, { color }]}>{label}</T>
		</Pressable>
	);
}

/* ── Product list card ── */
function ProductCard({
	item,
	onEdit,
	onDelete,
	onPress,
}: {
	item: Product;
	onEdit: () => void;
	onDelete: () => void;
	onPress: () => void;
}) {
	const pressScale = useRef(new Animated.Value(1)).current;

	const handlePressIn = () =>
		Animated.spring(pressScale, { toValue: 0.98, useNativeDriver: true, speed: 60, bounciness: 0 }).start();
	const handlePressOut = () =>
		Animated.spring(pressScale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 8 }).start();

	const stockColor =
		item.amountInStock === 0 ? COLORS.danger :
		item.amountInStock < 5  ? COLORS.warning :
		COLORS.success;

	return (
		<Animated.View style={{ transform: [{ scale: pressScale }] }}>
			<Pressable
				onPress={onPress}
				onPressIn={handlePressIn}
				onPressOut={handlePressOut}
				style={styles.productCard}
			>
				{/* Stock accent bar */}
				<View style={[styles.productAccent, { backgroundColor: stockColor }]} />

				{/* Thumbnail */}
				<View style={styles.productThumb}>
					<Image
						src={item.imageUrl ?? "https://via.placeholder.com/80"}
						w="100%"
						h="100%"
						objectFit="contain"
					/>
				</View>

				{/* Info */}
				<View style={styles.productInfo}>
					<T style={styles.productName} numberOfLines={1}>{item.name}</T>
					<View style={styles.productMetaRow}>
						<StockBadge amount={item.amountInStock} />
					</View>
					<View style={styles.productPriceRow}>
						<T style={styles.productPrice}>{"\u20B9"}{item.currentPrice.toFixed(0)}</T>
						{item.sku ? <T style={styles.productSku}>{item.sku}</T> : null}
					</View>
				</View>

				{/* Actions */}
				<View style={styles.productActions}>
					<Pressable
						onPress={(e) => { e.stopPropagation(); onEdit(); }}
						style={styles.actionBtn}
						hitSlop={6}
					>
						<Icon name="pencil-outline" size={16} color={COLORS.primary} />
					</Pressable>
					<Pressable
						onPress={(e) => { e.stopPropagation(); onDelete(); }}
						style={[styles.actionBtn, styles.actionBtnDanger]}
						hitSlop={6}
					>
						<Icon name="trash-outline" size={16} color={COLORS.danger} />
					</Pressable>
				</View>
			</Pressable>
		</Animated.View>
	);
}

export default function AdminProducts() {
	const navigation = useNavigation();
	const insets = useSafeAreaInsets();
	const { session } = useAuth();
	const isAdmin = session?.user?.role === "admin";

	const [products, setProducts] = useState<Product[]>([]);
	const [activeTab, setActiveTab] = useState<Tab>("All");
	const [isLoading, setIsLoading] = useState(false);

	// FAB pulse animation
	const fabScale = useRef(new Animated.Value(1)).current;
	const fabPressIn = () => Animated.spring(fabScale, { toValue: 0.9, useNativeDriver: true, speed: 60, bounciness: 0 }).start();
	const fabPressOut = () => Animated.spring(fabScale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 14 }).start();

	const loadProducts = useCallback(async () => {
		setIsLoading(true);
		const data = await getAllProducts();
		setProducts(data);
		setIsLoading(false);
	}, []);

	useFocusEffect(useCallback(() => { void loadProducts(); }, [loadProducts]));

	useEffect(() => {
		navigation.setOptions({ headerShown: false });
	}, [navigation]);

	useEffect(() => {
		if (!isAdmin) router.replace("/(tabs)");
	}, [isAdmin]);

	if (!isAdmin) return null;

	const filteredProducts = products.filter((p) => {
		if (activeTab === "In Stock") return p.amountInStock > 4;
		if (activeTab === "Low Stock") return p.amountInStock > 0 && p.amountInStock < 5;
		if (activeTab === "Out of Stock") return p.amountInStock === 0;
		return true;
	});

	// Summary counts
	const inStock = products.filter((p) => p.amountInStock > 4).length;
	const lowStock = products.filter((p) => p.amountInStock > 0 && p.amountInStock < 5).length;
	const outOfStock = products.filter((p) => p.amountInStock === 0).length;

	const handleDelete = (product: Product) => {
		if (!session?.token) { Alert.alert("Unauthorized", "Please login again."); return; }
		Alert.alert(
			"Delete Product",
			`Remove "${product.name}" from the catalogue? This cannot be undone.`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						try {
							const res = await fetch(`${endpoints.products}${product.id}`, {
								method: "DELETE",
								headers: { Authorization: `Bearer ${session.token}` },
							});
							if (!res.ok) {
								const data = await res.json().catch(() => ({}));
								Alert.alert("Delete Failed", data.message || "Could not delete product.");
								return;
							}
							setProducts((prev) => prev.filter((p) => p.id !== product.id));
						} catch {
							Alert.alert("Error", "Could not connect to server.");
						}
					},
				},
			]
		);
	};

	return (
		<View style={{ flex: 1, backgroundColor: COLORS.background }}>

			{/* ── Header ── */}
			<View style={[styles.header, { paddingTop: insets.top > 0 ? insets.top + 12 : 52 }]}>
				<View style={styles.headerRow}>
					<Pressable onPress={() => router.back()} style={styles.headerBtn} hitSlop={6}>
						<Icon name="arrow-back" size={20} color={COLORS.textDark} />
					</Pressable>
					<View style={styles.headerCenter}>
						<T style={styles.headerTitle}>Products</T>
						<T style={styles.headerSub}>{products.length} total items</T>
					</View>
					<Pressable onPress={loadProducts} style={styles.headerBtn} hitSlop={6}>
						<Icon name="refresh-outline" size={20} color={COLORS.textDark} />
					</Pressable>
				</View>

				{/* Quick actions */}
				<View style={styles.quickRow}>
					<QuickAction
						icon="receipt-outline"
						label="Orders"
						color={COLORS.blue}
						bg={COLORS.blueMuted}
						border={COLORS.blueBorder}
						onPress={() => router.push("/admin/orders")}
					/>
					<QuickAction
						icon="layers-outline"
						label="Categories"
						color={COLORS.primary}
						bg={COLORS.primaryMuted}
						border={COLORS.primaryBorder}
						onPress={() => router.push("/admin/categories")}
					/>
				</View>
			</View>

			{/* ── Tabs ── */}
			<View style={styles.tabBar}>
				<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabList}>
					{TABS.map((tab) => {
						const active = activeTab === tab;
						const count =
							tab === "All" ? products.length :
							tab === "In Stock" ? inStock :
							tab === "Low Stock" ? lowStock :
							outOfStock;
						return (
							<Pressable key={tab} onPress={() => setActiveTab(tab)}>
								{active ? (
									<LinearGradient
										colors={[COLORS.primary, COLORS.primaryDeep]}
										start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
										style={styles.tabActive}
									>
										<T style={styles.tabTextActive}>{tab}</T>
										<View style={styles.tabBadgeActive}>
											<T style={styles.tabBadgeTextActive}>{count}</T>
										</View>
									</LinearGradient>
								) : (
									<View style={styles.tab}>
										<T style={styles.tabText}>{tab}</T>
										{count > 0 && (
											<View style={styles.tabBadge}>
												<T style={styles.tabBadgeText}>{count}</T>
											</View>
										)}
									</View>
								)}
							</Pressable>
						);
					})}
				</ScrollView>
			</View>

			{/* ── Product list ── */}
			<FlatList
				data={filteredProducts}
				keyExtractor={(item) => item.id.toString()}
				onRefresh={loadProducts}
				refreshing={isLoading}
				contentContainerStyle={styles.listContent}
				ListEmptyComponent={
					<View style={styles.emptyState}>
						<View style={styles.emptyIconWrap}>
							<MCIcon name="package-variant-closed" size={36} color={COLORS.primary} />
						</View>
						<T style={styles.emptyTitle}>No products found</T>
						<T style={styles.emptySub}>
							{activeTab === "All"
								? "Add your first product using the + button."
								: `No products match the "${activeTab}" filter.`}
						</T>
					</View>
				}
				renderItem={({ item }) => (
					<ProductCard
						item={item}
						onPress={() => router.push(`/product/${item.id}`)}
						onEdit={() => router.push({ pathname: "/admin/edit-product", params: { id: item.id } })}
						onDelete={() => handleDelete(item)}
					/>
				)}
			/>

			{/* ── FAB ── */}
			<Animated.View style={[styles.fab, { transform: [{ scale: fabScale }] }]}>
				<Pressable
					onPress={() => router.push("/admin/edit-product")}
					onPressIn={fabPressIn}
					onPressOut={fabPressOut}
					style={{ width: "100%", height: "100%" }}
				>
					<LinearGradient
						colors={[COLORS.primary, COLORS.primaryDeep]}
						style={styles.fabGradient}
					>
						<Icon name="add" size={28} color={COLORS.white} />
					</LinearGradient>
				</Pressable>
			</Animated.View>
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
		marginBottom: 12,
	},
	headerCenter: { flex: 1, alignItems: "center", paddingHorizontal: 8 },
	headerTitle: { fontSize: 17, fontWeight: "900", color: COLORS.textDark, letterSpacing: 0.3, textAlign: "center" },
	headerSub: { fontSize: 12, color: COLORS.textLight, fontWeight: "500", textAlign: "center", marginTop: 1 },
	headerBtn: {
		width: 40, height: 40, borderRadius: 12,
		borderWidth: 1, borderColor: COLORS.border,
		backgroundColor: COLORS.surface,
		alignItems: "center", justifyContent: "center",
	},
	quickRow: { flexDirection: "row", gap: 10 },
	quickAction: {
		flexDirection: "row",
		alignItems: "center",
		gap: 7,
		paddingHorizontal: 14,
		paddingVertical: 9,
		borderRadius: 10,
		borderWidth: 1,
	},
	quickActionText: { fontSize: 13, fontWeight: "700" },

	/* Tabs */
	tabBar: {
		backgroundColor: COLORS.surface,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.borderLight,
	},
	tabList: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
	tab: {
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
	tabActive: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 12,
		paddingVertical: 7,
		borderRadius: 20,
		gap: 5,
	},
	tabText: { fontSize: 13, fontWeight: "500", color: COLORS.textMid },
	tabTextActive: { fontSize: 13, fontWeight: "700", color: COLORS.white },
	tabBadge: {
		minWidth: 18, height: 18, borderRadius: 9,
		backgroundColor: COLORS.borderLight,
		alignItems: "center", justifyContent: "center", paddingHorizontal: 4,
	},
	tabBadgeText: { fontSize: 10, fontWeight: "700", color: COLORS.textLight },
	tabBadgeActive: {
		minWidth: 18, height: 18, borderRadius: 9,
		backgroundColor: "rgba(255,255,255,0.25)",
		alignItems: "center", justifyContent: "center", paddingHorizontal: 4,
	},
	tabBadgeTextActive: { fontSize: 10, fontWeight: "700", color: COLORS.white },

	/* List */
	listContent: { padding: 16, paddingBottom: 110 },

	/* Product card */
	productCard: {
		flexDirection: "row",
		alignItems: "center",
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
	productAccent: { width: 4, alignSelf: "stretch" },
	productThumb: {
		width: 68, height: 68,
		backgroundColor: COLORS.borderLight,
		marginVertical: 12,
		marginLeft: 12,
		borderRadius: 10,
		overflow: "hidden",
	},
	productInfo: { flex: 1, paddingHorizontal: 12, paddingVertical: 12, gap: 5 },
	productName: { fontSize: 14, fontWeight: "700", color: COLORS.textDark },
	productMetaRow: { flexDirection: "row", alignItems: "center" },
	productPriceRow: { flexDirection: "row", alignItems: "center", gap: 8 },
	productPrice: { fontSize: 16, fontWeight: "900", color: COLORS.primary, letterSpacing: -0.3 },
	productSku: { fontSize: 11, color: COLORS.textLight, fontWeight: "500" },
	productActions: { flexDirection: "column", gap: 8, paddingRight: 14, paddingVertical: 12 },
	actionBtn: {
		width: 34, height: 34, borderRadius: 10,
		backgroundColor: COLORS.primaryMuted,
		borderWidth: 1, borderColor: COLORS.primaryBorder,
		alignItems: "center", justifyContent: "center",
	},
	actionBtnDanger: {
		backgroundColor: COLORS.dangerMuted,
		borderColor: COLORS.dangerBorder,
	},

	/* Stock badge */
	badge: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 8,
		paddingVertical: 3,
		borderRadius: 20,
		borderWidth: 1,
		gap: 4,
	},
	badgeText: { fontSize: 11, fontWeight: "700" },

	/* Empty state */
	emptyState: { alignItems: "center", paddingTop: 60, gap: 10 },
	emptyIconWrap: {
		width: 80, height: 80, borderRadius: 40,
		backgroundColor: COLORS.primaryMuted, alignItems: "center", justifyContent: "center",
		shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 4,
	},
	emptyTitle: { fontSize: 17, fontWeight: "700", color: COLORS.textDark },
	emptySub: { fontSize: 13, color: COLORS.textLight, textAlign: "center", paddingHorizontal: 32, lineHeight: 20 },

	/* FAB */
	fab: {
		position: "absolute",
		bottom: 24,
		right: 20,
		width: 60, height: 60,
		borderRadius: 30,
		overflow: "hidden",
		shadowColor: COLORS.primary,
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.4,
		shadowRadius: 14,
		elevation: 8,
	},
	fabGradient: {
		width: "100%", height: "100%",
		alignItems: "center", justifyContent: "center",
	},
});