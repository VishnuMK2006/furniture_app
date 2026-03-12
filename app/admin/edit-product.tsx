import React, { useEffect, useState } from 'react';
import { View, ScrollView, Pressable, Platform, Alert, Image as RNImage } from 'react-native';
import { Text, XStack, YStack, Input, Button, Circle, TextArea, Image } from 'tamagui';
import { useNavigation, router } from 'expo-router';
import Icon from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/context/AuthProvider';
import { endpoints } from '@/utils/api';

const COLORS = {
	primary: "#d97706",
	textDark: "#0f172a",
	textLight: "#64748b",
	background: "#fdfbf7",
	surface: "#ffffff",
	border: "#e2e8f0",
};

export default function EditProduct() {
	const navigation = useNavigation();
	const insets = useSafeAreaInsets();
	const { session } = useAuth();
	const isAdmin = session?.user?.role === 'admin';
	
	const [name, setName] = useState('');
	const [category, setCategory] = useState('Sofas');
	const [price, setPrice] = useState('');
	const [stock, setStock] = useState('0');
	const [sku, setSku] = useState('');
	const [description, setDescription] = useState('');
	const [imageUri, setImageUri] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		if (!isAdmin) {
			router.replace('/(tabs)');
		}
	}, [isAdmin]);

	if (!isAdmin) {
		return null;
	}

	const pickImage = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ['images'],
			allowsEditing: true,
			aspect: [4, 3],
			quality: 0.8,
		});

		if (!result.canceled && result.assets && result.assets.length > 0) {
			setImageUri(result.assets[0].uri);
		}
	};

	const handleSave = async () => {
		if (!name || !price || !stock) {
			Alert.alert("Missing Fields", "Please fill in all required fields.");
			return;
		}

		setIsSaving(true);
		try {
			const formData = new FormData();
			formData.append('name', name);
			formData.append('category', category);
			formData.append('currentPrice', price);
			formData.append('amountInStock', stock);
			formData.append('sku', sku);
			formData.append('description', description);
			formData.append('isKishoreChoice', 'false');
			formData.append('deliveryPrice', '0');
			formData.append('deliveryInDays', '7');

			if (imageUri) {
				const filename = imageUri.split('/').pop() || 'image.jpg';
				const match = /\.(\w+)$/.exec(filename);
				const type = match ? `image/${match[1]}` : `image`;
				
				// Fix for React Native FormData file upload
				formData.append('image', {
					uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
					name: filename,
					type,
				} as any);
			}

			const response = await fetch(endpoints.products, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${session?.token}`,
				},
				body: formData,
			});

			const data = await response.json();

			if (response.ok) {
				Alert.alert("Success", "Product saved successfully!");
				router.back();
			} else {
				Alert.alert("Error", data.message || "Failed to save product.");
			}
		} catch (error) {
			console.error("Save product error:", error);
			Alert.alert("Error", "An unexpected error occurred.");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<YStack f={1} bg={COLORS.background}>
			{/* Header */}
			<XStack 
				px={20} 
				pt={insets.top > 0 ? insets.top + 10 : 40} 
				pb={15} 
				bg={COLORS.surface} 
				ai="center" 
				bw={1}
				bc={COLORS.border}
				gap={15}
			>
				<Pressable onPress={() => router.back()}>
					<Icon name="arrow-back" size={24} color={COLORS.textDark} />
				</Pressable>
				<Text fos={20} fow="800" color={COLORS.textDark}>
					Add New Product
				</Text>
			</XStack>

			<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
				{/* Top Info Banner */}
				<XStack bg="#fef3c7" p={15} br={12} ai="center" gap={15} mb={25} bw={1} bc="#fde68a">
					<Circle size={50} bg="white">
						<Icon name="cube-outline" size={24} color={COLORS.primary} />
					</Circle>
					<YStack f={1}>
						<Text fos={12} fow="600" color={COLORS.primary} ls={1} tt="uppercase">Creating New Item</Text>
						<Text fos={16} fow="800" color={COLORS.textDark}>Provide product details</Text>
						<Text fos={13} color={COLORS.textLight} mt={2}>Fill in the essential information for your furniture piece.</Text>
					</YStack>
				</XStack>

				{/* Form Fields */}
				<YStack gap={20}>
					<YStack gap={8}>
						<Text fos={14} fow="700" color={COLORS.textDark}>Product Name</Text>
						<Input 
							value={name}
							onChangeText={setName}
							placeholder="e.g. Mid-Century Modern Velvet Sofa"
							bg={COLORS.surface}
							bc={COLORS.border}
							color={COLORS.textDark}
							placeholderTextColor={COLORS.textLight}
							h={52}
							br={8}
						/>
					</YStack>

					<XStack gap={15}>
						<YStack f={1} gap={8}>
							<Text fos={14} fow="700" color={COLORS.textDark}>Category</Text>
							<XStack ai="center" bg={COLORS.surface} bc={COLORS.border} bw={1} h={52} br={8} px={15} jc="space-between">
								<Text color={COLORS.textDark}>{category}</Text>
								<Icon name="chevron-down" size={20} color={COLORS.textLight} />
							</XStack>
						</YStack>

						<YStack f={1} gap={8}>
							<Text fos={14} fow="700" color={COLORS.textDark}>Price (USD)</Text>
							<XStack ai="center" bg={COLORS.surface} bc={COLORS.border} bw={1} h={52} br={8} px={15}>
								<Text color={COLORS.textLight} mr={5}>₹</Text>
								<Input 
									f={1}
									bw={0}
									p={0}
									h="100%"
									bg="transparent"
									value={price}
									onChangeText={setPrice}
									placeholder="0.00"
									keyboardType="numeric"
									color={COLORS.textDark}
								/>
							</XStack>
						</YStack>
					</XStack>

					<XStack gap={15}>
						<YStack f={0.4} gap={8}>
							<Text fos={14} fow="700" color={COLORS.textDark}>Stock Qty</Text>
							<Input 
								value={stock}
								onChangeText={setStock}
								bg={COLORS.surface}
								bc={COLORS.border}
								color={COLORS.textDark}
								keyboardType="numeric"
								h={52}
								br={8}
							/>
						</YStack>

						<YStack f={0.6} gap={8}>
							<Text fos={14} fow="700" color={COLORS.textDark}>SKU (Optional)</Text>
							<Input 
								value={sku}
								onChangeText={setSku}
								placeholder="AUR-0000"
								bg={COLORS.surface}
								bc={COLORS.border}
								color={COLORS.textDark}
								placeholderTextColor={COLORS.textLight}
								h={52}
								br={8}
							/>
						</YStack>
					</XStack>

					<YStack gap={8}>
						<Text fos={14} fow="700" color={COLORS.textDark}>Description</Text>
						<TextArea 
							value={description}
							onChangeText={setDescription}
							placeholder="Describe the materials, craftsmanship, and style of the piece..."
							bg={COLORS.surface}
							bc={COLORS.border}
							color={COLORS.textDark}
							placeholderTextColor={COLORS.textLight}
							minHeight={120}
							br={8}
							p={15}
							textAlignVertical="top"
						/>
					</YStack>

					<YStack gap={8} mt={10}>
						<Text fos={16} fow="800" color={COLORS.textDark}>Product Image</Text>
						<Text fos={13} color={COLORS.textLight} mb={10}>Upload a clear image of the furniture piece.</Text>
						
						<Pressable onPress={pickImage}>
							{imageUri ? (
								<YStack h={200} bg={COLORS.surface} bw={1} bc={COLORS.border} br={12} overflow="hidden">
									<RNImage source={{ uri: imageUri }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
									<XStack pos="absolute" bottom={10} right={10} bg="rgba(0,0,0,0.6)" px={10} py={5} br={15}>
										<Text color="white" fos={12}>Change Image</Text>
									</XStack>
								</YStack>
							) : (
								<YStack h={200} bg="#fffbeb" bw={1} borderStyle="dashed" bc="#fcd34d" br={12} jc="center" ai="center" p={20}>
									<Circle size={60} bg="#fde68a" mb={10}>
										<Icon name="cloud-upload" size={28} color={COLORS.primary} />
									</Circle>
									<Text fos={16} fow="700" color={COLORS.textDark}>Tap to select image</Text>
									<Text fos={12} color={COLORS.textLight} mt={5}>JPG, PNG or WEBP (MAX. 5MB)</Text>
								</YStack>
							)}
						</Pressable>
					</YStack>
				</YStack>
			</ScrollView>

			{/* Fixed Bottom Action Bar */}
			<XStack 
				pos="absolute" 
				bottom={0} 
				left={0} 
				right={0} 
				bg={COLORS.surface}
				p={20} 
				pb={insets.bottom > 0 ? insets.bottom + 10 : 25}
				borderTopWidth={1} 
				bc={COLORS.border} 
				ai="center" 
				gap={15}
				zIndex={50}
			>
				<Button 
					f={1} 
					h={52} 
					br={8} 
					bg={COLORS.surface} 
					bw={1}
					bc={COLORS.border}
					color={COLORS.textDark} 
					onPress={() => router.back()}
					disabled={isSaving}
				>
					<Text fow="700" fos={16} color={COLORS.textDark}>Cancel</Text>
				</Button>
				
				<Button 
					f={2} 
					h={52} 
					br={8} 
					bg={COLORS.primary} 
					disabled={isSaving}
					opacity={isSaving ? 0.7 : 1}
					onPress={handleSave}
				>
					<XStack ai="center" gap={8}>
						{isSaving ? (
							<Text color="white" fow="700" fos={16}>Saving...</Text>
						) : (
							<>
								<Icon name="save-outline" size={20} color="white" />
								<Text color="white" fow="700" fos={16}>Save Product</Text>
							</>
						)}
					</XStack>
				</Button>
			</XStack>
		</YStack>
	);
}
