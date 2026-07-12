import { useState, useEffect } from "react";
import {
  Camera,
  Pencil,
  Check,
  AlertTriangle,
  Trash2,
  Info,
  Loader2,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/auth.service";
import { useProfile, useUpdateProfile, useUploadAvatar } from "@/hooks/useUserSettings";
import { useNavigate } from "react-router-dom";
import { cn, getUserInitials, getUserColor } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { resolveApiPath } from "@/lib/api";
import { getUploadErrorMessage } from "@/lib/upload-errors";
import { useRef } from "react";

export function ProfilePage() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: authUser } = useAuth();
  const { data: user, isLoading, isError } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const uploadAvatarMutation = useUploadAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    displayName: "",
    phone: "",
    city: "",
    bio: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || "",
        phone: user.phone || "",
        city: user.city || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      await updateProfileMutation.mutateAsync(formData);
      showToast("Profil mis à jour", "success");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      showToast("Erreur lors de la mise à jour", "error");
      console.error("Failed to update profile", err);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await uploadAvatarMutation.mutateAsync(file);
        showToast("Photo de profil mise à jour", "success");
      } catch (err) {
        showToast(getUploadErrorMessage(err), "error");
        console.error("Failed to upload avatar", err);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      queryClient.clear();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
      queryClient.clear();
      navigate("/login");
    }
  };

  const handleDeleteAccount = () => {
    if (deleteConfirm === "DELETE") {
      // Logic for deleting account via API would go here
      handleLogout();
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#EDF3F6]">
        <Loader2 className="animate-spin text-[#0087CA]" size={40} />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#EDF3F6] p-6 text-center">
        <AlertTriangle size={48} className="text-red-400 mb-4" />
        <h2 className="text-xl font-semibold text-[#162A42]">Erreur de chargement</h2>
        <p className="text-slate-500 mb-6">Impossible de récupérer votre profil.</p>
        <Button onClick={() => window.location.reload()} className="bg-[#0087CA] rounded-xl">
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-[#EDF3F6] rounded-3xl overflow-hidden shadow-sm border border-slate-100">
      <ScrollArea className="flex-1">
        <div className="max-w-[680px] mx-auto py-12 px-6 space-y-12">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-semibold text-[#162A42]">Profil</h1>
            <p className="text-[#091D35] opacity-60 font-medium">
              Gérez vos informations personnelles et préférences
            </p>
          </div>

          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-6">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            <div
              className="relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div
                className={cn(
                  "w-[120px] h-[120px] rounded-full flex items-center justify-center text-4xl font-semibold shadow-xl transition-transform duration-300 group-hover:scale-105 overflow-hidden",
                  !user.avatar && getUserColor(user.displayName || user.email)
                )}
              >
                {user.avatar ? (
                  <img
                    src={resolveApiPath(user.avatar)}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getUserInitials(user.displayName || user.email)
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-10 h-10 bg-[#0087CA] text-white rounded-full flex items-center justify-center border-4 border-white shadow-lg transition-all duration-300 group-hover:bg-[#0087CA]/90">
                {uploadAvatarMutation.isPending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Camera size={18} />
                )}
              </div>
              <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Pencil size={24} />
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-[#162A42]">
                {user.displayName || user.email?.split("@")[0] || "Utilisateur"}
              </h2>
              <p className="text-sm text-slate-400 font-medium">{user.email}</p>
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#EDF3F6] rounded-xl flex items-center justify-center text-[#0087CA]">
                <Pencil size={20} />
              </div>
              <h3 className="text-xl font-semibold text-[#162A42]">Informations personnelles</h3>
            </div>

            <div className="grid gap-6">
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-[#162A42] ml-1">Nom complet</label>
                <Input
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="h-12 bg-[#EDF3F6] border-none rounded-xl px-4 font-medium focus-visible:ring-2 focus-visible:ring-[#0087CA]/20"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-[#162A42] ml-1">Adresse email</label>
                <div className="relative w-full">
                  <Input
                    value={user.email}
                    disabled
                    className="h-12 bg-slate-50 border-none rounded-xl px-4 font-medium text-slate-400 cursor-not-allowed pr-10 w-full"
                  />
                  <Info
                    size={16}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-[#162A42] ml-1">Numéro de téléphone</label>
                <Input
                  placeholder="+237 6XX XXX XXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-12 bg-[#EDF3F6] border-none rounded-xl px-4 font-medium focus-visible:ring-2 focus-visible:ring-[#0087CA]/20"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-[#162A42] ml-1">Ville</label>
                <Input
                  placeholder="Douala, Yaoundé..."
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="h-12 bg-[#EDF3F6] border-none rounded-xl px-4 font-medium focus-visible:ring-2 focus-visible:ring-[#0087CA]/20"
                />
              </div>

              <div className="grid gap-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-semibold text-[#162A42]">Bio courte</label>
                  <span
                    className={cn(
                      "text-[10px] font-semibold uppercase tracking-wider",
                      formData.bio.length > 160 ? "text-red-500" : "text-slate-400"
                    )}
                  >
                    {formData.bio.length}/160
                  </span>
                </div>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value.slice(0, 160) })}
                  placeholder="Dites-nous en un peu plus sur vous..."
                  className="min-h-[120px] bg-[#EDF3F6] border-none rounded-2xl p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[#0087CA]/20 resize-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center gap-4">
              <Button
                onClick={handleSave}
                disabled={updateProfileMutation.isPending}
                className="bg-[#0087CA] hover:bg-[#0087CA]/90 text-white rounded-xl h-12 px-8 font-semibold shadow-lg shadow-[#0087CA]/20 transition-all active:scale-95 disabled:opacity-70"
              >
                {updateProfileMutation.isPending ? (
                  <Loader2 className="animate-spin mr-2" size={18} />
                ) : null}
                Sauvegarder les modifications
              </Button>
              {showSuccess && (
                <div className="flex items-center gap-2 text-green-600 font-semibold text-sm animate-in fade-in slide-in-from-left-4 duration-300">
                  <Check size={18} />
                  Modifications sauvegardées
                </div>
              )}
            </div>
          </div>

          {/* Danger Zone Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 px-4">
              <Separator className="flex-1 bg-red-100" />
              <span className="text-xs font-semibold text-red-400 uppercase tracking-[0.2em] whitespace-nowrap">
                Zone de danger
              </span>
              <Separator className="flex-1 bg-red-100" />
            </div>

            <div className="bg-[#FEF2F2] border-2 border-red-100 p-8 rounded-[32px] flex items-center justify-between gap-8">
              <div className="space-y-1 flex-1">
                <h4 className="text-lg font-semibold text-red-600">Supprimer le compte</h4>
                <p className="text-sm text-red-900/60 font-medium">
                  Cette action est irréversible. Tous vos emails, contacts et paramètres seront
                  définitivement supprimés.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(true)}
                className="border-red-200 text-red-600 hover:bg-red-600 hover:text-white rounded-xl h-12 px-6 font-semibold transition-all shrink-0"
              >
                Supprimer mon compte
              </Button>
            </div>
          </div>

          <div className="text-center pb-12">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">
              © 2026 Pyramid Mail • Design System v2.0
            </p>
          </div>
        </div>
      </ScrollArea>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-[#162A42]/80 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          />
          <div className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl relative z-10 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mx-auto">
              <AlertTriangle size={32} />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-2xl font-semibold text-[#162A42]">Êtes-vous sûr ?</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                Cette action supprimera définitivement votre compte et toutes les données associées.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-1">
                  Tapez <span className="text-red-500 font-semibold">DELETE</span> pour confirmer
                </label>
                <Input
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  className="h-12 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 font-semibold text-center text-red-600 uppercase focus-visible:ring-red-500/20"
                  placeholder="DELETE"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  disabled={deleteConfirm !== "DELETE"}
                  onClick={handleDeleteAccount}
                  className={cn(
                    "w-full h-12 rounded-xl font-semibold transition-all",
                    deleteConfirm === "DELETE"
                      ? "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200"
                      : "bg-slate-100 text-slate-400"
                  )}
                >
                  <Trash2 size={18} className="mr-2" /> Confirmer la suppression
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowDeleteModal(false)}
                  className="w-full h-12 rounded-xl font-semibold text-slate-400 hover:text-[#162A42]"
                >
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
