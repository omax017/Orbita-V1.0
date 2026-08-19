import { z } from "zod";

// Espelha as validações de apps/api/src/auth/dto/register.dto.ts —
// checar no cliente antes de bater na API evita um round-trip só pra
// descobrir "senha muito curta".
export const registerSchema = z
  .object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(120),
    email: z.string().email("E-mail inválido").max(180),
    password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres").max(72),
    confirmPassword: z.string(),
    workspaceName: z
      .string()
      .min(2, "Nome da loja deve ter pelo menos 2 caracteres")
      .max(120),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
export type RegisterFormErrors = Partial<Record<keyof RegisterFormValues, string>>;
