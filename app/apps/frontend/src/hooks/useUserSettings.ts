import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/user.service";
import { AUTH_QUERY_KEY, type AuthUser } from "@/hooks/useAuth";

// ── Types ──────────────────────────────────────────────────────────
export type UserProfile = {
  id: string;
  email: string;
  displayName: string | null;
  phone: string | null;
  city: string | null;
  bio: string | null;
  avatar: string | null;
  isVerified: boolean;
  createdAt: string;
};

export type UserSettingsData = {
  id: string;
  userId: string;
  language: string;
  timezone: string;
  density: string;
  defaultReply: string;
  theme: string;
  accentColor: string;
  signatureEnabled: boolean;
  signatureContent: string;
  notifDesktop: boolean;
  notifSound: boolean;
  notifImportantOnly: boolean;
  vacationEnabled: boolean;
  vacationSubject: string;
  vacationMessage: string;
  vacationStart: string | null;
  vacationEnd: string | null;
  filters: any;
  blockedAddresses: any;
  twoFactorEnabled: boolean;
};

// ── Query keys ─────────────────────────────────────────────────────
export const userKeys = {
  profile: ["user", "profile"] as const,
  settings: ["user", "settings"] as const,
};

// ── Hook: get profile ──────────────────────────────────────────────
export function useProfile() {
  return useQuery<UserProfile>({
    queryKey: userKeys.profile,
    queryFn: async () => {
      const res = await userService.getProfile();
      return res.data;
    },
  });
}

// ── Hook: update profile ───────────────────────────────────────────
export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      data: Partial<Pick<UserProfile, "displayName" | "phone" | "city" | "bio" | "avatar">>
    ) => {
      const res = await userService.updateProfile(data);
      return res.data;
    },
    onSuccess: (updatedProfile) => {
      qc.setQueryData(userKeys.profile, updatedProfile);
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

// ── Hook: get settings ─────────────────────────────────────────────
export function useUserSettings() {
  return useQuery<UserSettingsData>({
    queryKey: userKeys.settings,
    queryFn: async () => {
      const res = await userService.getSettings();
      return res.data;
    },
  });
}

// ── Hook: update settings ──────────────────────────────────────────
export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<UserSettingsData>) => {
      const res = await userService.updateSettings(data);
      return res.data;
    },
    onSuccess: (updatedSettings) => {
      qc.setQueryData(userKeys.settings, updatedSettings);
    },
  });
}

// ── Hook: upload avatar ────────────────────────────────────────────
export function useUploadAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const res = await userService.uploadAvatar(file);
      return res.data;
    },
    onSuccess: (updatedProfile) => {
      qc.setQueryData(userKeys.profile, updatedProfile);
      qc.setQueryData<AuthUser | null>(AUTH_QUERY_KEY, (prev) =>
        prev ? { ...prev, avatar: updatedProfile.avatar } : prev
      );
      qc.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    },
  });
}
