import React, { useCallback, useState, useRef, useEffect } from "react";
import { router, useNavigation, useFocusEffect } from "expo-router";
import {
	Pressable,
	ScrollView,
	FlatList,
	Animated,
	Dimensions,
	StyleSheet,
	View,
	TextInput,
	TouchableWithoutFeedback,
} from "react-native";
import { Image, Text, XStack, YStack } from "tamagui";
import Icon from "@expo/vector-icons/Ionicons";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/context/AuthProvider";
import { Product } from "@/types/product";
import { ProductDealCard } from "@/components/Screens/home/ProductDealCard";
import { HomeCarousel } from "@/components/Screens/home/HomeCarousel";
import { getAllProducts } from "@/utils/products";
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
};

const CATEGORIES = [
	{ label: "All", icon: "grid-outline" },
	{ label: "Sofas", icon: "home-outline" },
	{ label: "Chairs", icon: "accessibility-outline" },
	{ label: "Tables", icon: "square-outline" },
	{ label: "Beds", icon: "bed-outline" },
	{ label: "Decor", icon: "color-palette-outline" },
];

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const DRAWER_WIDTH = SCREEN_WIDTH * 0.78;

/* ─── Sidebar menu item ─── */
function MenuItem({
	icon,
	label,
	onPress,
	color,
	active,
}: {
	icon: string;
	label: string;
	onPress: () => void;
	color?: string;
	active?: boolean;
}) {
	return (
		<Pressable
			onPress={onPress}
			style={({ pressed }) => [
				styles.menuItem,
				active && styles.menuItemActive,
				pressed && { opacity: 0.7 },
			]}
		>
			<View style={[styles.menuIconWrap, active && styles.menuIconWrapActive]}>
				<Icon
					name={icon as any}
					size={20}
					color={active ? COLORS.primary : color || COLORS.textMid}
				/>
			</View>
			<Text
				fos={15}
				fow={active ? "700" : "500"}
				color={color || (active ? COLORS.primary : COLORS.textDark)}
			>
				{label}
			</Text>
		</Pressable>
	);
}

/* ─── Section header ─── */
function SectionHeader({ title, onViewAll }: { title: string; onViewAll?: () => void }) {
	return (
		<XStack jc="space-between" ai="center" mb={16}>
			<YStack gap={2}>
				<Text fos={20} fow="800" color={COLORS.textDark} letterSpacing={-0.3}>
					{title}
				</Text>
				<View style={styles.sectionUnderline} />
			</YStack>
			{onViewAll && (
				<Pressable onPress={onViewAll} style={styles.viewAllBtn}>
					<Text fos={13} fow="600" color={COLORS.primary}>
						View All
					</Text>
					<Icon
						name="arrow-forward"
						size={13}
						color={COLORS.primary}
						style={{ marginLeft: 3 }}
					/>
				</Pressable>
			)}
		</XStack>
	);
}

/* ─── Main screen ─── */
export default function Home() {
	const { session, logout } = useAuth();
	const navigation = useNavigation();
	const insets = useSafeAreaInsets();

	const [deals, setDeals] = useState<Product[]>([]);
	const [activeCategory, setActiveCategory] = useState("All");
	const [searchQuery, setSearchQuery] = useState("");
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [searchFocused, setSearchFocused] = useState(false);

	// Single translateX value — lives for the entire component lifetime,
	// never unmounted, never reset unexpectedly.
	const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
	const overlayOpacity = useRef(new Animated.Value(0)).current;

	const getDeals = useCallback(async () => {
		const data = await getAllProducts();
		setDeals(data);
	}, []);

	useFocusEffect(
		useCallback(() => {
			getDeals();
		}, [getDeals])
	);

	useEffect(() => {
		navigation.setOptions({ headerShown: false });
	}, [navigation.setOptions]);

	const openDrawer = () => {
		setDrawerOpen(true);
		Animated.parallel([
			Animated.spring(translateX, {
				toValue: 0,
				useNativeDriver: true,
				damping: 20,
				stiffness: 160,
				mass: 1,
			}),
			Animated.timing(overlayOpacity, {
				toValue: 1,
				duration: 250,
				useNativeDriver: true,
			}),
		]).start();
	};

	const closeDrawer = (cb?: () => void) => {
		Animated.parallel([
			Animated.spring(translateX, {
				toValue: -DRAWER_WIDTH,
				useNativeDriver: true,
				damping: 20,
				stiffness: 200,
				mass: 1,
			}),
			Animated.timing(overlayOpacity, {
				toValue: 0,
				duration: 220,
				useNativeDriver: true,
			}),
		]).start(() => {
			setDrawerOpen(false);
			cb?.();
		});
	};

	const handleLogout = () => closeDrawer(() => setTimeout(() => void logout(), 100));

	const onProductPress = (product: Product) => {
		router.push({ pathname: "/product/[id]", params: { id: product.id } });
	};

	const filteredDeals =
		activeCategory === "All"
			? deals
			: deals.filter((d) => d.category === activeCategory);

	return (
		<View style={{ flex: 1, backgroundColor: COLORS.background }}>

			{/* ── Main scrollable content ── */}
			<View style={{ flex: 1 }}>
				{/* Header */}
				<View style={[styles.header, { paddingTop: insets.top > 0 ? insets.top + 12 : 52 }]}>
					<XStack jc="space-between" ai="center" mb={20}>
						<Pressable onPress={openDrawer} style={styles.headerIconBtn} hitSlop={6}>
							<Icon name="menu" size={22} color={COLORS.textDark} />
						</Pressable>

						<XStack ai="center" gap={7}>
							<Image source={require("@/assets/icon.png")} w={26} h={26} borderRadius={6} />
							<Text fos={18} fow="900" color={COLORS.textDark} letterSpacing={2.5}>
								KISHORE
							</Text>
						</XStack>

						<Pressable style={styles.headerIconBtn} hitSlop={6}>
							<View style={styles.notifDot} />
							<Icon name="notifications-outline" size={22} color={COLORS.textDark} />
						</Pressable>
					</XStack>

					<YStack mb={18}>
						<Text fos={13} fow="600" color={COLORS.textLight} letterSpacing={1} tt="uppercase">
							Good day, {session?.user?.username || "Guest"}
						</Text>
						<Text
							fos={26}
							fow="900"
							color={COLORS.textDark}
							lineHeight={32}
							letterSpacing={-0.5}
							mt={4}
						>
							Find the perfect{"\n"}piece for your home.
						</Text>
					</YStack>

					<XStack gap={10} ai="center" mb={4}>
						<View style={[styles.searchBar, searchFocused && styles.searchBarFocused]}>
							<Icon
								name="search-outline"
								size={18}
								color={searchFocused ? COLORS.primary : COLORS.textLight}
								style={{ marginRight: 8 }}
							/>
							<TextInput
								style={styles.searchInput}
								placeholder="Search furniture..."
								placeholderTextColor={COLORS.textLight}
								value={searchQuery}
								onChangeText={setSearchQuery}
								onFocus={() => setSearchFocused(true)}
								onBlur={() => setSearchFocused(false)}
							/>
							{searchQuery.length > 0 && (
								<Pressable onPress={() => setSearchQuery("")} hitSlop={6}>
									<Icon name="close-circle" size={17} color={COLORS.textLight} />
								</Pressable>
							)}
						</View>

						<Pressable style={styles.filterBtn}>
							<LinearGradient
								colors={[COLORS.primary, COLORS.primaryDeep]}
								style={styles.filterGradient}
							>
								<Icon name="options-outline" size={20} color="white" />
							</LinearGradient>
						</Pressable>
					</XStack>
				</View>

				{/* Body */}
				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ paddingBottom: 40 }}
				>
					{/* Categories */}
					<YStack pt={20} pb={4}>
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={styles.categoryList}
						>
							{CATEGORIES.map((cat) => {
								const active = activeCategory === cat.label;
								return (
									<Pressable
										key={cat.label}
										onPress={() => setActiveCategory(cat.label)}
									>
										{active ? (
											<LinearGradient
												colors={[COLORS.primary, COLORS.primaryDeep]}
												style={styles.categoryChipActive}
											>
												<Icon name={cat.icon as any} size={14} color="white" />
												<Text fos={13} fow="700" color="white" ml={5}>
													{cat.label}
												</Text>
											</LinearGradient>
										) : (
											<View style={styles.categoryChip}>
												<Icon
													name={cat.icon as any}
													size={14}
													color={COLORS.textMid}
												/>
												<Text fos={13} fow="500" color={COLORS.textMid} ml={5}>
													{cat.label}
												</Text>
											</View>
										)}
									</Pressable>
								);
							})}
						</ScrollView>
					</YStack>

					{/* Carousel */}
					<YStack pt={20} pb={8}>
						<HomeCarousel />
					</YStack>

					{/* Featured Collections */}
					<YStack px={20} pt={24}>
						<SectionHeader
							title="Featured Collections"
							onViewAll={() => router.push("/(products)")}
						/>
						<FlatList
							horizontal
							showsHorizontalScrollIndicator={false}
							data={filteredDeals}
							keyExtractor={(item) => item.id.toString()}
							contentContainerStyle={{ gap: 14, paddingRight: 4 }}
							renderItem={({ item }) => (
								<ProductDealCard product={item} onPress={() => onProductPress(item)} />
							)}
							ListEmptyComponent={
								<YStack w={SCREEN_WIDTH - 40} py={40} ai="center" gap={8}>
									<Icon name="cube-outline" size={36} color={COLORS.border} />
									<Text fos={14} color={COLORS.textLight}>
										No products in this category yet.
									</Text>
								</YStack>
							}
						/>
					</YStack>

					{/* New Arrivals */}
					<YStack px={20} pt={30}>
						<SectionHeader title="New Arrivals" onViewAll={() => {}} />
						<FlatList
							horizontal
							showsHorizontalScrollIndicator={false}
							data={deals.slice(0, 4)}
							keyExtractor={(item) => `new-${item.id}`}
							contentContainerStyle={{ gap: 14, paddingRight: 4 }}
							renderItem={({ item }) => (
								<ProductDealCard product={item} onPress={() => onProductPress(item)} />
							)}
						/>
					</YStack>
				</ScrollView>
			</View>

			{/* ── Drawer overlay — rendered ABOVE content, always in the tree ── */}
			{/* Scrim: only intercepts touches when drawer is open */}
			{drawerOpen && (
				<TouchableWithoutFeedback onPress={() => closeDrawer()}>
					<Animated.View
						style={[
							styles.scrim,
							{ opacity: overlayOpacity },
						]}
					/>
				</TouchableWithoutFeedback>
			)}

			{/* Drawer panel — always mounted so translateX is always valid */}
			<Animated.View
				style={[
					styles.drawer,
					{
						paddingTop: insets.top + 20,
						paddingBottom: insets.bottom + 20,
						transform: [{ translateX }],
					},
				]}
				pointerEvents={drawerOpen ? "auto" : "none"}
			>
				{/* Close button */}
				<Pressable onPress={() => closeDrawer()} style={styles.drawerCloseBtn} hitSlop={8}>
					<Icon name="close" size={20} color={COLORS.textMid} />
				</Pressable>

				{/* User card */}
				<LinearGradient
					colors={[COLORS.primary, COLORS.primaryDeep]}
					style={styles.userCard}
				>
					<View style={styles.avatarRing}>
						<View style={styles.avatar}>
							<Text color={COLORS.primary} fos={22} fow="900">
								{session?.user?.username?.charAt(0).toUpperCase() || "K"}
							</Text>
						</View>
					</View>
					<Text fos={17} fow="800" color="white" mt={10}>
						{session?.user?.username || "Guest"}
					</Text>
					<Text fos={12} color="rgba(255,255,255,0.72)" mt={2}>
						{session?.user?.email || ""}
					</Text>
				</LinearGradient>

				{/* Nav items */}
				<YStack f={1} py={10}>
					<MenuItem icon="home" label="Home" onPress={() => closeDrawer()} active />
					<MenuItem
						icon="person-outline"
						label="My Profile"
						onPress={() => closeDrawer(() => router.push("/profile"))}
					/>
					<MenuItem
						icon="cube-outline"
						label="My Orders"
						onPress={() => closeDrawer()}
					/>
					<MenuItem
						icon="heart-outline"
						label="Favourites"
						onPress={() => closeDrawer()}
					/>
					<View style={styles.menuDivider} />
					<MenuItem
						icon="settings-outline"
						label="Settings"
						onPress={() => closeDrawer()}
					/>
					<MenuItem
						icon="help-circle-outline"
						label="Support"
						onPress={() => closeDrawer()}
					/>
				</YStack>

				{/* Logout */}
				<Pressable
					onPress={handleLogout}
					style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.7 }]}
				>
					<Icon name="log-out-outline" size={20} color="#EF4444" />
					<Text fos={15} fow="700" color="#EF4444" ml={10}>
						Log Out
					</Text>
				</Pressable>
			</Animated.View>

		</View>
	);
}

const styles = StyleSheet.create({
	/* ── Header ── */
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
	notifDot: {
		position: "absolute",
		top: 7,
		right: 7,
		width: 7,
		height: 7,
		borderRadius: 4,
		backgroundColor: "#EF4444",
		zIndex: 1,
	},

	/* ── Search ── */
	searchBar: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		height: 48,
		backgroundColor: COLORS.background,
		borderRadius: 13,
		borderWidth: 1.5,
		borderColor: COLORS.border,
		paddingHorizontal: 14,
	},
	searchBarFocused: {
		borderColor: COLORS.primary,
		backgroundColor: "#FFFBF5",
	},
	searchInput: {
		flex: 1,
		fontSize: 14,
		color: COLORS.textDark,
		paddingVertical: 0,
	},
	filterBtn: {
		borderRadius: 13,
		overflow: "hidden",
	},
	filterGradient: {
		width: 48,
		height: 48,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 13,
	},

	/* ── Categories ── */
	categoryList: {
		paddingHorizontal: 20,
		gap: 8,
	},
	categoryChip: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 14,
		paddingVertical: 9,
		borderRadius: 22,
		borderWidth: 1.5,
		borderColor: COLORS.border,
		backgroundColor: COLORS.surface,
	},
	categoryChipActive: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 14,
		paddingVertical: 9,
		borderRadius: 22,
	},

	/* ── Section header ── */
	sectionUnderline: {
		width: 28,
		height: 3,
		borderRadius: 2,
		backgroundColor: COLORS.primary,
		marginTop: 3,
	},
	viewAllBtn: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 8,
		backgroundColor: COLORS.primaryMuted,
	},

	/* ── Drawer overlay ── */
	scrim: {
		position: "absolute",
		top: 0,
		left: 0,
		width: SCREEN_WIDTH,
		height: SCREEN_HEIGHT,
		backgroundColor: "rgba(0,0,0,0.45)",
		zIndex: 10,
	},
	drawer: {
		position: "absolute",
		top: 0,
		left: 0,
		bottom: 0,
		width: DRAWER_WIDTH,
		backgroundColor: COLORS.surface,
		zIndex: 20,
		shadowColor: "#000",
		shadowOffset: { width: 8, height: 0 },
		shadowOpacity: 0.15,
		shadowRadius: 24,
		elevation: 20,
	},
	drawerCloseBtn: {
		position: "absolute",
		top: 50,
		right: 16,
		width: 34,
		height: 34,
		borderRadius: 17,
		backgroundColor: COLORS.borderLight,
		alignItems: "center",
		justifyContent: "center",
		zIndex: 10,
	},
	userCard: {
		marginHorizontal: 16,
		borderRadius: 16,
		padding: 20,
		alignItems: "flex-start",
		marginBottom: 10,
	},
	avatarRing: {
		width: 52,
		height: 52,
		borderRadius: 26,
		borderWidth: 2,
		borderColor: "rgba(255,255,255,0.5)",
		alignItems: "center",
		justifyContent: "center",
	},
	avatar: {
		width: 44,
		height: 44,
		borderRadius: 22,
		backgroundColor: "white",
		alignItems: "center",
		justifyContent: "center",
	},
	menuItem: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 11,
		marginHorizontal: 8,
		borderRadius: 12,
		gap: 12,
	},
	menuItemActive: {
		backgroundColor: COLORS.primaryMuted,
	},
	menuIconWrap: {
		width: 36,
		height: 36,
		borderRadius: 10,
		backgroundColor: COLORS.borderLight,
		alignItems: "center",
		justifyContent: "center",
	},
	menuIconWrapActive: {
		backgroundColor: "#FDE68A",
	},
	menuDivider: {
		height: 1,
		backgroundColor: COLORS.borderLight,
		marginHorizontal: 16,
		marginVertical: 8,
	},
	logoutBtn: {
		flexDirection: "row",
		alignItems: "center",
		marginHorizontal: 16,
		paddingHorizontal: 16,
		paddingVertical: 14,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: "#FEE2E2",
		backgroundColor: "#FFF5F5",
		gap: 8,
	},
});