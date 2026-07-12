import { ServiceUnavailableException } from "@nestjs/common";

const STORAGE_HINT = "Démarrez MinIO : cd docker && docker compose up -d minio";

const CONNECTION_CODES = new Set([
  "ECONNREFUSED",
  "ECONNRESET",
  "ENOTFOUND",
  "EHOSTUNREACH",
  "ETIMEDOUT",
]);

function isStorageConnectionError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { code?: string; message?: string; cause?: unknown };
  if (e.code && CONNECTION_CODES.has(e.code)) return true;
  const msg = e.message ?? "";
  if (/ECONNREFUSED|ECONNRESET|connect ECONN|socket hang up/i.test(msg)) return true;
  if (e.cause) return isStorageConnectionError(e.cause);
  return false;
}

/** Maps MinIO/network failures to a clear 503 for the client */
export function rethrowStorageError(err: unknown): never {
  if (isStorageConnectionError(err)) {
    throw new ServiceUnavailableException({
      error: "storage_unavailable",
      message: `Service de stockage indisponible. ${STORAGE_HINT}`,
    });
  }
  throw err;
}
