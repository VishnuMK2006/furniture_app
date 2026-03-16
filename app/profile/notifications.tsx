import React, { useEffect, useState } from "react";
import { Pressable } from "react-native";
import { router } from "expo-router";
import { Text, XStack, YStack } from "tamagui";
import Icon from "@expo/vector-icons/Ionicons";
import { NotificationPrefs, getNotificationPrefs, saveNotificationPrefs } from "@/utils/customerProfile";

const COLORS = {
  primary: "#d97706",
  bg: "#fdfbf7",
  surface: "#ffffff",
  border: "#e2e8f0",
  text: "#0f172a",
  muted: "#64748b",
};

export default function NotificationsScreen() {
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    orderUpdates: true,
    promotions: true,
    restockAlerts: true,
    wishlistDrops: true,
  });

  useEffect(() => {
    (async () => setPrefs(await getNotificationPrefs()))();
  }, []);

  const toggle = async (key: keyof NotificationPrefs) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    await saveNotificationPrefs(next);
  };

  const rows: Array<{ key: keyof NotificationPrefs; label: string; desc: string }> = [
    { key: "orderUpdates", label: "Order Updates", desc: "Order placed, shipped and delivered alerts" },
    { key: "promotions", label: "Promotions", desc: "Deals and seasonal campaign notifications" },
    { key: "restockAlerts", label: "Restock Alerts", desc: "Notify when out-of-stock items return" },
    { key: "wishlistDrops", label: "Wishlist Price Drops", desc: "Price drop alerts on wishlist products" },
  ];

  return (
    <YStack f={1} bg={COLORS.bg} p={16} gap={12}>
      <Pressable onPress={() => router.back()} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Icon name="arrow-back" size={20} color={COLORS.text} />
        <Text fow="700" color={COLORS.text}>Notifications</Text>
      </Pressable>

      <YStack gap={8}>
        {rows.map((row) => {
          const enabled = prefs[row.key];
          return (
            <Pressable
              key={row.key}
              onPress={() => toggle(row.key)}
              style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, backgroundColor: COLORS.surface, padding: 12 }}
            >
              <XStack jc="space-between" ai="center">
                <YStack f={1} pr={10}>
                  <Text fow="700" color={COLORS.text}>{row.label}</Text>
                  <Text color={COLORS.muted} fos={12}>{row.desc}</Text>
                </YStack>
                <Text color={enabled ? COLORS.primary : COLORS.muted} fow="700">{enabled ? "ON" : "OFF"}</Text>
              </XStack>
            </Pressable>
          );
        })}
      </YStack>
    </YStack>
  );
}
