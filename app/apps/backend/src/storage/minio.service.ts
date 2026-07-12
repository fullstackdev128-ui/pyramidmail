import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Client } from "minio";
import { Readable } from "stream";
import { rethrowStorageError } from "./storage.errors";

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private readonly client: Client;
  private readonly bucket: string;

  constructor() {
    const endPoint = process.env.MINIO_ENDPOINT ?? "localhost";
    const port = Number(process.env.MINIO_PORT ?? "9000");
    const accessKey = process.env.MINIO_ACCESS_KEY ?? "minioadmin";
    const secretKey = process.env.MINIO_SECRET_KEY ?? "minioadmin123";
    const useSSL = String(process.env.MINIO_USE_SSL ?? "false") === "true";

    this.bucket = process.env.MINIO_BUCKET ?? "pyramid-attachments";
    this.client = new Client({ endPoint, port, accessKey, secretKey, useSSL });
  }

  async onModuleInit() {
    try {
      await this.ensureBucket();
      this.logger.log(
        `MinIO OK — bucket "${this.bucket}" sur ${process.env.MINIO_ENDPOINT ?? "localhost"}:${process.env.MINIO_PORT ?? "9000"}`
      );
    } catch (err) {
      this.logger.error(
        `MinIO injoignable — les uploads échoueront. Lancez: cd docker && docker compose up -d minio`,
        err
      );
    }
  }

  async ensureBucket() {
    try {
      const exists = await this.client.bucketExists(this.bucket);
      if (!exists) {
        await this.client.makeBucket(this.bucket, "us-east-1");
      }
    } catch (error) {
      rethrowStorageError(error);
    }
  }

  async putObject(
    key: string,
    data: string | Buffer | Readable,
    size: number | undefined,
    meta: Record<string, string>
  ) {
    await this.ensureBucket();
    const stream = data instanceof Readable ? data : Readable.from(data);
    try {
      await this.client.putObject(this.bucket, key, stream, size ?? -1, meta);
    } catch (error) {
      console.error(`[MinioService] Error putting object ${key}:`, error);
      rethrowStorageError(error);
    }
  }

  async getObject(key: string) {
    await this.ensureBucket();
    return this.client.getObject(this.bucket, key);
  }

  async statObject(key: string) {
    await this.ensureBucket();
    return this.client.statObject(this.bucket, key);
  }
}
