import { Dimensions } from "react-native";
import { Image, ScrollView, Text, YStack } from "tamagui";

import IMG_AD_1 from "@/assets/home-sugg-1.png";
import IMG_AD_2 from "@/assets/home-sugg-2.png";
import IMG_AD_3 from "@/assets/home-sugg-1.png";

const images = [IMG_AD_1, IMG_AD_2, IMG_AD_3];

export function HomeSuggestions() {
	return (
		<YStack h={170} w={Dimensions.get("window").width}>
			<ScrollView
				horizontal
				mt={-50}
				showsHorizontalScrollIndicator={false}
			>
				{images.map((image, index) => (
					<YStack
						key={index}
						bg={"white"}
						w={150}
						h={200}
						br={4}
						ml={20}
						shac={"$colorShadow"}
						shof={{ width: 3, height: 3 }}
						shop={0.4}
						shar={6}
					>
						<Text fow={"bold"} px={10} pt={10} pb={25}>
							New Arrivals
						</Text>
						<Image
							source={{ uri: image }}
							w="100%"
							h={150}
							bbrr={4}
							bblr={4}
						/>
					</YStack>
				))}
			</ScrollView>
		</YStack>
	);
}
