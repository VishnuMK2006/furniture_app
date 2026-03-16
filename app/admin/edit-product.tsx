import React, { useEffect, useState } from "react";
import {
	Alert,
	Image as RNImage,
	Pressable,
	Platform,
	ScrollView,
	StyleSheet,
	Text as RNText,
	TextInput,
	View,
	Animated,
} from "react-native";
import { useNavigation, router } from "expo-router";
import Icon from "@expo/vector-icons/Ionicons";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { useAuth } from "@/context/AuthProvider";
import { endpoints } from "@/utils/api";
import { getAllCategories } from "@/utils/categories";

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
	danger: "#EF4444",
};

/* ── Field wrapper ── */
function Field({
	label,
	required,
	hint,
	children,
}: {
	label: string;
	required?: boolean;
	hint?: string;
	children: React.ReactNode;
}) {
	return (
		<View style={styles.field}>
			<View style={styles.fieldLabelRow}>
				<T style={styles.fieldLabel}>{label}</T>
				{required && <T style={styles.fieldRequired}>*</T>}
			</View>
			{hint && <T style={styles.fieldHint}>{hint}</T>}
			{children}
		</View>
	);
}

/* ── Input wrapper that adds icon + focus ring ── */
function FieldInput({
	icon,
	prefix,
	value,
	onChangeText,
	placeholder,
	keyboardType,
	multiline,
	numberOfLines,
}: {
	icon?: string;
	prefix?: string;
	value: string;
	onChangeText: (t: string) => void;
	placeholder?: string;
	keyboardType?: any;
	multiline?: boolean;
	numberOfLines?: number;
}) {
	const [focused, setFocused] = useState(false);
	return (
		<View style={[styles.inputWrap, focused && styles.inputWrapFocused, multiline && styles.inputWrapMulti]}>
			{icon && (
				<Icon
					name={icon as any}
					size={17}
					color={focused ? COLORS.primary : COLORS.textLight}
					style={styles.inputIcon}
				/>
			)}
			{prefix && <T style={styles.inputPrefix}>{prefix}</T>}
			<TextInput
				style={[styles.textInput, multiline && styles.textInputMulti]}
				value={value}
				onChangeText={onChangeText}
				placeholder={placeholder}
				placeholderTextColor={COLORS.textLight}
				keyboardType={keyboardType}
				multiline={multiline}
				numberOfLines={numberOfLines}
				textAlignVertical={multiline ? "top" : "center"}
				onFocus={() => setFocused(true)}
				onBlur={() => setFocused(false)}
			/>
		</View>
	);
}

/* ── Section card ── */
function SectionCard({
	icon,
	title,
	subtitle,
	children,
}: {
	icon: string;
	title: string;
	subtitle?: string;
	children: React.ReactNode;
}) {
	return (
		<View style={styles.sectionCard}>
			<View style={styles.sectionHeader}>
				<View style={styles.sectionIconWrap}>
					<Icon name={icon as any} size={16} color={COLORS.primary} />
				</View>
				<View style={{ flex: 1 }}>
					<T style={styles.sectionTitle}>{title}</T>
					{subtitle && <T style={styles.sectionSubtitle}>{subtitle}</T>}
				</View>
			</View>
			<View style={styles.sectionBody}>{children}</View>
		</View>
	);
}

export default function EditProduct() {
	const navigation = useNavigation();
	const insets = useSafeAreaInsets();
	const { session, logout } = useAuth();
	const isAdmin = session?.user?.role === "admin";

	const [name, setName] = useState("");
	const [category, setCategory] = useState("Sofas");
	const [categories, setCategories] = useState<string[]>([]);
	const [price, setPrice] = useState("");
	const [stock, setStock] = useState("0");
	const [sku, setSku] = useState("");
	const [description, setDescription] = useState("");
	const [imageUri, setImageUri] = useState<string | null>(null);
	const [model3DFile, setModel3DFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
	const [isSaving, setIsSaving] = useState(false);

	const saveScale = React.useRef(new Animated.Value(1)).current;

	useEffect(() => {
		if (!isAdmin) router.replace("/(tabs)");
	}, [isAdmin]);

	useEffect(() => {
		async function loadCategories() {
			const data = await getAllCategories();
			const names = data.map((item) => item.name);
			if (names.length > 0) {
				setCategories(names);
				if (!names.includes(category)) setCategory(names[0]);
			}
		}
		void loadCategories();
	}, []);

	if (!isAdmin) return null;

	const pickImage = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ["images"],
			allowsEditing: true,
			aspect: [4, 3],
			quality: 0.8,
		});
		if (!result.canceled && result.assets?.length > 0) {
			setImageUri(result.assets[0].uri);
		}
	};

	const pickModel3D = async () => {
		const result = await DocumentPicker.getDocumentAsync({
			type: ["model/gltf-binary", "application/octet-stream"],
			copyToCacheDirectory: true,
			multiple: false,
		});
		if (!result.canceled && result.assets?.length > 0) {
			const asset = result.assets[0];
			if (!asset.name?.toLowerCase().endsWith(".glb")) {
				Alert.alert("Invalid File", "Please select a .glb file.");
				return;
			}
			setModel3DFile(asset);
		}
	};

	const handleSave = async () => {
		if (!session?.token) {
			Alert.alert("Session Expired", "Please login again.");
			router.replace("/login");
			return;
		}
		if (!name || !price || !stock) {
			Alert.alert("Missing Fields", "Name, Price, and Stock are required.");
			return;
		}

		Animated.sequence([
			Animated.spring(saveScale, { toValue: 0.95, useNativeDriver: true, speed: 60, bounciness: 0 }),
			Animated.spring(saveScale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 10 }),
		]).start();

		setIsSaving(true);
		try {
			const formData = new FormData();
			formData.append("name", name);
			formData.append("category", category);
			formData.append("currentPrice", price);
			formData.append("amountInStock", stock);
			formData.append("sku", sku);
			formData.append("description", description);
			formData.append("isAmazonChoice", "false");
			formData.append("deliveryPrice", "0");
			formData.append("deliveryInDays", "7");

			if (imageUri) {
				const filename = imageUri.split("/").pop() || "image.jpg";
				const match = /\.(\w+)$/.exec(filename);
				const type = match ? `image/${match[1]}` : "image";
				formData.append("image", {
					uri: Platform.OS === "ios" ? imageUri.replace("file://", "") : imageUri,
					name: filename,
					type,
				} as any);
			}

			if (model3DFile) {
				formData.append("model3D", {
					uri: Platform.OS === "ios" ? model3DFile.uri.replace("file://", "") : model3DFile.uri,
					name: model3DFile.name || "model.glb",
					type: model3DFile.mimeType || "model/gltf-binary",
				} as any);
			}

			const response = await fetch(endpoints.products, {
				method: "POST",
				headers: { Authorization: `Bearer ${session.token}` },
				body: formData,
			});

			const data = await response.json();

			if (response.status === 401) {
				Alert.alert("Session Expired", "Please login again.");
				await logout();
				return;
			}
			if (response.ok) {
				Alert.alert("Product Saved", `"${name}" has been added successfully.`, [
					{ text: "Done", onPress: () => router.back() },
				]);
			} else {
				Alert.alert("Error", data.message || "Failed to save product.");
			}
		} catch {
			Alert.alert("Error", "An unexpected error occurred.");
		} finally {
			setIsSaving(false);
		}
	};

	const isFormValid = name.trim().length > 0 && price.trim().length > 0 && stock.trim().length > 0;

	return (
		<View style={{ flex: 1, backgroundColor: COLORS.background }}>

			{/* ── Header ── */}
			<View style={[styles.header, { paddingTop: insets.top > 0 ? insets.top + 12 : 52 }]}>
				<View style={styles.headerRow}>
					<Pressable onPress={() => router.back()} style={styles.headerBtn} hitSlop={6}>
						<Icon name="arrow-back" size={20} color={COLORS.textDark} />
					</Pressable>
					<View style={styles.headerCenter}>
						<T style={styles.headerTitle}>Add Product</T>
						<T style={styles.headerSub}>Fill in all required fields</T>
					</View>
					{/* Required legend */}
					<View style={styles.headerRequiredWrap}>
						<T style={styles.headerRequiredText}><T style={{ color: COLORS.danger }}>*</T> Required</T>
					</View>
				</View>
			</View>

			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ padding: 16, paddingBottom: 130 }}
			>
				{/* Hero info banner */}
				<LinearGradient
					colors={[COLORS.primary, COLORS.primaryDeep]}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 0 }}
					style={styles.heroBanner}
				>
					<View style={styles.heroIconWrap}>
						<MCIcon name="sofa" size={24} color={COLORS.primary} />
					</View>
					<View style={{ flex: 1, marginLeft: 14 }}>
						<T style={styles.heroLabel}>NEW PRODUCT</T>
						<T style={styles.heroTitle}>Add to Catalogue</T>
						<T style={styles.heroSub}>Complete the form to list a new furniture piece.</T>
					</View>
				</LinearGradient>

				{/* ── Section 1: Basic Info ── */}
				<SectionCard icon="information-circle-outline" title="Basic Information" subtitle="Name, category and pricing">
					<Field label="Product Name" required>
						<FieldInput
							icon="tag-outline"
							value={name}
							onChangeText={setName}
							placeholder="e.g. Mid-Century Velvet Sofa"
						/>
					</Field>

					<Field label="Price" required>
						<FieldInput
							prefix="\u20B9"
							icon="cash-outline"
							value={price}
							onChangeText={setPrice}
							placeholder="0.00"
							keyboardType="decimal-pad"
						/>
					</Field>

					<View style={styles.twoCol}>
						<View style={{ flex: 1 }}>
							<Field label="Stock Qty" required>
								<FieldInput
									icon="layers-outline"
									value={stock}
									onChangeText={setStock}
									keyboardType="numeric"
									placeholder="0"
								/>
							</Field>
						</View>
						<View style={{ flex: 1 }}>
							<Field label="SKU" hint="Optional">
								<FieldInput
									icon="barcode-outline"
									value={sku}
									onChangeText={setSku}
									placeholder="AUR-0000"
								/>
							</Field>
						</View>
					</View>
				</SectionCard>

				{/* ── Section 2: Category ── */}
				<SectionCard icon="grid-outline" title="Category" subtitle="Select the product category">
					{categories.length > 0 ? (
						<View style={styles.chipGrid}>
							{categories.map((cat) => {
								const active = category === cat;
								return (
									<Pressable key={cat} onPress={() => setCategory(cat)}>
										{active ? (
											<LinearGradient
												colors={[COLORS.primary, COLORS.primaryDeep]}
												start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
												style={styles.categoryChipActive}
											>
												<T style={styles.categoryChipTextActive}>{cat}</T>
												<Icon name="checkmark" size={13} color={COLORS.white} />
											</LinearGradient>
										) : (
											<View style={styles.categoryChip}>
												<T style={styles.categoryChipText}>{cat}</T>
											</View>
										)}
									</Pressable>
								);
							})}
						</View>
					) : (
						<View style={styles.noCategoryWrap}>
							<Icon name="alert-circle-outline" size={16} color={COLORS.textLight} />
							<T style={styles.noCategoryText}>No categories found. Add from admin dashboard.</T>
						</View>
					)}
				</SectionCard>

				{/* ── Section 3: Description ── */}
				<SectionCard icon="document-text-outline" title="Description" subtitle="Describe materials and style">
					<Field label="Product Description">
						<FieldInput
							icon="create-outline"
							value={description}
							onChangeText={setDescription}
							placeholder="Describe the materials, craftsmanship, and style of the piece..."
							multiline
							numberOfLines={5}
						/>
					</Field>
				</SectionCard>

				{/* ── Section 4: Media ── */}
				<SectionCard icon="images-outline" title="Media" subtitle="Product image and 3D model">

					{/* Image picker */}
					<Field label="Product Image" hint="JPG, PNG or WEBP — max 5 MB">
						<Pressable onPress={pickImage} style={styles.imagePickerWrap}>
							{imageUri ? (
								<View style={styles.imagePreviewContainer}>
									<RNImage
										source={{ uri: imageUri }}
										style={styles.imagePreview}
										resizeMode="cover"
									/>
									<View style={styles.imageOverlayBadge}>
										<Icon name="camera-outline" size={13} color={COLORS.white} />
										<T style={styles.imageOverlayText}>Change</T>
									</View>
								</View>
							) : (
								<View style={styles.imagePickerEmpty}>
									<View style={styles.imagePickerIcon}>
										<Icon name="cloud-upload-outline" size={28} color={COLORS.primary} />
									</View>
									<T style={styles.imagePickerTitle}>Tap to upload image</T>
									<T style={styles.imagePickerSub}>JPG, PNG or WEBP</T>
								</View>
							)}
						</Pressable>
					</Field>

					{/* 3D model picker */}
					<Field label="3D Model (.glb)" hint="Used for AR viewer — optional">
						<Pressable onPress={pickModel3D} style={styles.modelPickerWrap}>
							{model3DFile ? (
								<View style={styles.modelPickedRow}>
									<View style={styles.modelPickedIcon}>
										<MCIcon name="cube-scan" size={20} color={COLORS.primary} />
									</View>
									<View style={{ flex: 1, marginLeft: 10 }}>
										<T style={styles.modelPickedName} numberOfLines={1}>{model3DFile.name}</T>
										<T style={styles.modelPickedSize}>
											{model3DFile.size ? `${(model3DFile.size / 1024).toFixed(0)} KB` : "GLB file"}
										</T>
									</View>
									<Pressable
										onPress={(e) => { e.stopPropagation(); setModel3DFile(null); }}
										hitSlop={8}
										style={styles.modelRemoveBtn}
									>
										<Icon name="close" size={15} color={COLORS.danger} />
									</Pressable>
								</View>
							) : (
								<View style={styles.modelPickerEmpty}>
									<View style={styles.modelPickerIcon}>
										<MCIcon name="cube-outline" size={22} color={COLORS.textLight} />
									</View>
									<T style={styles.modelPickerTitle}>Tap to select .glb file</T>
									<T style={styles.modelPickerSub}>Only .glb files supported</T>
								</View>
							)}
						</Pressable>
					</Field>
				</SectionCard>
			</ScrollView>

			{/* ── Footer ── */}
			<View style={[styles.footer, { paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 24 }]}>
				<View style={styles.footerRow}>
					<Pressable
						onPress={() => router.back()}
						style={styles.cancelBtn}
						disabled={isSaving}
					>
						<T style={styles.cancelBtnText}>Cancel</T>
					</Pressable>

					<Animated.View style={[{ flex: 1 }, { transform: [{ scale: saveScale }] }]}>
						<Pressable
							onPress={handleSave}
							disabled={isSaving || !isFormValid}
							style={{ opacity: !isFormValid || isSaving ? 0.6 : 1 }}
						>
							<LinearGradient
								colors={[COLORS.primary, COLORS.primaryDeep]}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 0 }}
								style={styles.saveBtn}
							>
								{isSaving ? (
									<T style={styles.saveBtnText}>Saving...</T>
								) : (
									<>
										<Icon name="checkmark-circle-outline" size={20} color={COLORS.white} style={{ marginRight: 8 }} />
										<T style={styles.saveBtnText}>Save Product</T>
									</>
								)}
							</LinearGradient>
						</Pressable>
					</Animated.View>
				</View>
			</View>
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
	headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
	headerCenter: { flex: 1, alignItems: "center", paddingHorizontal: 8 },
	headerTitle: { fontSize: 17, fontWeight: "900", color: COLORS.textDark, letterSpacing: 0.3, textAlign: "center" },
	headerSub: { fontSize: 12, color: COLORS.textLight, fontWeight: "500", textAlign: "center", marginTop: 1 },
	headerBtn: {
		width: 40, height: 40, borderRadius: 12,
		borderWidth: 1, borderColor: COLORS.border,
		backgroundColor: COLORS.surface, alignItems: "center", justifyContent: "center",
	},
	headerRequiredWrap: { width: 40, alignItems: "flex-end" },
	headerRequiredText: { fontSize: 11, color: COLORS.textLight },

	/* Hero banner */
	heroBanner: {
		flexDirection: "row",
		alignItems: "center",
		borderRadius: 16,
		padding: 18,
		marginBottom: 16,
		shadowColor: COLORS.primary,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.25,
		shadowRadius: 12,
		elevation: 5,
	},
	heroIconWrap: {
		width: 52, height: 52, borderRadius: 26,
		backgroundColor: "rgba(255,255,255,0.95)",
		alignItems: "center", justifyContent: "center",
	},
	heroLabel: { fontSize: 10, fontWeight: "800", color: "rgba(255,255,255,0.7)", letterSpacing: 1.5 },
	heroTitle: { fontSize: 17, fontWeight: "900", color: COLORS.white, marginTop: 2 },
	heroSub: { fontSize: 12, color: "rgba(255,255,255,0.72)", marginTop: 3, lineHeight: 17 },

	/* Section card */
	sectionCard: {
		backgroundColor: COLORS.surface,
		borderRadius: 18,
		borderWidth: 1,
		borderColor: COLORS.borderLight,
		marginBottom: 14,
		overflow: "hidden",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.04,
		shadowRadius: 10,
		elevation: 2,
	},
	sectionHeader: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingTop: 16,
		paddingBottom: 12,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.borderLight,
		gap: 10,
	},
	sectionIconWrap: {
		width: 32, height: 32, borderRadius: 9,
		backgroundColor: COLORS.primaryMuted,
		alignItems: "center", justifyContent: "center",
	},
	sectionTitle: { fontSize: 14, fontWeight: "800", color: COLORS.textDark },
	sectionSubtitle: { fontSize: 12, color: COLORS.textLight, marginTop: 1 },
	sectionBody: { padding: 16, gap: 14 },

	/* Field */
	field: { gap: 6 },
	fieldLabelRow: { flexDirection: "row", alignItems: "center", gap: 3 },
	fieldLabel: { fontSize: 12, fontWeight: "700", color: COLORS.textDark, textTransform: "uppercase", letterSpacing: 0.5 },
	fieldRequired: { fontSize: 13, fontWeight: "700", color: COLORS.danger },
	fieldHint: { fontSize: 11, color: COLORS.textLight, marginTop: -2 },

	/* Input */
	inputWrap: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: COLORS.background,
		borderRadius: 12,
		borderWidth: 1.5,
		borderColor: COLORS.border,
		paddingHorizontal: 12,
		height: 50,
	},
	inputWrapFocused: {
		borderColor: COLORS.primary,
		backgroundColor: "#FFFBF5",
	},
	inputWrapMulti: {
		height: "auto",
		alignItems: "flex-start",
		paddingTop: 12,
		paddingBottom: 12,
	},
	inputIcon: { marginRight: 8 },
	inputPrefix: { fontSize: 15, fontWeight: "700", color: COLORS.textMid, marginRight: 4 },
	textInput: {
		flex: 1,
		fontSize: 14,
		color: COLORS.textDark,
		paddingVertical: 0,
	},
	textInputMulti: {
		minHeight: 100,
		paddingTop: 0,
	},

	/* Two column layout */
	twoCol: { flexDirection: "row", gap: 12 },

	/* Category chips */
	chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
	categoryChip: {
		paddingHorizontal: 14, paddingVertical: 8,
		borderRadius: 20, borderWidth: 1.5,
		borderColor: COLORS.border, backgroundColor: COLORS.surface,
	},
	categoryChipText: { fontSize: 13, fontWeight: "500", color: COLORS.textMid },
	categoryChipActive: {
		flexDirection: "row", alignItems: "center", gap: 5,
		paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
	},
	categoryChipTextActive: { fontSize: 13, fontWeight: "700", color: COLORS.white },
	noCategoryWrap: {
		flexDirection: "row", alignItems: "center", gap: 8,
		backgroundColor: COLORS.borderLight, borderRadius: 10, padding: 12,
	},
	noCategoryText: { fontSize: 13, color: COLORS.textLight, flex: 1 },

	/* Image picker */
	imagePickerWrap: { borderRadius: 14, overflow: "hidden" },
	imagePreviewContainer: { width: "100%", height: 200, position: "relative" },
	imagePreview: { width: "100%", height: "100%" },
	imageOverlayBadge: {
		position: "absolute", bottom: 12, right: 12,
		flexDirection: "row", alignItems: "center", gap: 5,
		backgroundColor: "rgba(0,0,0,0.6)",
		borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
	},
	imageOverlayText: { fontSize: 12, fontWeight: "600", color: COLORS.white },
	imagePickerEmpty: {
		height: 180,
		backgroundColor: "#FFFBF5",
		borderRadius: 14,
		borderWidth: 1.5,
		borderColor: COLORS.primaryBorder,
		borderStyle: "dashed",
		alignItems: "center",
		justifyContent: "center",
		gap: 6,
	},
	imagePickerIcon: {
		width: 60, height: 60, borderRadius: 30,
		backgroundColor: COLORS.primaryMuted, alignItems: "center", justifyContent: "center",
		shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 2,
	},
	imagePickerTitle: { fontSize: 15, fontWeight: "700", color: COLORS.textDark },
	imagePickerSub: { fontSize: 12, color: COLORS.textLight },

	/* Model picker */
	modelPickerWrap: {
		borderRadius: 12, borderWidth: 1.5,
		borderColor: COLORS.border, backgroundColor: COLORS.background,
	},
	modelPickerEmpty: {
		paddingVertical: 20, alignItems: "center", gap: 5,
	},
	modelPickerIcon: {
		width: 44, height: 44, borderRadius: 22,
		backgroundColor: COLORS.borderLight, alignItems: "center", justifyContent: "center",
	},
	modelPickerTitle: { fontSize: 13, fontWeight: "600", color: COLORS.textDark },
	modelPickerSub: { fontSize: 11, color: COLORS.textLight },
	modelPickedRow: {
		flexDirection: "row", alignItems: "center",
		paddingHorizontal: 14, paddingVertical: 14,
	},
	modelPickedIcon: {
		width: 40, height: 40, borderRadius: 10,
		backgroundColor: COLORS.primaryMuted, alignItems: "center", justifyContent: "center",
	},
	modelPickedName: { fontSize: 13, fontWeight: "600", color: COLORS.textDark },
	modelPickedSize: { fontSize: 11, color: COLORS.textLight, marginTop: 1 },
	modelRemoveBtn: {
		width: 28, height: 28, borderRadius: 14,
		backgroundColor: "#FEF2F2", alignItems: "center", justifyContent: "center",
	},

	/* Footer */
	footer: {
		position: "absolute",
		bottom: 0, left: 0, right: 0,
		backgroundColor: COLORS.surface,
		paddingHorizontal: 16,
		paddingTop: 14,
		borderTopWidth: 1,
		borderTopColor: COLORS.borderLight,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: -4 },
		shadowOpacity: 0.06,
		shadowRadius: 16,
		elevation: 10,
	},
	footerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
	cancelBtn: {
		width: 90, height: 52, borderRadius: 14,
		borderWidth: 1.5, borderColor: COLORS.border,
		backgroundColor: COLORS.surface,
		alignItems: "center", justifyContent: "center",
	},
	cancelBtnText: { fontSize: 15, fontWeight: "600", color: COLORS.textMid },
	saveBtn: {
		height: 52, borderRadius: 14,
		flexDirection: "row", alignItems: "center", justifyContent: "center",
		shadowColor: COLORS.primary,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
	},
	saveBtnText: { fontSize: 16, fontWeight: "700", color: COLORS.white },
});