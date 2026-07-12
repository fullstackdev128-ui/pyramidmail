import { isAxiosError } from "axios";

/** User-facing message for upload failures (avatar, attachments) */
export function getUploadErrorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    const data = err.response?.data as { message?: string; error?: string } | undefined;
    if (err.response?.status === 503 || data?.error === "storage_unavailable") {
      return (
        (typeof data?.message === "string" ? data.message : null) ??
        "Stockage indisponible. Démarrez MinIO : cd docker && docker compose up -d minio"
      );
    }
    if (err.response?.status === 400) {
      return "Fichier manquant ou invalide.";
    }
  }
  return "Erreur lors de l'upload. Vérifiez que MinIO tourne (docker compose up -d minio).";
}
