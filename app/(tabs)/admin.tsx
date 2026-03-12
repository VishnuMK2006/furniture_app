import React, { useState, useCallback, useEffect } from 'react';
import { View, FlatList, Pressable, Alert } from 'react-native';
import { Text, XStack, YStack, Image, Circle } from 'tamagui';
import { useNavigation, router, useFocusEffect } from 'expo-router';
import Icon from '@expo/vector-icons/Ionicons';
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import { Product } from '@/types/product';
import { getAllProducts } from '@/utils/products';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthProvider';
import { endpoints } from '@/utils/api';

const COLORS = {
	primary: "#d97706",
	textDark: "#0f172a",
	textLight: "#64748b",
	background: "#fdfbf7",
	surface: "#ffffff",
	border: "#e2e8f0",
	success: "#10b981",
	successBg: "#d1fae5",
	danger: "#ef4444",
	dangerBg: "#fee2e2",
	warning: "#f59e0b",
	warningBg: "#fef3c7"
};

export default function AdminProducts() {
	const navigation = useNavigation();
	const insets = useSafeAreaInsets();
	const { session } = useAuth();
	const [products, setProducts] = useState<Product[]>([]);
	const [activeTab, setActiveTab] = useState("All Products");
	const isAdmin = session?.user?.role === 'admin';

	const loadProducts = useCallback(async () => {
		const data = await getAllProducts();
		setProducts(data);
	}, []);

	useFocusEffect(
		useCallback(() => {
			loadProducts();
		}, [loadProducts])
	);

	useEffect(() => {
		navigation.setOptions({ headerShown: false });
	}, [navigation]);

	useEffect(() => {
		if (!isAdmin) {
			router.replace('/(tabs)');
		}
	}, [isAdmin]);

	if (!isAdmin) {
		return null;
	}

	const tabs = ["All Products", "In Stock", "Out of Stock"];

	const renderStockBadge = (amount: number) => {
		if (amount === 0) {
			return (
				<XStack bg={COLORS.dangerBg} px={8} py={4} br={4}>
					<Text color={COLORS.danger} fos={12} fow="600">Out of stock</Text>
				</XStack>
			);
		}
		if (amount < 5) {
			return (
				<XStack bg={COLORS.warningBg} px={8} py={4} br={4}>
					<Text color={COLORS.warning} fos={12} fow="600">Low Stock ({amount})</Text>
				</XStack>
			);
		}
		return (
			<XStack bg={COLORS.successBg} px={8} py={4} br={4}>
				<Text color={COLORS.success} fos={12} fow="600">{amount} in stock</Text>
			</XStack>
		);
	};

	const filteredProducts = products.filter(p => {
		if (activeTab === "In Stock") return p.amountInStock > 0;
		if (activeTab === "Out of Stock") return p.amountInStock === 0;
		return true;
	});

	const deleteProduct = async (product: Product) => {
		if (!session?.token) {
			Alert.alert('Unauthorized', 'Please login again.');
			return;
		}

		Alert.alert(
			'Delete Product',
			`Are you sure you want to delete "${product.name}"?`,
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Delete',
					style: 'destructive',
					onPress: async () => {
						try {
							const res = await fetch(`${endpoints.products}${product.id}`, {
								method: 'DELETE',
								headers: {
									Authorization: `Bearer ${session.token}`,
								},
							});

							if (!res.ok) {
								const data = await res.json().catch(() => ({}));
								Alert.alert('Delete Failed', data.message || 'Could not delete product.');
								return;
							}

							setProducts((prev) => prev.filter((p) => p.id !== product.id));
							Alert.alert('Deleted', 'Product removed successfully.');
						} catch (error) {
							Alert.alert('Error', 'Could not connect to server.');
						}
					},
				},
			]
		);
	};

	return (
		<YStack f={1} bg={COLORS.background}>
			{/* Admin Header */}
			<XStack 
				px={20} 
				pt={insets.top > 0 ? insets.top + 10 : 40} 
				pb={15} 
				bg={COLORS.surface} 
				ai="center" 
				jc="space-between"
				bw={1}
				bc={COLORS.border}
			>
				<XStack ai="center" gap={10}>
					<MCIcon name="package-variant-closed" size={24} color={COLORS.primary} />
					<Text fos={20} fow="800" color={COLORS.textDark}>
						Product Management
					</Text>
				</XStack>
				<XStack gap={15}>
					<Icon name="search" size={24} color={COLORS.textDark} />
					<Icon name="options-outline" size={24} color={COLORS.textDark} />
				</XStack>
			</XStack>

			{/* Custom Tabs */}
			<XStack bg={COLORS.surface} px={5} pt={10}>
				{tabs.map((tab) => (
					<Pressable key={tab} onPress={() => setActiveTab(tab)} style={{ flex: 1, alignItems: 'center' }}>
						<YStack ai="center" pb={10} bw={activeTab === tab ? 2 : 0} borderBottomColor={COLORS.primary}>
							<Text fow={activeTab === tab ? "700" : "500"} color={activeTab === tab ? COLORS.primary : COLORS.textLight}>
								{tab}
							</Text>
						</YStack>
					</Pressable>
				))}
			</XStack>

			<YStack h={1} bg={COLORS.border} w="100%" />

			{/* Products List */}
			<FlatList
				data={filteredProducts}
				keyExtractor={(item) => item.id.toString()}
				contentContainerStyle={{ padding: 15, paddingBottom: 100 }}
				renderItem={({ item }) => (
					<Pressable onPress={() => router.push(`/product/${item.id}`)}>
						<XStack 
							bg={COLORS.surface} 
							br={12} 
							p={12} 
							mb={12} 
							ai="center" 
							bw={1} 
							bc={COLORS.border}
							shac="rgba(0,0,0,0.02)"
							shof={{width:0,height:2}}
							shop={1}
							shar={4}
						>
							<YStack w={60} h={60} br={8} bg="#f8fafc" jc="center" ai="center" overflow="hidden">
								<Image src={item.imageUrl ?? "https://via.placeholder.com/60"} w="100%" h="100%" objectFit="contain" />
							</YStack>
							
							<YStack f={1} pl={15}>
								<Text fos={15} fow="700" color={COLORS.textDark} mb={4} numberOfLines={1}>{item.name}</Text>
								<XStack ai="center" gap={10}>
									{renderStockBadge(item.amountInStock)}
									<Text fos={14} fow="800" color={COLORS.primary}>₹{item.currentPrice.toFixed(2)}</Text>
								</XStack>
							</YStack>

							<XStack gap={15} pl={10}>
								<Pressable
									onPress={(event) => {
										event.stopPropagation();
										router.push({ pathname: "/admin/edit-product", params: { id: item.id } });
									}}
								>
									<Icon name="pencil" size={20} color={COLORS.textLight} />
								</Pressable>
								<Pressable
									onPress={(event) => {
										event.stopPropagation();
										deleteProduct(item);
									}}
								>
									<Icon name="trash-outline" size={20} color={COLORS.textLight} />
								</Pressable>
							</XStack>
						</XStack>
					</Pressable>
				)}
			/>

			{/* Floating Action Button */}
			<Pressable 
				style={{ position: 'absolute', bottom: 20, right: 20 }}
				onPress={() => router.push("/admin/edit-product")}
			>
				<Circle size={60} bg={COLORS.primary} shac="rgba(217,119,6,0.4)" shof={{width:0,height:4}} shop={1} shar={8}>
					<Icon name="add" size={30} color="white" />
				</Circle>
			</Pressable>
		</YStack>
	);
}
