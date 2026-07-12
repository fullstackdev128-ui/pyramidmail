import { IsString } from "class-validator";

export class CreateDomainDto {
  @IsString()
  domainName!: string;
}
