import { Header, StackHeaderProps } from "@/components/Shared/header/Header";
import { Stack } from "expo-router";

export default function SearchLayout() {
	return (
		<Stack
			screenOptions={
				{
					header: (props) => <Header {...props} />,
					headerSearchShown: true,
				} as StackHeaderProps["options"]
			}
		>
			<Stack.Screen name="index" />
		</Stack>
	);
}
