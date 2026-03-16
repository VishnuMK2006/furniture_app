import React, { useEffect, useState } from "react";
import { Alert, Pressable, TextInput, View } from "react-native";
import { router } from "expo-router";
import { Text, YStack } from "tamagui";
import Icon from "@expo/vector-icons/Ionicons";
import { getPersonalInfo, savePersonalInfo } from "@/utils/customerProfile";

const COLORS = {
  primary: "#d97706",
  bg: "#fdfbf7",
  surface: "#ffffff",
  border: "#e2e8f0",
  text: "#0f172a",
  muted: "#64748b",
};

export default function PersonalInformationScreen() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const info = await getPersonalInfo();
      setFullName(info.fullName);
      setPhone(info.phone);
      setDateOfBirth(info.dateOfBirth);
      setGender(info.gender);
    })();
  }, []);

  const onSave = async () => {
    setIsSaving(true);
    await savePersonalInfo({ fullName, phone, dateOfBirth, gender });
    setIsSaving(false);
    Alert.alert("Saved", "Your personal information has been updated.");
  };

  const input = {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    height: 46,
    color: COLORS.text,
  } as const;

  return (
    <YStack f={1} bg={COLORS.bg} p={16} gap={14}>
      <Pressable onPress={() => router.back()} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Icon name="arrow-back" size={20} color={COLORS.text} />
        <Text fow="700" color={COLORS.text}>Personal Information</Text>
      </Pressable>

      <View>
        <Text color={COLORS.muted} mb={6}>Full Name</Text>
        <TextInput value={fullName} onChangeText={setFullName} style={input} placeholder="Enter full name" />
      </View>

      <View>
        <Text color={COLORS.muted} mb={6}>Phone Number</Text>
        <TextInput value={phone} onChangeText={setPhone} style={input} placeholder="Enter phone" keyboardType="phone-pad" />
      </View>

      <View>
        <Text color={COLORS.muted} mb={6}>Date of Birth</Text>
        <TextInput value={dateOfBirth} onChangeText={setDateOfBirth} style={input} placeholder="YYYY-MM-DD" />
      </View>

      <View>
        <Text color={COLORS.muted} mb={6}>Gender</Text>
        <TextInput value={gender} onChangeText={setGender} style={input} placeholder="Male/Female/Other" />
      </View>

      <Pressable
        onPress={onSave}
        disabled={isSaving}
        style={{ backgroundColor: COLORS.primary, height: 46, borderRadius: 10, alignItems: "center", justifyContent: "center", marginTop: 6, opacity: isSaving ? 0.7 : 1 }}
      >
        <Text color="white" fow="700">{isSaving ? "Saving..." : "Save"}</Text>
      </Pressable>
    </YStack>
  );
}
