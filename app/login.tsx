import React, { useState } from "react";
import Icon from "@expo/vector-icons/Ionicons";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import {
	Alert,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	TextInput,
	View,
	Animated,
} from "react-native";
import { Text, XStack, YStack } from "tamagui";
import { useAuth } from "@/context/AuthProvider";
import { LinearGradient } from "expo-linear-gradient";

enum Step {
	LOGIN = 1,
	SIGNUP = 2,
}

const COLORS = {
	primary: "#FF6A00",
	primaryLight: "#FF8A00",
	primaryMuted: "#FFF3E0",
	textDark: "#111827",
	textMid: "#4B5563",
	textLight: "#9CA3AF",
	background: "#F9FAFB",
	surface: "#FFFFFF",
	border: "#E5E7EB",
	borderFocus: "#FF6A00",
	danger: "#EF4444",
};

export default function Login() {
	const { login, signup } = useAuth();

	const [step, setStep] = useState<Step>(Step.LOGIN);
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [role, setRole] = useState<"user" | "admin">("user");
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [focusedField, setFocusedField] = useState<string | null>(null);

	const switchStep = (target: Step) => {
		setStep(target);
		setUsername("");
		setEmail("");
		setPassword("");
		setConfirmPassword("");
		setShowPassword(false);
	};

	const handleSubmit = async () => {
		setIsLoading(true);
		if (step === Step.LOGIN) {
			if (!email || !password) {
				Alert.alert("Missing Fields", "Please enter your email and password.");
				setIsLoading(false);
				return;
			}
			const success = await login(email, password);
			if (success) {
				setEmail("");
				setPassword("");
			}
		} else {
			if (!username || !email || !password || !confirmPassword) {
				Alert.alert("Missing Fields", "Please fill in all fields.");
				setIsLoading(false);
				return;
			}
			if (password !== confirmPassword) {
				Alert.alert("Password Mismatch", "Passwords do not match.");
				setIsLoading(false);
				return;
			}
			const success = await signup(username, email, password, role);
			if (success) {
				setUsername("");
				setEmail("");
				setPassword("");
				setConfirmPassword("");
			}
		}
		setIsLoading(false);
	};

	const inputStyle = (field: string) => [
		styles.inputWrapper,
		focusedField === field && styles.inputWrapperFocused,
	];

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={{ flex: 1, backgroundColor: COLORS.background }}
		>
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ flexGrow: 1, paddingBottom: 60 }}
				keyboardShouldPersistTaps="handled"
			>
				<YStack f={1} ai="center" px={24} pt={60} bg={COLORS.background}>

					{/* Wordmark + Icon */}
					<YStack ai="center" mb={step === Step.LOGIN ? 44 : 36} gap={14}>
						<View style={styles.logoRing}>
							<View style={styles.logoInner}>
								<MCIcon
									name={step === Step.LOGIN ? "sofa" : "account-plus-outline"}
									size={30}
									color={COLORS.primary}
								/>
							</View>
						</View>

						<YStack ai="center" gap={6}>
							<Text style={styles.brandName}>
								{step === Step.LOGIN ? "KISHORE" : "Create Account"}
							</Text>
							<Text style={styles.tagline}>
								{step === Step.LOGIN
									? "Experience timeless elegance"
									: "Craft your dream home with us"}
							</Text>
						</YStack>
					</YStack>

					{/* Card */}
					<View style={styles.card}>

						{step === Step.SIGNUP && (
							<FieldGroup label="Full Name">
								<View style={inputStyle("username")}>
									<Icon name="person-outline" size={17} color={focusedField === "username" ? COLORS.primary : COLORS.textLight} style={styles.fieldIcon} />
									<TextInput
										style={styles.textInput}
										value={username}
										onChangeText={setUsername}
										placeholder="Your full name"
										placeholderTextColor={COLORS.textLight}
										autoCapitalize="words"
										autoCorrect={false}
										onFocus={() => setFocusedField("username")}
										onBlur={() => setFocusedField(null)}
									/>
								</View>
							</FieldGroup>
						)}

						<FieldGroup label="Email Address">
							<View style={inputStyle("email")}>
								<Icon name="mail-outline" size={17} color={focusedField === "email" ? COLORS.primary : COLORS.textLight} style={styles.fieldIcon} />
								<TextInput
									style={styles.textInput}
									value={email}
									onChangeText={setEmail}
									placeholder="name@example.com"
									placeholderTextColor={COLORS.textLight}
									autoCapitalize="none"
									autoCorrect={false}
									keyboardType="email-address"
									onFocus={() => setFocusedField("email")}
									onBlur={() => setFocusedField(null)}
								/>
							</View>
						</FieldGroup>

						<FieldGroup label="Password" noMarginBottom={step === Step.LOGIN}>
							<View style={inputStyle("password")}>
								<Icon name="lock-closed-outline" size={17} color={focusedField === "password" ? COLORS.primary : COLORS.textLight} style={styles.fieldIcon} />
								<TextInput
									style={[styles.textInput, { flex: 1 }]}
									value={password}
									onChangeText={setPassword}
									placeholder={step === Step.SIGNUP ? "Create a strong password" : "Enter your password"}
									placeholderTextColor={COLORS.textLight}
									secureTextEntry={!showPassword}
									onFocus={() => setFocusedField("password")}
									onBlur={() => setFocusedField(null)}
								/>
								<Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn} hitSlop={8}>
									<Icon
										name={showPassword ? "eye-off-outline" : "eye-outline"}
										size={19}
										color={COLORS.textLight}
									/>
								</Pressable>
							</View>
						</FieldGroup>

						{step === Step.SIGNUP && (
							<FieldGroup label="Confirm Password">
								<View style={inputStyle("confirm")}>
									<Icon name="checkmark-circle-outline" size={17} color={focusedField === "confirm" ? COLORS.primary : COLORS.textLight} style={styles.fieldIcon} />
									<TextInput
										style={styles.textInput}
										value={confirmPassword}
										onChangeText={setConfirmPassword}
										placeholder="Repeat your password"
										placeholderTextColor={COLORS.textLight}
										secureTextEntry={!showPassword}
										onFocus={() => setFocusedField("confirm")}
										onBlur={() => setFocusedField(null)}
									/>
								</View>
							</FieldGroup>
						)}

						{step === Step.SIGNUP && (
							<View style={{ marginBottom: 22 }}>
								<Text style={styles.fieldLabel}>Account Type</Text>
								<XStack gap={10} mt={8}>
									{(["user", "admin"] as const).map((r) => (
										<Pressable
											key={r}
											onPress={() => setRole(r)}
											style={[styles.roleChip, role === r && styles.roleChipActive]}
										>
											<Icon
												name={r === "user" ? "person-outline" : "shield-checkmark-outline"}
												size={15}
												color={role === r ? COLORS.primary : COLORS.textLight}
											/>
											<Text style={[styles.roleChipText, role === r && styles.roleChipTextActive]}>
												{r === "user" ? "Customer" : "Admin"}
											</Text>
										</Pressable>
									))}
								</XStack>
							</View>
						)}

						{step === Step.LOGIN && (
							<Pressable
								onPress={() => Alert.alert("Forgot Password", "Reset link sent to your email.")}
								style={styles.forgotRow}
								hitSlop={6}
							>
								<Text style={styles.forgotText}>Forgot password?</Text>
							</Pressable>
						)}

						<Pressable
							onPress={handleSubmit}
							disabled={isLoading}
							style={{ opacity: isLoading ? 0.65 : 1 }}
						>
							<LinearGradient
								colors={["#FF8A00", "#FF5500"]}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 0 }}
								style={styles.submitBtn}
							>
								<Text style={styles.submitBtnText}>
									{isLoading ? "Please wait..." : step === Step.LOGIN ? "Log In" : "Create Account"}
								</Text>
								{!isLoading && (
									<Icon
										name={step === Step.LOGIN ? "arrow-forward" : "checkmark"}
										size={18}
										color="white"
										style={{ marginLeft: 6 }}
									/>
								)}
							</LinearGradient>
						</Pressable>
					</View>

					{/* Social login — login step only */}
					{step === Step.LOGIN && (
						<YStack w="100%" mt={30} gap={14}>
							<XStack ai="center" gap={12}>
								<View style={styles.dividerLine} />
								<Text style={styles.dividerLabel}>OR CONTINUE WITH</Text>
								<View style={styles.dividerLine} />
							</XStack>

							<XStack gap={10}>
								<Pressable style={[styles.socialBtn, { flex: 1 }]}>
									<MCIcon name="google" size={19} color="#DB4437" />
									<Text style={styles.socialBtnText}>Google</Text>
								</Pressable>
								<Pressable style={[styles.socialBtn, { flex: 1 }]}>
									<MCIcon name="apple" size={21} color={COLORS.textDark} />
									<Text style={styles.socialBtnText}>Apple</Text>
								</Pressable>
							</XStack>
						</YStack>
					)}

					{/* Footer toggle */}
					<XStack mt={32} jc="center" ai="center" gap={4}>
						<Text style={styles.footerText}>
							{step === Step.LOGIN ? "Don't have an account?" : "Already have an account?"}
						</Text>
						<Pressable onPress={() => switchStep(step === Step.LOGIN ? Step.SIGNUP : Step.LOGIN)} hitSlop={6}>
							<Text style={styles.footerLink}>
								{step === Step.LOGIN ? " Sign Up" : " Log In"}
							</Text>
						</Pressable>
					</XStack>

					{step === Step.SIGNUP && (
						<Text style={styles.legalText}>
							By signing up, you agree to Kishore's{" "}
							<Text style={styles.legalLink}>Terms of Service</Text>
							{" "}and{" "}
							<Text style={styles.legalLink}>Privacy Policy</Text>.
						</Text>
					)}

				</YStack>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

/* Small helper to reduce field boilerplate */
function FieldGroup({
	label,
	children,
	noMarginBottom,
}: {
	label: string;
	children: React.ReactNode;
	noMarginBottom?: boolean;
}) {
	return (
		<View style={{ marginBottom: noMarginBottom ? 4 : 16 }}>
			<Text style={styles.fieldLabel}>{label}</Text>
			{children}
		</View>
	);
}

const styles = StyleSheet.create({
	/* Logo */
	logoRing: {
		width: 88,
		height: 88,
		borderRadius: 44,
		borderWidth: 1.5,
		borderColor: "#FFD7B5",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "transparent",
	},
	logoInner: {
		width: 68,
		height: 68,
		borderRadius: 34,
		backgroundColor: "#FFF3E0",
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#FF6A00",
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.18,
		shadowRadius: 14,
		elevation: 5,
	},
	brandName: {
		fontSize: 26,
		fontWeight: "900",
		color: "#111827",
		letterSpacing: 3,
	},
	tagline: {
		fontSize: 14,
		color: "#9CA3AF",
		letterSpacing: 0.3,
	},

	/* Card */
	card: {
		width: "100%",
		backgroundColor: "#FFFFFF",
		borderRadius: 22,
		padding: 24,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.07,
		shadowRadius: 20,
		elevation: 4,
	},

	/* Field */
	fieldLabel: {
		fontSize: 12,
		fontWeight: "700",
		color: "#374151",
		marginBottom: 8,
		letterSpacing: 0.5,
		textTransform: "uppercase",
	},
	inputWrapper: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#F9FAFB",
		borderRadius: 12,
		borderWidth: 1.5,
		borderColor: "#E5E7EB",
		paddingHorizontal: 14,
		height: 52,
	},
	inputWrapperFocused: {
		borderColor: "#FF6A00",
		backgroundColor: "#FFFAF7",
	},
	fieldIcon: {
		marginRight: 10,
	},
	textInput: {
		flex: 1,
		height: "100%",
		fontSize: 15,
		color: "#111827",
		paddingVertical: 0,
	},
	eyeBtn: {
		padding: 4,
	},

	/* Role chips */
	roleChip: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 11,
		borderRadius: 10,
		borderWidth: 1.5,
		borderColor: "#E5E7EB",
		backgroundColor: "#F9FAFB",
		gap: 6,
	},
	roleChipActive: {
		borderColor: "#FF6A00",
		backgroundColor: "#FFF3E0",
	},
	roleChipText: {
		fontSize: 13,
		fontWeight: "600",
		color: "#9CA3AF",
	},
	roleChipTextActive: {
		color: "#FF6A00",
	},

	/* Forgot */
	forgotRow: {
		alignSelf: "flex-end",
		marginTop: 10,
		marginBottom: 20,
	},
	forgotText: {
		fontSize: 13,
		fontWeight: "700",
		color: "#FF6A00",
	},

	/* Submit */
	submitBtn: {
		height: 52,
		borderRadius: 13,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#FF6A00",
		shadowOffset: { width: 0, height: 5 },
		shadowOpacity: 0.32,
		shadowRadius: 12,
		elevation: 6,
	},
	submitBtnText: {
		color: "white",
		fontWeight: "700",
		fontSize: 16,
		letterSpacing: 0.3,
	},

	/* Divider */
	dividerLine: {
		flex: 1,
		height: 1,
		backgroundColor: "#E5E7EB",
	},
	dividerLabel: {
		fontSize: 10,
		fontWeight: "700",
		color: "#9CA3AF",
		letterSpacing: 1.2,
	},

	/* Social */
	socialBtn: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#FFFFFF",
		borderRadius: 13,
		borderWidth: 1.5,
		borderColor: "#E5E7EB",
		height: 52,
		gap: 8,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.04,
		shadowRadius: 6,
		elevation: 1,
	},
	socialBtnText: {
		fontSize: 14,
		fontWeight: "600",
		color: "#111827",
	},

	/* Footer */
	footerText: {
		fontSize: 14,
		color: "#9CA3AF",
	},
	footerLink: {
		fontSize: 14,
		fontWeight: "700",
		color: "#FF6A00",
	},
	legalText: {
		fontSize: 12,
		color: "#9CA3AF",
		textAlign: "center",
		marginTop: 14,
		paddingHorizontal: 20,
		lineHeight: 19,
	},
	legalLink: {
		color: "#FF6A00",
		textDecorationLine: "underline",
	},
});