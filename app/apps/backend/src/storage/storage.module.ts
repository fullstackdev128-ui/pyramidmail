import { Global, Module } from "@nestjs/common";
import { MinioService } from "./minio.service";
import { AttachmentsController } from "./attachments.controller";

@Global()
@Module({
  controllers: [AttachmentsController],
  providers: [MinioService],
  exports: [MinioService],
})
export class StorageModule {}
