import { useCart } from "@/context/CartProvider";
import { useAuth } from "@/context/AuthProvider";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs } from "expo-router";
import { Text, XStack, YStack } from "tamagui";

const COLORS = {
	primary: "#d97706",
	inactive: "#64748b",
	background: "#ffffff",
	border: "#e2e8f0"
};

function TabIcon({
	icon,
	focused,
	badgeCount = 0,
}: {
	icon: React.ComponentProps<typeof MCIcon>["name"];
	focused: boolean;
	badgeCount?: number;
}) {
	return (
		<YStack f={1} jc="center" ai="center">
			<XStack
				pos="absolute"
				top={0}
				w={30}
				h={3}
				bbrr={4}
				bblr={4}
				bg={focused ? COLORS.primary : "$colorTransparent"}
			/>
			<YStack>
				<MCIcon
					name={icon}
					size={26}
					color={focused ? COLORS.primary : COLORS.inactive}
				/>
				{badgeCount > 0 && (
					<XStack
						pos="absolute"
						top={-4}
						right={-8}
						bg={COLORS.primary}
						minWidth={18}
						h={18}
						br={9}
						jc="center"
						ai="center"
						px={4}
					>
						<Text fow="bold" fos={10} color="white">
							{badgeCount}
						</Text>
					</XStack>
				)}
			</YStack>
		</YStack>
	);
}

export default function TabLayout() {
	const { items } = useCart();
	const { session } = useAuth();
	const isAdmin = session?.user?.role === "admin";
	const sharedScreenOptions = {
		tabBarStyle: {
			borderTopWidth: 1,
			borderTopColor: COLORS.border,
			backgroundColor: COLORS.background,
			height: 60,
			paddingBottom: 5,
			paddingTop: 5,
		},
		headerShown: false,
		tabBarLabel: () => null,
	};

	return (
		<Tabs>
			<Tabs.Screen
				name="index"
				options={{
					...sharedScreenOptions,
					tabBarIcon: ({ focused }) => (
						<TabIcon icon="home-outline" focused={focused} />
					),
				}}
			/>
			<Tabs.Screen
				name="cart"
				options={{
					...sharedScreenOptions,
					href: isAdmin ? null : undefined,
					tabBarIcon: ({ focused }) => (
						<TabIcon
							icon="shopping-outline"
							focused={focused}
							badgeCount={items.length}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="admin"
				options={{
					...sharedScreenOptions,
					href: isAdmin ? undefined : null,
					tabBarIcon: ({ focused }) => (
						<TabIcon icon="shield-account-outline" focused={focused} />
					),
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					...sharedScreenOptions,
					tabBarIcon: ({ focused }) => (
						<TabIcon icon="account-outline" focused={focused} />
					),
				}}
			/>
		</Tabs>
	);
}
