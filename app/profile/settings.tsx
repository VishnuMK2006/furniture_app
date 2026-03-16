import React, { useEffect, useState } from "react";
import { Pressable } from "react-native";
import { router } from "expo-router";
import { Text, XStack, YStack } from "tamagui";
import Icon from "@expo/vector-icons/Ionicons";
import { AppSettings, getAppSettings, saveAppSettings } from "@/utils/customerProfile";

const COLORS = {
  primary: "#d97706",
  bg: "#fdfbf7",
  surface: "#ffffff",
  border: "#e2e8f0",
  text: "#0f172a",
  muted: "#64748b",
};

export default function SettingsScreen() {
  const [settings, setSettings] = useState<AppSettings>({
    biometricLogin: false,
    darkMode: false,
    language: "English",
  });

  useEffect(() => {
    (async () => setSettings(await getAppSettings()))();
  }, []);

  const update = async (next: AppSettings) => {
    setSettings(next);
    await saveAppSettings(next);
  };

  return (
    <YStack f={1} bg={COLORS.bg} p={16} gap={12}>
      <Pressable onPress={() => router.back()} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Icon name="arrow-back" size={20} color={COLORS.text} />
        <Text fow="700" color={COLORS.text}>Settings</Text>
      </Pressable>

      <Pressable
        onPress={() => update({ ...settings, biometricLogin: !settings.biometricLogin })}
        style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, backgroundColor: COLORS.surface, padding: 12 }}
      >
        <XStack jc="space-between" ai="center">
          <Text color={COLORS.text} fow="700">Biometric Login</Text>
          <Text color={settings.biometricLogin ? COLORS.primary : COLORS.muted} fow="700">{settings.biometricLogin ? "ON" : "OFF"}</Text>
        </XStack>
      </Pressable>

      <Pressable
        onPress={() => update({ ...settings, darkMode: !settings.darkMode })}
        style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, backgroundColor: COLORS.surface, padding: 12 }}
      >
        <XStack jc="space-between" ai="center">
          <Text color={COLORS.text} fow="700">Dark Mode</Text>
          <Text color={settings.darkMode ? COLORS.primary : COLORS.muted} fow="700">{settings.darkMode ? "ON" : "OFF"}</Text>
        </XStack>
      </Pressable>

      <YStack gap={8}>
        <Text color={COLORS.muted}>Language</Text>
        <XStack gap={8}>
          {(["English", "Tamil", "Hindi"] as const).map((lang) => {
            const active = settings.language === lang;
            return (
              <Pressable
                key={lang}
                onPress={() => update({ ...settings, language: lang })}
                style={{
                  borderWidth: 1,
                  borderColor: active ? COLORS.primary : COLORS.border,
                  backgroundColor: active ? "#fff7ed" : COLORS.surface,
                  borderRadius: 999,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                }}
              >
                <Text color={active ? COLORS.primary : COLORS.text} fow={active ? "700" : "500"}>{lang}</Text>
              </Pressable>
            );
          })}
        </XStack>
      </YStack>
    </YStack>
  );
}
