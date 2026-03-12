import Icon from "@expo/vector-icons/Ionicons";
import { Text, XStack } from "tamagui";

export function DeliveryLocation() {
	return (
		<XStack
			bg={"#c7e8f0"}
			w={"100%"}
			jc={"flex-start"}
			gap={5}
			ai={"center"}
			p={15}
		>
			<Icon name="location-outline" color={"black"} size={24} />
			<Text ml={10} fos={16} ta={"center"} color={"black"} fow={"normal"}>
				Deliver to -
			</Text>
			<Text fos={16} ta={"center"} color={"black"} fow={"normal"}>
				Select Location
			</Text>
			<Icon name="chevron-down" color={"black"} size={18} />
		</XStack>
	);
}
