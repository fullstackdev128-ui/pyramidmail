import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DisplayDensity = "compact" | "normal" | "comfortable";
export type Theme = "light" | "dark" | "system";

interface SettingsState {
  general: {
    language: string;
    timezone: string;
    density: DisplayDensity;
    defaultReply: "reply" | "replyAll";
  };
  appearance: {
    theme: Theme;
    accentColor: string;
  };
  signature: {
    enabled: boolean;
    content: string;
  };
  notifications: {
    desktop: boolean;
    sound: boolean;
    importantOnly: boolean;
  };
  vacation: {
    enabled: boolean;
    subject: string;
    message: string;
    startDate: string;
    endDate: string;
  };
  updateGeneral: (update: Partial<SettingsState["general"]>) => void;
  updateAppearance: (update: Partial<SettingsState["appearance"]>) => void;
  updateSignature: (update: Partial<SettingsState["signature"]>) => void;
  updateNotifications: (update: Partial<SettingsState["notifications"]>) => void;
  updateVacation: (update: Partial<SettingsState["vacation"]>) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      general: {
        language: "fr",
        timezone: "Africa/Douala",
        density: "normal",
        defaultReply: "reply",
      },
      appearance: {
        theme: "light",
        accentColor: "#0087CA",
      },
      signature: {
        enabled: false,
        content: "",
      },
      notifications: {
        desktop: true,
        sound: true,
        importantOnly: false,
      },
      vacation: {
        enabled: false,
        subject: "",
        message: "",
        startDate: "",
        endDate: "",
      },
      updateGeneral: (update) => set((state) => ({ general: { ...state.general, ...update } })),
      updateAppearance: (update) =>
        set((state) => ({ appearance: { ...state.appearance, ...update } })),
      updateSignature: (update) =>
        set((state) => ({ signature: { ...state.signature, ...update } })),
      updateNotifications: (update) =>
        set((state) => ({ notifications: { ...state.notifications, ...update } })),
      updateVacation: (update) => set((state) => ({ vacation: { ...state.vacation, ...update } })),
    }),
    {
      name: "pyramid-settings",
    }
  )
);
