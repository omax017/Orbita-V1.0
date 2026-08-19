import { IsString, MaxLength, MinLength } from "class-validator";

export class GarimpadorQueryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  termo!: string;

  @IsString()
  @MaxLength(60)
  categoria!: string;
}
