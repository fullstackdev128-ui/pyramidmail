export type MockUser = {
  id: string;
  email: string;
  displayName: string;
  phone?: string;
  bio?: string;
  avatar?: string | null;
  createdAt?: string;
  role?: string;
  plan?: "free" | "premium";
};

const STORAGE_KEY = "pm_mock_user";

export function getMockUser(): MockUser | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as MockUser;
  } catch {
    return null;
  }
}

export function setMockUser(user: MockUser) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function clearMockUser() {
  localStorage.removeItem(STORAGE_KEY);
}

export function updateUser(data: Partial<MockUser>) {
  const current = getMockUser();
  if (current) {
    const updated = { ...current, ...data };
    setMockUser(updated);
    return updated;
  }
  return null;
}

export function getUserInitials(name?: string): string {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getUserColor(name?: string): string {
  if (!name) return "bg-slate-200 text-slate-600";
  const colors = [
    "bg-blue-100 text-blue-600",
    "bg-purple-100 text-purple-600",
    "bg-green-100 text-green-600",
    "bg-orange-100 text-orange-600",
    "bg-pink-100 text-pink-600",
    "bg-indigo-100 text-indigo-600",
    "bg-cyan-100 text-cyan-600",
    "bg-teal-100 text-teal-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

export function getUserRole(): string | undefined {
  const user = getMockUser();
  return user?.role;
}

export function getUserPlan(): "free" | "premium" {
  const user = getMockUser();
  return user?.plan ?? "free";
}

export function setPlan(plan: "free" | "premium") {
  const current = getMockUser();
  if (current) {
    const updated = { ...current, plan };
    setMockUser(updated);
    return updated;
  }
  return null;
}

export function isPremium(): boolean {
  return getUserPlan() === "premium";
}
