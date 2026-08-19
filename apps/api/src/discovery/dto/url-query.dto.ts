import { IsString, MaxLength, MinLength } from "class-validator";

/** Compartilhado por "Análise de Concorrentes" e "Análise de Anúncio" —
 * ambos recebem só um link/ID de entrada. */
export class UrlQueryDto {
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  url!: string;
}
