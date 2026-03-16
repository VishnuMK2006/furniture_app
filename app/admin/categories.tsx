import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, TextInput, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Text, XStack, YStack } from "tamagui";
import Icon from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthProvider";
import { Category } from "@/types/category";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  updateCategory,
} from "@/utils/categories";

const COLORS = {
  primary: "#d97706",
  textDark: "#0f172a",
  textLight: "#64748b",
  background: "#fdfbf7",
  surface: "#ffffff",
  border: "#e2e8f0",
  danger: "#ef4444",
};

export default function CategoryManagementScreen() {
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const isAdmin = session?.user?.role === "admin";

  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  const token = session?.token || "";

  const loadCategories = useCallback(async () => {
    const data = await getAllCategories();
    setCategories(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [loadCategories])
  );

  useEffect(() => {
    if (!isAdmin) {
      router.replace("/(tabs)");
    }
  }, [isAdmin]);

  const canCreate = useMemo(() => newName.trim().length > 0, [newName]);

  const onCreateCategory = async () => {
    if (!canCreate) return;
    if (!token) {
      Alert.alert("Session Expired", "Please login again to continue.");
      router.replace("/login");
      return;
    }
    setIsBusy(true);
    const result = await createCategory(newName.trim(), token);
    setIsBusy(false);

    if (!result.ok) {
      Alert.alert("Create Failed", result.message || "Could not create category");
      return;
    }

    setNewName("");
    await loadCategories();
  };

  const onStartEdit = (category: Category) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const onCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const onSaveEdit = async () => {
    if (!editingId || !editingName.trim()) return;
    if (!token) {
      Alert.alert("Session Expired", "Please login again to continue.");
      router.replace("/login");
      return;
    }
    setIsBusy(true);
    const result = await updateCategory(editingId, editingName.trim(), token);
    setIsBusy(false);

    if (!result.ok) {
      Alert.alert("Update Failed", result.message || "Could not update category");
      return;
    }

    onCancelEdit();
    await loadCategories();
  };

  const onDeleteCategory = (category: Category) => {
    if (!token) {
      Alert.alert("Session Expired", "Please login again to continue.");
      router.replace("/login");
      return;
    }

    Alert.alert(
      "Delete Category",
      `Delete \"${category.name}\"? This only works if no products currently use it.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsBusy(true);
            const result = await deleteCategory(category.id, token);
            setIsBusy(false);

            if (!result.ok) {
              Alert.alert("Delete Failed", result.message || "Could not delete category");
              return;
            }

            await loadCategories();
          },
        },
      ]
    );
  };

  if (!isAdmin) return null;

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
          <Text fos={20} fow="800" color={COLORS.textDark}>Category Management</Text>
          <Text fos={12} color={COLORS.textLight}>Create, edit, and delete categories</Text>
        </YStack>
      </XStack>

      <YStack p={16} gap={12}>
        <Text fos={14} fow="700" color={COLORS.textDark}>Add New Category</Text>
        <XStack gap={8}>
          <View
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: COLORS.border,
              backgroundColor: COLORS.surface,
              borderRadius: 8,
              paddingHorizontal: 12,
              justifyContent: "center",
              height: 46,
            }}
          >
            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="e.g. Living Room"
              editable={!isBusy}
            />
          </View>
          <Pressable
            onPress={onCreateCategory}
            disabled={!canCreate || isBusy}
            style={{
              height: 46,
              paddingHorizontal: 14,
              borderRadius: 8,
              backgroundColor: !canCreate || isBusy ? "#f3f4f6" : COLORS.primary,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text fow="700" color={!canCreate || isBusy ? COLORS.textLight : "white"}>Add</Text>
          </Pressable>
        </XStack>
      </YStack>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        ListEmptyComponent={
          <YStack ai="center" py={30}>
            <Text color={COLORS.textLight}>No categories available.</Text>
          </YStack>
        }
        renderItem={({ item }) => {
          const isEditing = editingId === item.id;
          return (
            <YStack
              bg={COLORS.surface}
              bw={1}
              bc={COLORS.border}
              br={10}
              p={12}
              mb={10}
              gap={10}
            >
              {isEditing ? (
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: COLORS.border,
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    height: 42,
                    justifyContent: "center",
                  }}
                >
                  <TextInput
                    value={editingName}
                    onChangeText={setEditingName}
                    editable={!isBusy}
                    autoFocus
                  />
                </View>
              ) : (
                <Text fos={16} fow="700" color={COLORS.textDark}>{item.name}</Text>
              )}

              <XStack gap={8}>
                {isEditing ? (
                  <>
                    <Pressable
                      onPress={onSaveEdit}
                      disabled={isBusy || !editingName.trim()}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        backgroundColor:
                          isBusy || !editingName.trim() ? "#f3f4f6" : COLORS.primary,
                      }}
                    >
                      <Text fow="700" color={isBusy || !editingName.trim() ? COLORS.textLight : "white"}>Save</Text>
                    </Pressable>
                    <Pressable
                      onPress={onCancelEdit}
                      disabled={isBusy}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: COLORS.border,
                      }}
                    >
                      <Text fow="700" color={COLORS.textLight}>Cancel</Text>
                    </Pressable>
                  </>
                ) : (
                  <>
                    <Pressable
                      onPress={() => onStartEdit(item)}
                      disabled={isBusy}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: COLORS.border,
                      }}
                    >
                      <Text fow="700" color={COLORS.textDark}>Edit</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => onDeleteCategory(item)}
                      disabled={isBusy}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: "#fecaca",
                        backgroundColor: "#fef2f2",
                      }}
                    >
                      <Text fow="700" color={COLORS.danger}>Delete</Text>
                    </Pressable>
                  </>
                )}
              </XStack>
            </YStack>
          );
        }}
      />
    </YStack>
  );
}
