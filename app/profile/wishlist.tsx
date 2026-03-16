import React, { useCallback, useState } from "react";
import { Pressable, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { ScrollView, Text, XStack, YStack, Image } from "tamagui";
import Icon from "@expo/vector-icons/Ionicons";
import { getWishlist, removeWishlistItem, WishlistItem } from "@/utils/customerProfile";

const COLORS = {
  primary: "#d97706",
  bg: "#fdfbf7",
  surface: "#ffffff",
  border: "#e2e8f0",
  text: "#0f172a",
  muted: "#64748b",
};

export default function WishlistScreen() {
  const [items, setItems] = useState<WishlistItem[]>([]);

  const load = useCallback(async () => {
    setItems(await getWishlist());
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const remove = async (id: string) => {
    await removeWishlistItem(id);
    await load();
  };

  return (
    <YStack f={1} bg={COLORS.bg} p={16} gap={12}>
      <Pressable onPress={() => router.back()} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Icon name="arrow-back" size={20} color={COLORS.text} />
        <Text fow="700" color={COLORS.text}>Wishlist</Text>
      </Pressable>

      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack gap={8} pb={20}>
          {items.map((item) => (
            <View key={item.productId} style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, backgroundColor: COLORS.surface, padding: 10 }}>
              <XStack gap={10} ai="center">
                <Image
                  src={item.imageUrl ?? "https://via.placeholder.com/100"}
                  w={56}
                  h={56}
                  br={8}
                />
                <YStack f={1}>
                  <Text fow="700" color={COLORS.text} numberOfLines={1}>{item.name}</Text>
                  <Text color={COLORS.muted}>INR {item.currentPrice.toFixed(2)}</Text>
                </YStack>
                <Pressable onPress={() => remove(item.productId)}>
                  <Text color="#ef4444" fow="700">Remove</Text>
                </Pressable>
              </XStack>
            </View>
          ))}
          {items.length === 0 ? <Text color={COLORS.muted}>Your wishlist is empty.</Text> : null}
        </YStack>
      </ScrollView>
    </YStack>
  );
}
