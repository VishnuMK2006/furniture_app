import React, { useEffect, useState } from "react";
import { Alert, Pressable, TextInput, View } from "react-native";
import { router } from "expo-router";
import { ScrollView, Text, XStack, YStack } from "tamagui";
import Icon from "@expo/vector-icons/Ionicons";
import { PaymentMethod, getPaymentMethods, makeId, savePaymentMethods } from "@/utils/customerProfile";

const COLORS = {
  primary: "#d97706",
  bg: "#fdfbf7",
  surface: "#ffffff",
  border: "#e2e8f0",
  text: "#0f172a",
  muted: "#64748b",
};

function maskCard(card: string) {
  const clean = card.replace(/\s+/g, "");
  if (clean.length < 4) return "****";
  return `**** **** **** ${clean.slice(-4)}`;
}

export default function PaymentMethodsScreen() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [holder, setHolder] = useState("");
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");

  useEffect(() => {
    (async () => setMethods(await getPaymentMethods()))();
  }, []);

  const persist = async (next: PaymentMethod[]) => {
    setMethods(next);
    await savePaymentMethods(next);
  };

  const add = async () => {
    if (!holder || !card || !expiry) {
      Alert.alert("Missing Fields", "Please enter card holder, card number and expiry.");
      return;
    }

    const next: PaymentMethod[] = [
      {
        id: makeId("card"),
        cardHolder: holder,
        cardNumberMasked: maskCard(card),
        expiry,
        brand: card.startsWith("4") ? "VISA" : "CARD",
        isDefault: methods.length === 0,
      },
      ...methods,
    ];

    await persist(next);
    setHolder("");
    setCard("");
    setExpiry("");
  };

  const setDefault = async (id: string) => {
    await persist(methods.map((m) => ({ ...m, isDefault: m.id === id })));
  };

  const remove = async (id: string) => {
    const filtered = methods.filter((m) => m.id !== id);
    if (filtered.length > 0 && !filtered.some((m) => m.isDefault)) {
      filtered[0].isDefault = true;
    }
    await persist(filtered);
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
        <Text fow="700" color={COLORS.text}>Payment Methods</Text>
      </Pressable>

      <YStack gap={8}>
        <TextInput value={holder} onChangeText={setHolder} style={input} placeholder="Card holder name" />
        <TextInput value={card} onChangeText={setCard} style={input} placeholder="Card number" keyboardType="number-pad" />
        <TextInput value={expiry} onChangeText={setExpiry} style={input} placeholder="MM/YY" />
        <Pressable onPress={add} style={{ backgroundColor: COLORS.primary, height: 44, borderRadius: 10, alignItems: "center", justifyContent: "center" }}>
          <Text color="white" fow="700">Add Card</Text>
        </Pressable>
      </YStack>

      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack gap={8} pb={20}>
          {methods.map((item) => (
            <View key={item.id} style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, backgroundColor: COLORS.surface, padding: 12 }}>
              <Text fow="700" color={COLORS.text}>{item.brand} • {item.cardNumberMasked}</Text>
              <Text color={COLORS.muted}>{item.cardHolder} • Exp {item.expiry}</Text>
              <XStack gap={16} mt={8}>
                <Pressable onPress={() => setDefault(item.id)}>
                  <Text color={item.isDefault ? COLORS.primary : COLORS.muted} fow="700">{item.isDefault ? "Default" : "Set Default"}</Text>
                </Pressable>
                <Pressable onPress={() => remove(item.id)}>
                  <Text color="#ef4444" fow="700">Remove</Text>
                </Pressable>
              </XStack>
            </View>
          ))}
          {methods.length === 0 ? <Text color={COLORS.muted}>No payment methods saved yet.</Text> : null}
        </YStack>
      </ScrollView>
    </YStack>
  );
}
