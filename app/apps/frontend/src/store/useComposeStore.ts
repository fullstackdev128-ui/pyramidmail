import { create } from "zustand";

interface Draft {
  id?: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  attachments: File[];
}

interface ComposeState {
  isOpen: boolean;
  isMinimized: boolean;
  isFullscreen: boolean;
  draft: Draft;
  open: (initialDraft?: Partial<Draft>) => void;
  openWithDraft: (draft: any) => void;
  close: () => void;
  minimize: () => void;
  restore: () => void;
  toggleFullscreen: () => void;
  updateDraft: (update: Partial<Draft>) => void;
  addAttachments: (files: File[]) => void;
  removeAttachment: (index: number) => void;
  resetDraft: () => void;
}

export const useComposeStore = create<ComposeState>((set) => ({
  isOpen: false,
  isMinimized: false,
  isFullscreen: false,
  draft: { to: [], cc: [], bcc: [], subject: "", body: "", attachments: [] },
  open: (initialDraft) =>
    set((state) => ({
      isOpen: true,
      isMinimized: false,
      draft: { to: [], cc: [], bcc: [], subject: "", body: "", attachments: [], ...initialDraft },
    })),
  openWithDraft: (backendDraft) => {
    // backendDraft structure from ThreadSummary/Detail or custom
    const lastEmail = backendDraft.emails?.[backendDraft.emails.length - 1];
    set({
      isOpen: true,
      isMinimized: false,
      draft: {
        id: backendDraft.id,
        to: lastEmail?.to || [],
        subject: backendDraft.subject || "",
        body: lastEmail?.bodyHtml || lastEmail?.bodyText || "",
        attachments: [], // Cannot recover Files from backend easily here
      },
    });
  },
  close: () =>
    set({
      isOpen: false,
      isMinimized: false,
      isFullscreen: false,
      draft: { to: [], cc: [], bcc: [], subject: "", body: "", attachments: [] },
    }),
  minimize: () => set({ isMinimized: true, isFullscreen: false }),
  restore: () => set({ isMinimized: false }),
  toggleFullscreen: () =>
    set((state) => ({ isFullscreen: !state.isFullscreen, isMinimized: false })),
  updateDraft: (update) => set((state) => ({ draft: { ...state.draft, ...update } })),
  addAttachments: (files) =>
    set((state) => ({
      draft: { ...state.draft, attachments: [...state.draft.attachments, ...files] },
    })),
  removeAttachment: (index) =>
    set((state) => ({
      draft: { ...state.draft, attachments: state.draft.attachments.filter((_, i) => i !== index) },
    })),
  resetDraft: () => set({ draft: { to: [], cc: [], bcc: [], subject: "", body: "", attachments: [] } }),
}));
