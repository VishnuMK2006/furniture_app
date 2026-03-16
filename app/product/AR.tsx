import React, { useEffect, useMemo, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
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
import { downloadAndCacheModel, getCachedModelPath } from "@/utils/modelCache";

ViroMaterials.createMaterials({
	QuadMaterial: {
		lightingModel: "Constant",
		diffuseColor: "#888",
	},
});

function Scene(props: any) {
	const source = props?.sceneNavigator?.viroAppProps?.source;

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
	const { modelUrl, productId } = useLocalSearchParams<{
		modelUrl?: string;
		productId?: string;
	}>();

	const [modelSource, setModelSource] = useState<any>(null);
	const [isPreparing, setIsPreparing] = useState(true);
	const [statusMessage, setStatusMessage] = useState("Preparing AR model...");
	const [downloadProgress, setDownloadProgress] = useState(0);
	const initialScene = useMemo(() => ({ scene: Scene as any }), []);

	useEffect(() => {
		let isMounted = true;

		async function prepareModel() {
			if (!modelUrl || !productId) {
				if (isMounted) {
					setStatusMessage("No model available for AR view");
					setIsPreparing(false);
				}
				return;
			}

			try {
				if (isMounted) {
					setIsPreparing(true);
					setStatusMessage("Checking cached model...");
					setDownloadProgress(0);
				}

				const cachedPath = await getCachedModelPath(String(productId));
				if (cachedPath) {
					if (isMounted) {
						setModelSource({ uri: cachedPath });
						setStatusMessage("Loaded from cache");
					}
					return;
				}

				let lastPercent = -1;
				const localUri = await downloadAndCacheModel({
					productId: String(productId),
					modelUrl: decodeURIComponent(String(modelUrl)),
					onProgress: (value) => {
						if (!isMounted) return;
						const bounded = Math.max(0, Math.min(1, value));
						const percent = Math.round(bounded * 100);
						if (percent !== lastPercent) {
							lastPercent = percent;
							setDownloadProgress(bounded);
							setStatusMessage(`Downloading model... ${percent}%`);
						}
					},
				});

				if (isMounted) {
					setModelSource({ uri: localUri });
					setStatusMessage("Model ready");
				}
			} catch {
				if (isMounted) {
					setStatusMessage("Failed to load model");
				}
			} finally {
				if (isMounted) {
					setIsPreparing(false);
				}
			}
		}

		prepareModel();

		return () => {
			isMounted = false;
		};
	}, [modelUrl, productId]);

	return (
		<>
			<FloatingBackButton onPress={router.back} />
			{modelSource ? (
				<ViroARSceneNavigator initialScene={initialScene} viroAppProps={{ source: modelSource }} />
			) : (
				!isPreparing && <Text>{statusMessage}</Text>
			)}

			{isPreparing && (
				<View
					style={{
						position: "absolute",
						bottom: 96,
						alignSelf: "center",
						backgroundColor: "rgba(255,255,255,0.92)",
						paddingHorizontal: 14,
						paddingVertical: 10,
						borderRadius: 12,
					}}
				>
					<Text>{statusMessage}</Text>
					<Text>{Math.round(downloadProgress * 100)}%</Text>
				</View>
			)}
		</>
	);
}
