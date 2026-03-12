import React, { useEffect, useState } from "react";
import { router, useNavigation } from "expo-router";
import {
	Pressable,
	ScrollView,
	StyleSheet,
	View,
	TouchableWithoutFeedback,
	Animated,
	Dimensions,
} from "react-native";
import { Text, XStack, YStack } from "tamagui";
import Icon from "@expo/vector-icons/Ionicons";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/context/AuthProvider";
import { ProfileUnauthedBanner } from "@/components/Screens/profile/ProfileUnauthedBanner";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRef } from "react";

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
	danger: "#EF4444",
	dangerMuted: "#FEF2F2",
	dangerBorder: "#FECACA",
};

const SCREEN_HEIGHT = Dimensions.get("window").height;

const MENU_SECTIONS = [
	{
		title: "Account",
		items: [
			{ icon: "person-outline", label: "Personal Information", badge: null },
			{ icon: "location-outline", label: "Saved Addresses", badge: null },
			{ icon: "card-outline", label: "Payment Methods", badge: null },
		],
	},
	{
		title: "Orders",
		items: [
			{ icon: "cube-outline", label: "My Orders", badge: "3" },
			{ icon: "heart-outline", label: "Wishlist", badge: null },
			{ icon: "refresh-outline", label: "Returns & Refunds", badge: null },
		],
	},
	{
		title: "Preferences",
		items: [
			{ icon: "notifications-outline", label: "Notifications", badge: null },
			{ icon: "settings-outline", label: "Settings", badge: null },
			{ icon: "help-circle-outline", label: "Help & Support", badge: null },
		],
	},
];

function ProfileMenuItem({
	icon,
	label,
	badge,
	onPress,
	danger,
}: {
	icon: string;
	label: string;
	badge?: string | null;
	onPress?: () => void;
	danger?: boolean;
}) {
	return (
		<Pressable
			onPress={onPress}
			style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.65 }]}
		>
			<View style={[styles.menuItemIcon, danger && styles.menuItemIconDanger]}>
				<Icon
					name={icon as any}
					size={19}
					color={danger ? COLORS.danger : COLORS.primary}
				/>
			</View>
			<Text fos={15} fow="500" color={danger ? COLORS.danger : COLORS.textDark} f={1}>
				{label}
			</Text>
			<XStack ai="center" gap={8}>
				{badge && (
					<View style={styles.badge}>
						<Text fos={11} fow="700" color={COLORS.primary}>{badge}</Text>
					</View>
				)}
				{!danger && (
					<Icon name="chevron-forward" size={16} color={COLORS.textLight} />
				)}
			</XStack>
		</Pressable>
	);
}

/* ── Bottom sheet ── */
function LogoutSheet({
	visible,
	email,
	onClose,
	onConfirm,
}: {
	visible: boolean;
	email: string;
	onClose: () => void;
	onConfirm: () => void;
}) {
	const slideAnim = useRef(new Animated.Value(300)).current;
	const overlayAnim = useRef(new Animated.Value(0)).current;
	const insets = useSafeAreaInsets();

	useEffect(() => {
		if (visible) {
			Animated.parallel([
				Animated.spring(slideAnim, {
					toValue: 0,
					useNativeDriver: true,
					damping: 20,
					stiffness: 160,
				}),
				Animated.timing(overlayAnim, {
					toValue: 1,
					duration: 220,
					useNativeDriver: true,
				}),
			]).start();
		} else {
			Animated.parallel([
				Animated.spring(slideAnim, {
					toValue: 300,
					useNativeDriver: true,
					damping: 20,
					stiffness: 200,
				}),
				Animated.timing(overlayAnim, {
					toValue: 0,
					duration: 180,
					useNativeDriver: true,
				}),
			]).start();
		}
	}, [visible]);

	if (!visible) return null;

	return (
		<View style={StyleSheet.absoluteFill} pointerEvents="box-none">
			<TouchableWithoutFeedback onPress={onClose}>
				<Animated.View style={[styles.sheetScrim, { opacity: overlayAnim }]} />
			</TouchableWithoutFeedback>

			<Animated.View
				style={[
					styles.sheet,
					{
						paddingBottom: insets.bottom + 16,
						transform: [{ translateY: slideAnim }],
					},
				]}
			>
				<View style={styles.sheetHandle} />

				<YStack ai="center" gap={4} mb={24} mt={8}>
					<View style={styles.sheetAvatar}>
						<Text fos={24} fow="900" color={COLORS.primary}>
							{email.charAt(0).toUpperCase()}
						</Text>
					</View>
					<Text fos={15} fow="600" color={COLORS.textDark} mt={12}>{email}</Text>
					<Text fos={13} color={COLORS.textLight}>Kishore Member</Text>
				</YStack>

				<Pressable onPress={onConfirm} style={styles.logoutConfirmBtn}>
					<Icon name="log-out-outline" size={18} color={COLORS.danger} style={{ marginRight: 8 }} />
					<Text fos={15} fow="700" color={COLORS.danger}>Log Out</Text>
				</Pressable>

				<Pressable
					onPress={onClose}
					style={({ pressed }) => [styles.sheetCancelBtn, pressed && { opacity: 0.7 }]}
				>
					<Text fos={15} fow="600" color={COLORS.textMid}>Cancel</Text>
				</Pressable>
			</Animated.View>
		</View>
	);
}

export default function Profile() {
	const { session, logout } = useAuth();
	const navigation = useNavigation();
	const insets = useSafeAreaInsets();
	const [sheetOpen, setSheetOpen] = useState(false);

	useEffect(() => {
		navigation.setOptions({ headerShown: false });
	}, [navigation.setOptions]);

	const handleLogout = () => {
		setSheetOpen(false);
		setTimeout(() => {
			void logout();
		}, 300);
	};

	const initials = session?.user?.username
		? session.user.username.charAt(0).toUpperCase()
		: session?.user?.email?.charAt(0).toUpperCase() ?? "K";

	return (
		<View style={{ flex: 1, backgroundColor: COLORS.background }}>

			{/* ── Header ── */}
			<View style={[styles.header, { paddingTop: insets.top > 0 ? insets.top + 12 : 52 }]}>
				<XStack ai="center" jc="space-between">
					<XStack ai="center" gap={7}>
						<MCIcon name="sofa" size={20} color={COLORS.primary} />
						<Text fos={16} fow="900" color={COLORS.textDark} letterSpacing={2}>
							KISHORE
						</Text>
					</XStack>

					<Text fos={17} fow="800" color={COLORS.textDark} letterSpacing={-0.2}>
						Profile
					</Text>

					<Pressable style={styles.headerIconBtn} hitSlop={6}>
						<Icon name="settings-outline" size={20} color={COLORS.textDark} />
					</Pressable>
				</XStack>
			</View>

			<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
				{session ? (
					<>
						{/* ── User hero card ── */}
						<LinearGradient
							colors={[COLORS.primary, COLORS.primaryDeep]}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 1 }}
							style={styles.heroCard}
						>
							<XStack ai="center" gap={16}>
								<View style={styles.heroAvatarRing}>
									<View style={styles.heroAvatar}>
										<Text fos={26} fow="900" color={COLORS.primary}>{initials}</Text>
									</View>
								</View>

								<YStack f={1} gap={3}>
									<Text fos={19} fow="900" color="white">
										{session.user?.username || "Member"}
									</Text>
									<Text fos={13} color="rgba(255,255,255,0.72)">
										{session.user?.email}
									</Text>
									<View style={styles.memberBadge}>
										<Icon name="ribbon-outline" size={11} color={COLORS.primary} />
										<Text fos={11} fow="700" color={COLORS.primary} ml={4}>
											Kishore Member
										</Text>
									</View>
								</YStack>

								<Pressable
									onPress={() => setSheetOpen(true)}
									style={styles.heroEditBtn}
									hitSlop={6}
								>
									<Icon name="chevron-down" size={16} color="white" />
								</Pressable>
							</XStack>

							{/* Quick stats row */}
							<XStack mt={20} gap={0}>
								{[
									{ label: "Orders", value: "12" },
									{ label: "Wishlist", value: "5" },
									{ label: "Reviews", value: "3" },
								].map((stat, i, arr) => (
									<YStack
										key={stat.label}
										f={1}
										ai="center"
										gap={2}
										style={i < arr.length - 1 ? styles.statDivider : undefined}
									>
										<Text fos={20} fow="900" color="white">{stat.value}</Text>
										<Text fos={12} color="rgba(255,255,255,0.65)">{stat.label}</Text>
									</YStack>
								))}
							</XStack>
						</LinearGradient>

						{/* ── Menu sections ── */}
						{MENU_SECTIONS.map((section) => (
							<YStack key={section.title} px={20} mt={24}>
								<Text
									fos={11}
									fow="700"
									color={COLORS.textLight}
									letterSpacing={1.2}
									tt="uppercase"
									mb={10}
								>
									{section.title}
								</Text>

								<View style={styles.menuCard}>
									{section.items.map((item, i) => (
										<React.Fragment key={item.label}>
											<ProfileMenuItem
												icon={item.icon}
												label={item.label}
												badge={item.badge}
											/>
											{i < section.items.length - 1 && (
												<View style={styles.menuItemDivider} />
											)}
										</React.Fragment>
									))}
								</View>
							</YStack>
						))}

						{/* Logout row */}
						<YStack px={20} mt={24}>
							<View style={styles.menuCard}>
								<ProfileMenuItem
									icon="log-out-outline"
									label="Log Out"
									onPress={() => setSheetOpen(true)}
									danger
								/>
							</View>
						</YStack>
					</>
				) : (
					/* ── Unauthenticated ── */
					<YStack f={1} px={24} pt={40} ai="center" gap={32}>
						<YStack ai="center" gap={16}>
							<View style={styles.unauthedIcon}>
								<MCIcon name="account-outline" size={44} color={COLORS.primary} />
							</View>
							<YStack ai="center" gap={6}>
								<Text fos={22} fow="900" color={COLORS.textDark} letterSpacing={-0.3}>
									Welcome to Kishore
								</Text>
								<Text fos={14} color={COLORS.textLight} ta="center" lineHeight={21}>
									Sign in to access your orders,{"\n"}wishlist, and account details.
								</Text>
							</YStack>
						</YStack>

						<YStack w="100%" gap={12}>
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
								<Text fos={15} fow="700" color={COLORS.primary}>Create Account</Text>
							</Pressable>
						</YStack>

						<ProfileUnauthedBanner />
					</YStack>
				)}
			</ScrollView>

			{/* ── Logout sheet ── */}
			<LogoutSheet
				visible={sheetOpen}
				email={session?.user?.email ?? ""}
				onClose={() => setSheetOpen(false)}
				onConfirm={handleLogout}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
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

	/* Hero card */
	heroCard: {
		marginHorizontal: 20,
		marginTop: 20,
		borderRadius: 20,
		padding: 20,
		shadowColor: COLORS.primary,
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.25,
		shadowRadius: 20,
		elevation: 8,
	},
	heroAvatarRing: {
		width: 60,
		height: 60,
		borderRadius: 30,
		borderWidth: 2,
		borderColor: "rgba(255,255,255,0.5)",
		alignItems: "center",
		justifyContent: "center",
	},
	heroAvatar: {
		width: 52,
		height: 52,
		borderRadius: 26,
		backgroundColor: "white",
		alignItems: "center",
		justifyContent: "center",
	},
	memberBadge: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "rgba(255,255,255,0.9)",
		borderRadius: 6,
		paddingHorizontal: 8,
		paddingVertical: 3,
		alignSelf: "flex-start",
		marginTop: 4,
	},
	heroEditBtn: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: "rgba(255,255,255,0.2)",
		alignItems: "center",
		justifyContent: "center",
	},
	statDivider: {
		borderRightWidth: 1,
		borderRightColor: "rgba(255,255,255,0.2)",
	},

	/* Menu */
	menuCard: {
		backgroundColor: COLORS.surface,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: COLORS.borderLight,
		overflow: "hidden",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.04,
		shadowRadius: 10,
		elevation: 2,
	},
	menuItem: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 14,
		gap: 12,
	},
	menuItemIcon: {
		width: 36,
		height: 36,
		borderRadius: 10,
		backgroundColor: COLORS.primaryMuted,
		alignItems: "center",
		justifyContent: "center",
	},
	menuItemIconDanger: {
		backgroundColor: COLORS.dangerMuted,
	},
	menuItemDivider: {
		height: 1,
		backgroundColor: COLORS.borderLight,
		marginLeft: 64,
	},
	badge: {
		paddingHorizontal: 8,
		paddingVertical: 2,
		borderRadius: 10,
		backgroundColor: COLORS.primaryMuted,
		borderWidth: 1,
		borderColor: "#FDE68A",
	},

	/* Unauthenticated */
	unauthedIcon: {
		width: 96,
		height: 96,
		borderRadius: 48,
		backgroundColor: COLORS.primaryMuted,
		alignItems: "center",
		justifyContent: "center",
		shadowColor: COLORS.primary,
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.15,
		shadowRadius: 20,
		elevation: 4,
	},

	/* Buttons */
	gradientBtn: {
		height: 52,
		borderRadius: 14,
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
		marginBottom: 8,
	},
	sheetAvatar: {
		width: 64,
		height: 64,
		borderRadius: 32,
		backgroundColor: COLORS.primaryMuted,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 2,
		borderColor: "#FDE68A",
	},
	logoutConfirmBtn: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		height: 52,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: COLORS.dangerBorder,
		backgroundColor: COLORS.dangerMuted,
		marginBottom: 10,
	},
	sheetCancelBtn: {
		height: 48,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 14,
		backgroundColor: COLORS.borderLight,
	},
});