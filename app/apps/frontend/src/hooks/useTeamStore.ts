import { create } from "zustand";
import { TeamMember, UserRole, UserStatus, UserPlan } from "../types/team";
import initialMembers from "../mock/team.json";

interface TeamState {
  members: TeamMember[];
  selectedMemberId: string | null;
  searchQuery: string;
  filterRole: UserRole | "all";
  filterStatus: UserStatus | "all";
  filterPlan: UserPlan | "all";
  setSearch: (q: string) => void;
  setFilterRole: (r: UserRole | "all") => void;
  setFilterStatus: (s: UserStatus | "all") => void;
  setFilterPlan: (p: UserPlan | "all") => void;
  selectMember: (id: string | null) => void;
  addMember: (m: Omit<TeamMember, "id">) => void;
  updateMember: (id: string, changes: Partial<TeamMember>) => void;
  deleteMember: (id: string) => void;
  getFiltered: () => TeamMember[];
}

export const useTeamStore = create<TeamState>((set, get) => ({
  members: initialMembers as TeamMember[],
  selectedMemberId: null,
  searchQuery: "",
  filterRole: "all",
  filterStatus: "all",
  filterPlan: "all",

  setSearch: (q) => set({ searchQuery: q }),
  setFilterRole: (r) => set({ filterRole: r }),
  setFilterStatus: (s) => set({ filterStatus: s }),
  setFilterPlan: (p) => set({ filterPlan: p }),
  selectMember: (id) => set({ selectedMemberId: id }),

  addMember: (m) =>
    set((state) => ({
      members: [...state.members, { ...m, id: crypto.randomUUID() }],
    })),

  updateMember: (id, changes) =>
    set((state) => ({
      members: state.members.map((m) => (m.id === id ? { ...m, ...changes } : m)),
    })),

  deleteMember: (id) =>
    set((state) => ({
      members: state.members.filter((m) => m.id !== id),
      selectedMemberId: state.selectedMemberId === id ? null : state.selectedMemberId,
    })),

  getFiltered: () => {
    const { members, searchQuery, filterRole, filterStatus, filterPlan } = get();
    return members.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.department.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = filterRole === "all" || m.role === filterRole;
      const matchesStatus = filterStatus === "all" || m.status === filterStatus;
      const matchesPlan = filterPlan === "all" || m.plan === filterPlan;

      return matchesSearch && matchesRole && matchesStatus && matchesPlan;
    });
  },
}));
