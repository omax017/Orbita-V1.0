import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Min, MaxLength } from "class-validator";
import { Type } from "class-transformer";

export class CreateSkuDto {
  @IsString()
  @MaxLength(60)
  code!: string;

  @IsString()
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  costAmount!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  packagingCostAmount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  barcode?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  weightGrams?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stockLocal?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stockFull?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  lowStockThreshold?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
