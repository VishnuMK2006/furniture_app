import { Dimensions } from "react-native";
import { Image, Text, XStack, YStack } from "tamagui";

const items = {
	box: {
		icon: require("@/assets/box.png"),
		text: "Check order status and track, change or return items.",
	},
	bag: {
		icon: require("@/assets/bag.png"),
		text: "Shop past purchases and everyday essentials",
	},
	receipt: {
		icon: require("@/assets/receipt.png"),
		text: "Create lists with items you want now or later",
	},
};

export function ProfileUnauthedBanner() {
	return (
		<YStack mx={24} gap={60} ai={"flex-start"}>
			{Object.entries(items).map(([_, { icon, text }]) => (
				<XStack key={icon} jc={"flex-start"} ai={"center"} gap={10}>
					<Image source={icon} w={60} h={60} />
					<Text
						fos={20}
						maxWidth={Dimensions.get("window").width - 100}
					>
						{text}
					</Text>
				</XStack>
			))}
		</YStack>
	);
}
