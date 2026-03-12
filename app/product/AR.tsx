import React, { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import {
	Viro3DObject,
	ViroAmbientLight,
	ViroARPlane,
	ViroARScene,
	ViroARSceneNavigator,
	ViroClickStateTypes,
	ViroMaterials,
	ViroQuad,
} from "@reactvision/react-viro";
import FloatingBackButton from "@/components/Shared/FloatingBackButton";
import { Viro3DPoint } from "@reactvision/react-viro/dist/components/Types/ViroUtils";
import { Text } from "tamagui";

const MODEL_SOURCES: Record<string, any> = {
	"ps5.glb": require("../../assets/products/ps5.glb"),
	"chair.glb": require("../../assets/products/chair.glb"),
};

ViroMaterials.createMaterials({
	QuadMaterial: {
		lightingModel: "Constant",
		diffuseColor: "#888",
	},
});

function Scene({ source }: { source: any }) {
	const [position, setPosition] = useState<Viro3DPoint | null>(null);

	return (
		<ViroARScene>
			<ViroAmbientLight color="white" />
			<ViroARPlane dragType="FixedToWorld">
				<Viro3DObject
					visible={!!position}
					source={source}
					position={position ?? [0, 0, 0]}
					scale={[1, 1, 1]}
					type="GLB"
					dragType="FixedToWorld"
					onDrag={() => {}}
				/>
				<ViroQuad
					visible={!position}
					position={[0, 0, 0]}
					width={1}
					height={1}
					rotation={[-90, 0, 0]}
					materials="QuadMaterial"
					onClickState={(state, position) => {
						if (state === ViroClickStateTypes.CLICKED) {
							setPosition(position);
						}
					}}
				/>
			</ViroARPlane>
		</ViroARScene>
	);
}

export default function ProductARScreen() {
	const { modelUrl } = useLocalSearchParams<{ modelUrl?: string }>();

	const modelSource = modelUrl ? MODEL_SOURCES[modelUrl] : null;

	return (
		<>
			<FloatingBackButton onPress={router.back} />
			{modelSource ? (
				<ViroARSceneNavigator
					initialScene={{ scene: () => <Scene source={modelSource} /> }}
				/>
			) : (
				<Text>No model available for AR view</Text>
			)}
		</>
	);
}
