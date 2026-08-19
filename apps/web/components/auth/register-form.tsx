"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api-client";
import { register as registerRequest } from "@/lib/auth/api";
import {
  registerSchema,
  type RegisterFormErrors,
  type RegisterFormValues,
} from "@/lib/auth/schemas";

const EMPTY_VALUES: RegisterFormValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  workspaceName: "",
};

export function RegisterForm() {
  const router = useRouter();
  const [values, setValues] = useState<RegisterFormValues>(EMPTY_VALUES);
  const [fieldErrors, setFieldErrors] = useState<RegisterFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function setField<K extends keyof RegisterFormValues>(key: K, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      const errors: RegisterFormErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof RegisterFormValues;
        errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setLoading(true);

    // confirmPassword só existe para a validação client-side (.refine acima)
    // — a API rejeita campos fora do DTO (ValidationPipe forbidNonWhitelisted).
    const { confirmPassword: _confirmPassword, ...payload } = parsed.data;

    try {
      await registerRequest(payload);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "Não foi possível criar a conta. Tente novamente.",
      );
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h1 className="text-lg font-semibold text-foreground">Criar conta</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Leva menos de um minuto — sua loja fica pronta na hora.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="name">Seu nome</Label>
          <Input
            id="name"
            autoComplete="name"
            value={values.name}
            onChange={(e) => setField("name", e.target.value)}
            placeholder="Maria Silva"
          />
          {fieldErrors.name ? <FieldError message={fieldErrors.name} /> : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="workspaceName">Nome da loja</Label>
          <Input
            id="workspaceName"
            value={values.workspaceName}
            onChange={(e) => setField("workspaceName", e.target.value)}
            placeholder="Loja da Maria"
          />
          {fieldErrors.workspaceName ? <FieldError message={fieldErrors.workspaceName} /> : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => setField("email", e.target.value)}
            placeholder="voce@loja.com"
          />
          {fieldErrors.email ? <FieldError message={fieldErrors.email} /> : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={values.password}
            onChange={(e) => setField("password", e.target.value)}
            placeholder="Mínimo 8 caracteres"
          />
          {fieldErrors.password ? <FieldError message={fieldErrors.password} /> : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirmar senha</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={(e) => setField("confirmPassword", e.target.value)}
          />
          {fieldErrors.confirmPassword ? <FieldError message={fieldErrors.confirmPassword} /> : null}
        </div>

        {formError ? (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {formError}
          </p>
        ) : null}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Criar conta
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}

function FieldError({ message }: { message: string }) {
  return <p className="text-xs text-destructive">{message}</p>;
}
