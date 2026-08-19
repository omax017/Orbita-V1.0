import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export class RegisterDto {
  @IsString()
  @MinLength(2, { message: "Nome deve ter pelo menos 2 caracteres" })
  @MaxLength(120)
  name!: string;

  @IsEmail({}, { message: "E-mail inválido" })
  @MaxLength(180)
  email!: string;

  @IsString()
  @MinLength(8, { message: "Senha deve ter pelo menos 8 caracteres" })
  @MaxLength(72) // limite prático do bcrypt
  password!: string;

  /** Nome da loja/conta — usado para criar o Workspace do dono no cadastro. */
  @IsString()
  @MinLength(2, { message: "Nome do workspace deve ter pelo menos 2 caracteres" })
  @MaxLength(120)
  workspaceName!: string;
}
