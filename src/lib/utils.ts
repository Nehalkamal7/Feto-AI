import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function formatTimestamp(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export function groupSessionsByDate<T extends { createdAt: string }>(
  items: T[]
): { group: string; items: T[] }[] {
  const groups: Record<string, T[]> = {
    Today: [],
    Yesterday: [],
    "Previous 7 Days": [],
    Older: [],
  };

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;
  const sevenDaysStart = todayStart - 86400000 * 7;

  items.forEach((item) => {
    const itemDate = new Date(item.createdAt).getTime();
    if (itemDate >= todayStart) {
      groups.Today.push(item);
    } else if (itemDate >= yesterdayStart) {
      groups.Yesterday.push(item);
    } else if (itemDate >= sevenDaysStart) {
      groups["Previous 7 Days"].push(item);
    } else {
      groups.Older.push(item);
    }
  });

  return Object.entries(groups)
    .filter(([_, list]) => list.length > 0)
    .map(([group, list]) => ({ group, items: list }));
}
