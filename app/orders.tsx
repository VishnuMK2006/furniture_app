import React, { useCallback, useState } from "react";
import { FlatList, Pressable, ScrollView, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Text, XStack, YStack } from "tamagui";
import Icon from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthProvider";
import { getMyOrders } from "@/utils/orders";
import { Order, OrderStatus } from "@/types/order";

const COLORS = {
  primary: "#d97706",
  textDark: "#0f172a",
  textLight: "#64748b",
  background: "#fdfbf7",
  surface: "#ffffff",
  border: "#e2e8f0",
};

function formatCurrency(value: number) {
  return `INR ${value.toFixed(2)}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function statusColor(status: OrderStatus) {
  switch (status) {
    case "Pending":
      return "#f59e0b";
    case "Confirmed":
      return "#2563eb";
    case "Shipped":
      return "#0891b2";
    case "Delivered":
      return "#16a34a";
    case "Cancelled":
      return "#ef4444";
    default:
      return COLORS.textLight;
  }
}

export default function MyOrdersScreen() {
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const token = session?.token || "";

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const loadOrders = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    const data = await getMyOrders(token);
    setOrders(data);
    setIsLoading(false);
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      void loadOrders();
    }, [loadOrders])
  );

  if (!session) {
    router.replace("/login");
    return null;
  }

  return (
    <YStack f={1} bg={COLORS.background}>
      <XStack
        px={20}
        pt={insets.top > 0 ? insets.top + 10 : 40}
        pb={15}
        bg={COLORS.surface}
        ai="center"
        gap={12}
        bw={1}
        bc={COLORS.border}
      >
        <Pressable onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color={COLORS.textDark} />
        </Pressable>
        <YStack>
          <Text fos={20} fow="800" color={COLORS.textDark}>My Orders</Text>
          <Text fos={12} color={COLORS.textLight}>Track your placed orders</Text>
        </YStack>
      </XStack>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        onRefresh={loadOrders}
        refreshing={isLoading}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        ListEmptyComponent={
          <YStack ai="center" py={30}>
            <Text color={COLORS.textLight}>No orders yet.</Text>
          </YStack>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setSelectedOrder(item)}
            style={{
              backgroundColor: COLORS.surface,
              borderWidth: 1,
              borderColor: COLORS.border,
              borderRadius: 12,
              padding: 14,
              marginBottom: 10,
            }}
          >
            <XStack jc="space-between" ai="center" mb={8}>
              <Text fow="700" color={COLORS.textDark} numberOfLines={1}>Order #{item.id.slice(-6).toUpperCase()}</Text>
              <Text fow="700" color={statusColor(item.status)}>{item.status}</Text>
            </XStack>
            <Text color={COLORS.textLight} fos={12}>{item.items.length} items • {formatCurrency(item.pricing.total)}</Text>
            <Text color={COLORS.textLight} fos={11} mt={4}>Placed: {formatDate(item.created_at)}</Text>
          </Pressable>
        )}
      />

      {selectedOrder && (
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            maxHeight: "72%",
            backgroundColor: COLORS.surface,
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            borderTopWidth: 1,
            borderColor: COLORS.border,
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: insets.bottom + 14,
          }}
        >
          <XStack jc="space-between" ai="center" mb={10}>
            <Text fos={17} fow="800" color={COLORS.textDark}>Order Details</Text>
            <Pressable onPress={() => setSelectedOrder(null)}>
              <Icon name="close" size={22} color={COLORS.textLight} />
            </Pressable>
          </XStack>

          <ScrollView showsVerticalScrollIndicator={false}>
            <YStack gap={8} mb={12}>
              <Text fow="700" color={COLORS.textDark}>Delivery Address</Text>
              <Text color={COLORS.textLight}>{selectedOrder.deliveryAddress.line1}</Text>
              {selectedOrder.deliveryAddress.line2 ? <Text color={COLORS.textLight}>{selectedOrder.deliveryAddress.line2}</Text> : null}
              <Text color={COLORS.textLight}>
                {selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state} {selectedOrder.deliveryAddress.postalCode}
              </Text>
              <Text color={COLORS.textLight}>{selectedOrder.deliveryAddress.country}</Text>
            </YStack>

            <YStack gap={8} mb={12}>
              <Text fow="700" color={COLORS.textDark}>Items</Text>
              {selectedOrder.items.map((item) => (
                <XStack key={`${selectedOrder.id}-${item.productId}`} jc="space-between" ai="center">
                  <YStack f={1} pr={10}>
                    <Text color={COLORS.textDark} numberOfLines={1}>{item.name}</Text>
                    <Text color={COLORS.textLight} fos={12}>Qty {item.quantity} • {formatCurrency(item.unitPrice)}</Text>
                  </YStack>
                  <Text color={COLORS.textDark} fow="700">{formatCurrency(item.totalPrice)}</Text>
                </XStack>
              ))}
            </YStack>

            <YStack gap={6} mb={14}>
              <XStack jc="space-between"><Text color={COLORS.textLight}>Subtotal</Text><Text color={COLORS.textDark}>{formatCurrency(selectedOrder.pricing.subtotal)}</Text></XStack>
              <XStack jc="space-between"><Text color={COLORS.textLight}>Shipping</Text><Text color={COLORS.textDark}>{formatCurrency(selectedOrder.pricing.shipping)}</Text></XStack>
              <XStack jc="space-between"><Text color={COLORS.textDark} fow="700">Total</Text><Text color={COLORS.textDark} fow="700">{formatCurrency(selectedOrder.pricing.total)}</Text></XStack>
            </YStack>
          </ScrollView>
        </View>
      )}
    </YStack>
  );
}
