import { Text, XStack } from "tamagui";

export interface HeaderTabsProps {
	tabs:
		| {
				title: string;
				onPress: VoidFunction;
				active?: boolean;
		  }[]
		| null;
}

export function HeaderTabs({ tabs }: HeaderTabsProps) {
	if (!tabs?.length) return null;

	return (
		<XStack gap={40} px={20}>
			{tabs.map((tab) => (
				<Text
					fos={16}
					key={tab.title}
					onPress={tab.onPress}
					bbc={tab.active ? "black" : "$colorTransparent"}
					bbw={tab.active ? 2.5 : 0}
					pb={10}
					mb={-10}
				>
					{tab.title}
				</Text>
			))}
		</XStack>
	);
}
