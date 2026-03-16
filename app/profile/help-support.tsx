import React, { useEffect, useState } from "react";
import { Alert, Pressable, TextInput, View } from "react-native";
import { router } from "expo-router";
import { ScrollView, Text, YStack } from "tamagui";
import Icon from "@expo/vector-icons/Ionicons";
import { SupportTicket, getSupportTickets, makeId, saveSupportTickets } from "@/utils/customerProfile";

const COLORS = {
  primary: "#d97706",
  bg: "#fdfbf7",
  surface: "#ffffff",
  border: "#e2e8f0",
  text: "#0f172a",
  muted: "#64748b",
};

export default function HelpSupportScreen() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    (async () => setTickets(await getSupportTickets()))();
  }, []);

  const persist = async (next: SupportTicket[]) => {
    setTickets(next);
    await saveSupportTickets(next);
  };

  const submit = async () => {
    if (!subject || !message) {
      Alert.alert("Missing Fields", "Please enter both subject and message.");
      return;
    }

    const next: SupportTicket[] = [
      {
        id: makeId("ticket"),
        subject,
        message,
        createdAt: new Date().toISOString(),
        status: "Open",
      },
      ...tickets,
    ];

    await persist(next);
    setSubject("");
    setMessage("");
    Alert.alert("Submitted", "Support request has been created.");
  };

  return (
    <YStack f={1} bg={COLORS.bg} p={16} gap={12}>
      <Pressable onPress={() => router.back()} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Icon name="arrow-back" size={20} color={COLORS.text} />
        <Text fow="700" color={COLORS.text}>Help and Support</Text>
      </Pressable>

      <YStack gap={8}>
        <TextInput
          value={subject}
          onChangeText={setSubject}
          placeholder="Subject"
          style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, backgroundColor: COLORS.surface, paddingHorizontal: 12, height: 44, color: COLORS.text }}
        />
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Describe your issue"
          multiline
          style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, backgroundColor: COLORS.surface, paddingHorizontal: 12, paddingVertical: 10, minHeight: 88, color: COLORS.text, textAlignVertical: "top" }}
        />
        <Pressable onPress={submit} style={{ backgroundColor: COLORS.primary, height: 44, borderRadius: 10, alignItems: "center", justifyContent: "center" }}>
          <Text color="white" fow="700">Submit Ticket</Text>
        </Pressable>
      </YStack>

      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack gap={8} pb={20}>
          <View style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, backgroundColor: COLORS.surface, padding: 12 }}>
            <Text color={COLORS.text} fow="700">Contact Support</Text>
            <Text color={COLORS.muted} mt={4}>Email: support@kishore.com</Text>
            <Text color={COLORS.muted}>Phone: +91 90000 00000</Text>
          </View>

          {tickets.map((item) => (
            <View key={item.id} style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, backgroundColor: COLORS.surface, padding: 12 }}>
              <Text color={COLORS.text} fow="700">{item.subject}</Text>
              <Text color={COLORS.muted} mt={4}>{item.message}</Text>
              <Text color={COLORS.primary} mt={8} fow="700">{item.status}</Text>
            </View>
          ))}
          {tickets.length === 0 ? <Text color={COLORS.muted}>No support tickets yet.</Text> : null}
        </YStack>
      </ScrollView>
    </YStack>
  );
}
