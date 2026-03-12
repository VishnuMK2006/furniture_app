import React, { useState } from 'react';
import { View, Pressable, Alert } from 'react-native';
import { Text, XStack, YStack, Input, Button, Image } from 'tamagui';
import { useNavigation, router } from 'expo-router';
import Icon from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
	primary: "#d97706",
	textDark: "#0f172a",
	textLight: "#64748b",
	background: "#fdfbf7",
	surface: "#ffffff",
	border: "#e2e8f0",
};

export default function AdminLogin() {
	const navigation = useNavigation();
	const insets = useSafeAreaInsets();
	
	const [email, setEmail] = useState('admin@kishore.com');
	const [password, setPassword] = useState('password123');
	const [showPassword, setShowPassword] = useState(false);

	const handleLogin = () => {
		Alert.alert("Admin Access", "Verifying credentials...");
		// Fake verification to proceed to dashboard
		setTimeout(() => router.replace("/(tabs)/admin"), 1000);
	};

	return (
		<YStack f={1} bg={COLORS.background}>
			{/* Wooden Slat Background Hero */}
			<YStack h={280} w="100%" pos="relative" jc="flex-end" px={30} pb={30}>
				{/* If this was a real image, we would use <Image />. We use a dark color as fallback */}
				<View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#2d241c' }} />
				
				<YStack zIndex={10}>
					<XStack bg={COLORS.primary} as="span" self="flex-start" px={10} py={4} br={4} mb={10}>
						<Text color="white" fos={12} fow="800" tt="uppercase" ls={1}>Management Portal</Text>
					</XStack>
					<Text fos={32} fow="900" color="white" lh={38}>Administrator Login</Text>
				</YStack>
			</YStack>

			<YStack flex={1} px={30} pt={30}>
				<Text fos={15} color={COLORS.textDark} lh={24} mb={30}>
					Please enter your credentials to access the Kishore management console. Authorized access only.
				</Text>

				<YStack gap={20}>
					<YStack gap={8}>
						<Text fos={14} fow="700" color={COLORS.textDark}>Admin Email Address</Text>
						<XStack ai="center" bg="transparent" bc={COLORS.border} bw={1} h={52} br={8} px={15}>
							<Icon name="mail" size={20} color={COLORS.primary} style={{ marginRight: 10 }} />
							<Input 
								f={1}
								bw={0}
								p={0}
								h="100%"
								bg="transparent"
								value={email}
								onChangeText={setEmail}
								placeholder="admin@kishore.com"
								keyboardType="email-address"
								autoCapitalize="none"
								color={COLORS.textLight}
							/>
						</XStack>
					</YStack>

					<YStack gap={8}>
						<Text fos={14} fow="700" color={COLORS.textDark}>Password</Text>
						<XStack ai="center" bg="transparent" bc={COLORS.border} bw={1} h={52} br={8} px={15}>
							<Icon name="lock-closed" size={20} color={COLORS.primary} style={{ marginRight: 10 }} />
							<Input 
								f={1}
								bw={0}
								p={0}
								h="100%"
								bg="transparent"
								value={password}
								onChangeText={setPassword}
								secureTextEntry={!showPassword}
								color={COLORS.textDark}
							/>
							<Pressable onPress={() => setShowPassword(!showPassword)}>
								<Icon name={showPassword ? "eye-off" : "eye"} size={20} color={COLORS.textLight} />
							</Pressable>
						</XStack>
					</YStack>
				</YStack>

				<XStack mt={20} jc="space-between" ai="center">
					<XStack ai="center" gap={10}>
						<View style={{ width: 18, height: 18, borderRadius: 4, borderWidth: 1, borderColor: COLORS.border }} />
						<Text color={COLORS.textDark} fos={14}>Remember session</Text>
					</XStack>
					<Pressable>
						<Text color={COLORS.primary} fow="700" fos={14}>Forgot password?</Text>
					</Pressable>
				</XStack>

				<Button
					mt={30} 
					h={52} 
					br={8} 
					bg={COLORS.primary} 
					color="white" 
					onPress={handleLogin}
				>
					<XStack ai="center" gap={10}>
						<Icon name="shield-checkmark" size={20} color="white" />
						<Text color="white" fow="700" fos={16}>Log In as Administrator</Text>
					</XStack>
				</Button>

				<YStack mt="auto" mb={30} ai="center" pt={30} borderTopWidth={1} bc={COLORS.border}>
					<Text fos={12} fow="700" color={COLORS.textLight} ls={1} mb={10}>SECURITY NOTICE</Text>
					<Text fos={12} color={COLORS.textLight} ta="center" lh={18}>
						This system is restricted to authorized personnel. Any unauthorized access is strictly prohibited and subject to monitoring.
					</Text>
				</YStack>
			</YStack>
		</YStack>
	);
}
