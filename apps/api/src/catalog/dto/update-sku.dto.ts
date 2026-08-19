import { PartialType } from "@nestjs/mapped-types";
import { CreateSkuDto } from "./create-sku.dto";

/** Todos os campos de `CreateSkuDto`, mas opcionais — é o que a extensão usa
 * pra "cadastrar rapidamente o custo do SKU" (manda só `costAmount`, o resto
 * fica como está). */
export class UpdateSkuDto extends PartialType(CreateSkuDto) {}
