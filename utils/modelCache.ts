import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";

const CACHE_MAP_KEY = "@model_cache_map";
const MODEL_DIR = `${FileSystem.documentDirectory}models`;

type CacheMap = Record<string, string>;

async function readCacheMap(): Promise<CacheMap> {
  const raw = await AsyncStorage.getItem(CACHE_MAP_KEY);
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as CacheMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function writeCacheMap(map: CacheMap): Promise<void> {
  await AsyncStorage.setItem(CACHE_MAP_KEY, JSON.stringify(map));
}

function sanitizeProductId(productId: string): string {
  return productId.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function guessModelExtension(url: string): string {
  const clean = url.split("?")[0].toLowerCase();
  if (clean.endsWith(".glb")) return "glb";
  return "glb";
}

async function ensureModelDirectory(): Promise<void> {
  const info = await FileSystem.getInfoAsync(MODEL_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(MODEL_DIR, { intermediates: true });
  }
}

export async function getCachedModelPath(productId: string): Promise<string | null> {
  const map = await readCacheMap();
  const path = map[productId];
  if (!path) return null;

  const info = await FileSystem.getInfoAsync(path);
  if (!info.exists) {
    delete map[productId];
    await writeCacheMap(map);
    return null;
  }

  return path;
}

export async function downloadAndCacheModel(options: {
  productId: string;
  modelUrl: string;
  onProgress?: (value: number) => void;
}): Promise<string> {
  const { productId, modelUrl, onProgress } = options;
  await ensureModelDirectory();

  const safeId = sanitizeProductId(productId);
  const ext = guessModelExtension(modelUrl);
  const destination = `${MODEL_DIR}/${safeId}.${ext}`;

  const resumable = FileSystem.createDownloadResumable(
    modelUrl,
    destination,
    {},
    (progress) => {
      const total = progress.totalBytesExpectedToWrite || 0;
      const written = progress.totalBytesWritten || 0;
      const ratio = total > 0 ? written / total : 0;
      onProgress?.(Math.max(0, Math.min(1, ratio)));
    }
  );

  const result = await resumable.downloadAsync();
  if (!result?.uri) {
    throw new Error("Model download failed");
  }

  const map = await readCacheMap();
  map[productId] = result.uri;
  await writeCacheMap(map);

  return result.uri;
}
