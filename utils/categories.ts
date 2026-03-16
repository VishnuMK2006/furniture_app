import { Category } from "@/types/category";
import { endpoints } from "@/utils/api";

export async function getAllCategories(): Promise<Category[]> {
  try {
    const response = await fetch(endpoints.categories);
    if (!response.ok) return [];
    return (await response.json()) as Category[];
  } catch (error) {
    console.error("Failed to fetch categories", { error, url: endpoints.categories });
    return [];
  }
}

export async function createCategory(name: string, token: string): Promise<{ ok: boolean; message?: string }> {
  try {
    const response = await fetch(endpoints.categories, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return { ok: false, message: data.message || "Failed to create category" };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, message: "Could not connect to server" };
  }
}

export async function updateCategory(
  categoryId: string,
  name: string,
  token: string
): Promise<{ ok: boolean; message?: string }> {
  try {
    const response = await fetch(`${endpoints.categories}${categoryId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return { ok: false, message: data.message || "Failed to update category" };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, message: "Could not connect to server" };
  }
}

export async function deleteCategory(
  categoryId: string,
  token: string
): Promise<{ ok: boolean; message?: string }> {
  try {
    const response = await fetch(`${endpoints.categories}${categoryId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return { ok: false, message: data.message || "Failed to delete category" };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, message: "Could not connect to server" };
  }
}
