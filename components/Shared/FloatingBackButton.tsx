import Icon from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "tamagui";

interface Props {
	onPress: VoidFunction;
}

export default function FloatingBackButton({ onPress }: Props) {
	const edgeInsets = useSafeAreaInsets();

	return (
		<Button
			onPress={onPress}
			zIndex={1}
			pos="absolute"
			bg="lightgray"
			t={10}
			l={10}
			br={50}
			w={60}
			h={60}
			mt={edgeInsets.top}
		>
			<Icon name="chevron-back" size={22} />
		</Button>
	);
}
