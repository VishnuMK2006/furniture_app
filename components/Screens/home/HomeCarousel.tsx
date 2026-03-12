import { Dimensions, FlatList, StyleSheet, View, Pressable } from "react-native";
import Animated, {
	useSharedValue,
	useAnimatedScrollHandler,
	useAnimatedStyle,
	interpolate,
	Extrapolation,
	withSpring,
	useDerivedValue,
} from "react-native-reanimated";
import { Image } from "tamagui";
import { useEffect, useRef, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";

import IMG_AD_1 from "@/assets/home-ad-1.png";
import IMG_AD_2 from "@/assets/home-ad-2.png";
import IMG_AD_3 from "@/assets/home-ad-3.png";

const images = [IMG_AD_1, IMG_AD_2, IMG_AD_3];
const { width } = Dimensions.get("window");
const CARD_HEIGHT = 200;
const RADIUS = 16;

// Animated dot indicator
function Dot({ index, scrollX }: { index: number; scrollX: Animated.SharedValue<number> }) {
	const animStyle = useAnimatedStyle(() => {
		const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
		const dotWidth = interpolate(scrollX.value, inputRange, [6, 20, 6], Extrapolation.CLAMP);
		const opacity = interpolate(scrollX.value, inputRange, [0.35, 1, 0.35], Extrapolation.CLAMP);
		return { width: dotWidth, opacity };
	});

	return <Animated.View style={[styles.dot, animStyle]} />;
}

export function HomeCarousel() {
	const scrollX = useSharedValue(0);
	const ref = useRef<FlatList>(null);
	const currentIndex = useRef(0);
	const [activeIndex, setActiveIndex] = useState(0);

	const scrollHandler = useAnimatedScrollHandler({
		onScroll: (event) => {
			scrollX.value = event.contentOffset.x;
		},
	});

	useEffect(() => {
		const interval = setInterval(() => {
			currentIndex.current = (currentIndex.current + 1) % images.length;
			setActiveIndex(currentIndex.current);
			ref.current?.scrollToIndex({
				index: currentIndex.current,
				animated: true,
			});
		}, 3500);

		return () => clearInterval(interval);
	}, []);

	const goToIndex = (i: number) => {
		currentIndex.current = i;
		setActiveIndex(i);
		ref.current?.scrollToIndex({ index: i, animated: true });
	};

	return (
		<View style={styles.wrapper}>
			<Animated.FlatList
				ref={ref}
				data={images}
				horizontal
				showsHorizontalScrollIndicator={false}
				keyExtractor={(_, i) => String(i)}
				pagingEnabled
				onScroll={scrollHandler}
				scrollEventThrottle={16}
				renderItem={({ item }) => (
					<View style={styles.slide}>
						<Image
							source={item}
							w={width - 32}
							h={CARD_HEIGHT}
							borderRadius={RADIUS}
							objectFit="cover"
						/>
						{/* Bottom gradient overlay for depth */}
						<LinearGradient
							colors={["transparent", "rgba(0,0,0,0.28)"]}
							style={styles.slideGradient}
							pointerEvents="none"
						/>
					</View>
				)}
				contentContainerStyle={styles.listContent}
				decelerationRate="fast"
				snapToInterval={width - 32 + 12}
				snapToAlignment="start"
				getItemLayout={(_, index) => ({
					length: width - 32 + 12,
					offset: (width - 32 + 12) * index,
					index,
				})}
			/>

			{/* Dot indicators */}
			<View style={styles.dotsRow}>
				{images.map((_, i) => (
					<Pressable key={i} onPress={() => goToIndex(i)} hitSlop={6}>
						<Dot index={i} scrollX={scrollX} />
					</Pressable>
				))}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		width: "100%",
		paddingTop: 4,
	},
	listContent: {
		paddingHorizontal: 16,
		gap: 12,
	},
	slide: {
		width: width - 32,
		height: CARD_HEIGHT,
		borderRadius: RADIUS,
		overflow: "hidden",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.12,
		shadowRadius: 16,
		elevation: 5,
		backgroundColor: "#F1F5F9",
	},
	slideGradient: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		height: 80,
		borderBottomLeftRadius: RADIUS,
		borderBottomRightRadius: RADIUS,
	},
	dotsRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 5,
		marginTop: 12,
		marginBottom: 4,
	},
	dot: {
		height: 6,
		borderRadius: 3,
		backgroundColor: "#D97706",
	},
});