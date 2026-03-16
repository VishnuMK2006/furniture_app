import React, { useEffect, useState } from "react";
import { Alert, Pressable, TextInput, View } from "react-native";
import { router } from "expo-router";
import { ScrollView, Text, XStack, YStack } from "tamagui";
import Icon from "@expo/vector-icons/Ionicons";
import { ReturnRequest, getReturnRequests, makeId, saveReturnRequests } from "@/utils/customerProfile";

const COLORS = {
  primary: "#d97706",
  bg: "#fdfbf7",
  surface: "#ffffff",
  border: "#e2e8f0",
  text: "#0f172a",
  muted: "#64748b",
};

export default function ReturnsScreen() {
  const [requests, setRequests] = useState<ReturnRequest[]>([]);
  const [orderId, setOrderId] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    (async () => setRequests(await getReturnRequests()))();
  }, []);

  const persist = async (next: ReturnRequest[]) => {
    setRequests(next);
    await saveReturnRequests(next);
  };

  const submit = async () => {
    if (!orderId || !reason) {
      Alert.alert("Missing Fields", "Please provide order id and reason.");
      return;
    }

    const next = [
      {
        id: makeId("ret"),
        orderId,
        reason,
        createdAt: new Date().toISOString(),
        status: "Requested" as const,
      },
      ...requests,
    ];

    await persist(next);
    setOrderId("");
    setReason("");
    Alert.alert("Submitted", "Return request created successfully.");
  };

  return (
    <YStack f={1} bg={COLORS.bg} p={16} gap={12}>
      <Pressable onPress={() => router.back()} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Icon name="arrow-back" size={20} color={COLORS.text} />
        <Text fow="700" color={COLORS.text}>Returns and Refunds</Text>
      </Pressable>

      <YStack gap={8}>
        <TextInput
          value={orderId}
          onChangeText={setOrderId}
          placeholder="Order ID"
          style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, backgroundColor: COLORS.surface, paddingHorizontal: 12, height: 44, color: COLORS.text }}
        />
        <TextInput
          value={reason}
          onChangeText={setReason}
          placeholder="Reason for return"
          multiline
          style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, backgroundColor: COLORS.surface, paddingHorizontal: 12, paddingVertical: 10, minHeight: 80, color: COLORS.text, textAlignVertical: "top" }}
        />
        <Pressable onPress={submit} style={{ backgroundColor: COLORS.primary, height: 44, borderRadius: 10, alignItems: "center", justifyContent: "center" }}>
          <Text color="white" fow="700">Request Return</Text>
        </Pressable>
      </YStack>

      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack gap={8} pb={20}>
          {requests.map((item) => (
            <View key={item.id} style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, backgroundColor: COLORS.surface, padding: 12 }}>
              <XStack jc="space-between" ai="center">
                <Text fow="700" color={COLORS.text}>Order #{item.orderId}</Text>
                <Text color={COLORS.primary} fow="700">{item.status}</Text>
              </XStack>
              <Text color={COLORS.muted} mt={4}>{item.reason}</Text>
              <Text color={COLORS.muted} fos={12} mt={6}>{new Date(item.createdAt).toLocaleString()}</Text>
            </View>
          ))}
          {requests.length === 0 ? <Text color={COLORS.muted}>No return requests yet.</Text> : null}
        </YStack>
      </ScrollView>
    </YStack>
  );
}
