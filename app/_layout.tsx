import React from "react";
import { StatusBar } from "expo-status-bar";
import { TamaguiProvider } from "tamagui";
import { tamaguiConfig } from "../tamagui.config";
import { Stack } from "expo-router";
import { AuthProvider } from "@/context/AuthProvider";
import { CartProvider } from "@/context/CartProvider";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-reanimated";

export default function RootLayout() {
	return (
		<SafeAreaProvider>
		<GestureHandlerRootView>
			<AuthProvider>
				<CartProvider>
					<TamaguiProvider config={tamaguiConfig}>
						<StatusBar style="dark" />
						<Stack screenOptions={{ headerShown: false }} initialRouteName="(tabs)">
							<Stack.Screen name="(tabs)" />
							<Stack.Screen name="(search)" />
							<Stack.Screen
								name="login"
								options={{
									headerShown: false,
									presentation: "fullScreenModal",
								}}
							/>
						</Stack>
					</TamaguiProvider>
				</CartProvider>
			</AuthProvider>
		</GestureHandlerRootView>
		</SafeAreaProvider>
	);
}
