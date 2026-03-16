import {
	createContext,
	PropsWithChildren,
	useContext,
	useEffect,
	useState,
} from "react";
import { router, SplashScreen, useSegments } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { endpoints } from "@/utils/api";
import { Alert } from "react-native";

interface User {
	id: string;
	username: string;
	email: string;
	role: string;
}

interface LocalSession {
	user: User;
	token: string;
}

interface AuthContextType {
	session: LocalSession | null;
	isLoading: boolean;
	login: (email: string, password: string, options?: { requireRole?: string }) => Promise<boolean>;
	signup: (username: string, email: string, password: string, role?: string) => Promise<boolean>;
	logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
	session: null,
	isLoading: false,
	login: async () => false,
	signup: async () => false,
	logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

SplashScreen.preventAutoHideAsync();

export const AuthProvider = ({ children }: PropsWithChildren) => {
	const [session, setSession] = useState<LocalSession | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const segments = useSegments();

	useEffect(() => {
		async function loadSession() {
			try {
				const storedSession = await AsyncStorage.getItem("session");
				if (storedSession) {
					setSession(JSON.parse(storedSession));
				}
			} catch (error) {
				console.error("Failed to load session", error);
			} finally {
				setIsLoading(false);
				SplashScreen.hideAsync();
			}
		}

		loadSession();
	}, []);

	useEffect(() => {
		if (isLoading) return;
		const inAuthGroup = segments[0] === "login";
		if (!session && !inAuthGroup) {
			router.replace("/login");
		} else if (session && inAuthGroup) {
			router.replace("/(tabs)");
		}
	}, [session, isLoading, segments]);

	const login = async (
		email: string,
		password: string,
		options?: { requireRole?: string }
	): Promise<boolean> => {
		try {
			const res = await fetch(endpoints.login, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});

			const data = await res.json();
			if (!res.ok) {
				Alert.alert("Login Failed", data.message || "Invalid credentials");
				return false;
			}

			if (options?.requireRole && data?.user?.role !== options.requireRole) {
				Alert.alert("Access Denied", `This account is not a ${options.requireRole} account.`);
				return false;
			}

			const newSession: LocalSession = {
				user: data.user,
				token: data.access_token,
			};

			setSession(newSession);
			await AsyncStorage.setItem("session", JSON.stringify(newSession));
			router.replace("/(tabs)");
			return true;
		} catch (error) {
			console.error("Login error", error);
			Alert.alert("Error", "Could not connect to the server.");
			return false;
		}
	};

	const signup = async (username: string, email: string, password: string, role: string = "user"): Promise<boolean> => {
		try {
			const res = await fetch(endpoints.signup, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, email, password, role }),
			});

			const data = await res.json();
			if (!res.ok) {
				Alert.alert("Signup Failed", data.message || "Could not create user");
				return false;
			}

			// After successful signup, log them in automatically
			return await login(email, password);
		} catch (error) {
			console.error("Signup error", error);
			Alert.alert("Error", "Could not connect to the server.");
			return false;
		}
	};

	const logout = async () => {
		setSession(null);
		await AsyncStorage.removeItem("session");
		router.replace("/login");
	};

	return (
		<AuthContext.Provider value={{ session, isLoading, login, signup, logout }}>
			{children}
		</AuthContext.Provider>
	);
};
