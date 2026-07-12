import { IsArray, IsEmail, IsOptional, IsString } from "class-validator";

export class SendEmailDto {
  @IsOptional()
  @IsString()
  threadId?: string;

  @IsArray()
  @IsEmail({}, { each: true })
  to!: string[];

  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  cc?: string[];

  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  bcc?: string[];

  @IsString()
  subject!: string;

  @IsOptional()
  @IsString()
  bodyHtml?: string;

  @IsOptional()
  @IsString()
  bodyText?: string;

  @IsOptional()
  attachments?: Array<{
    key: string;
    name: string;
    size: number;
    contentType: string;
  }>;
}
