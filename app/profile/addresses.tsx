import React, { useEffect, useState } from "react";
import { Alert, Pressable, TextInput, View } from "react-native";
import { router } from "expo-router";
import { ScrollView, Text, XStack, YStack } from "tamagui";
import Icon from "@expo/vector-icons/Ionicons";
import { SavedAddress, getAddresses, makeId, saveAddresses } from "@/utils/customerProfile";

const COLORS = {
  primary: "#d97706",
  bg: "#fdfbf7",
  surface: "#ffffff",
  border: "#e2e8f0",
  text: "#0f172a",
  muted: "#64748b",
};

export default function SavedAddressesScreen() {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [label, setLabel] = useState("Home");
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");

  useEffect(() => {
    (async () => setAddresses(await getAddresses()))();
  }, []);

  const persist = async (next: SavedAddress[]) => {
    setAddresses(next);
    await saveAddresses(next);
  };

  const onAdd = async () => {
    if (!line1 || !city || !state || !postalCode) {
      Alert.alert("Missing Fields", "Please fill mandatory address fields.");
      return;
    }

    const next: SavedAddress[] = [
      {
        id: makeId("addr"),
        label,
        line1,
        city,
        state,
        postalCode,
        country: "India",
      },
      ...addresses,
    ];

    await persist(next);
    setLine1("");
    setCity("");
    setState("");
    setPostalCode("");
  };

  const remove = async (id: string) => {
    await persist(addresses.filter((item) => item.id !== id));
  };

  const input = {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    height: 44,
    color: COLORS.text,
  } as const;

  return (
    <YStack f={1} bg={COLORS.bg} p={16} gap={12}>
      <Pressable onPress={() => router.back()} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Icon name="arrow-back" size={20} color={COLORS.text} />
        <Text fow="700" color={COLORS.text}>Saved Addresses</Text>
      </Pressable>

      <YStack gap={8}>
        <TextInput value={label} onChangeText={setLabel} style={input} placeholder="Label (Home/Work)" />
        <TextInput value={line1} onChangeText={setLine1} style={input} placeholder="Address line 1" />
        <XStack gap={8}>
          <TextInput value={city} onChangeText={setCity} style={[input, { flex: 1 }]} placeholder="City" />
          <TextInput value={state} onChangeText={setState} style={[input, { flex: 1 }]} placeholder="State" />
        </XStack>
        <TextInput value={postalCode} onChangeText={setPostalCode} style={input} placeholder="Postal code" keyboardType="number-pad" />
        <Pressable onPress={onAdd} style={{ backgroundColor: COLORS.primary, height: 44, borderRadius: 10, alignItems: "center", justifyContent: "center" }}>
          <Text color="white" fow="700">Add Address</Text>
        </Pressable>
      </YStack>

      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack gap={8} pb={20}>
          {addresses.map((item) => (
            <View key={item.id} style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, backgroundColor: COLORS.surface, padding: 12 }}>
              <XStack jc="space-between" ai="center">
                <Text fow="700" color={COLORS.text}>{item.label}</Text>
                <Pressable onPress={() => remove(item.id)}>
                  <Text color="#ef4444" fow="700">Remove</Text>
                </Pressable>
              </XStack>
              <Text color={COLORS.muted}>{item.line1}</Text>
              <Text color={COLORS.muted}>{item.city}, {item.state} {item.postalCode}</Text>
            </View>
          ))}
          {addresses.length === 0 ? <Text color={COLORS.muted}>No saved addresses yet.</Text> : null}
        </YStack>
      </ScrollView>
    </YStack>
  );
}
