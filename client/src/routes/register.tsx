import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth, type Role } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { AuthShell, Field } from "./login";

const registerSchema = z
  .object({
    email: z.string().trim().email("Please enter a valid email address."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(128, "Password is too long."),
    role: z.enum(["Company", "Supplier"]),
    supplierCode: z.string().trim().optional(),
  })
  .refine(
    (v) =>
      v.role !== "Supplier" || (v.supplierCode && v.supplierCode.length > 0),
    {
      message: "Supplier code is required to register as a supplier.",
      path: ["supplierCode"],
    },
  );

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create account · POES" },
      {
        name: "description",
        content: "Create a POES account as a company or supplier.",
      },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("Company");
  const [supplierCode, setSupplierCode] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = registerSchema.safeParse({
      email,
      password,
      role,
      supplierCode: supplierCode || undefined,
    });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues)
        errs[issue.path[0] as string] = issue.message;
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await register(parsed.data);
      toast.success("Account created. Signing you in…");
      await login(parsed.data.email, parsed.data.password);
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Could not create your account. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create your account
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Set up a company workspace or join as a supplier with a code.
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <Field label="I am a" htmlFor="role" required>
          <Select value={role} onValueChange={(v) => setRole(v as Role)}>
            <SelectTrigger id="role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Company">Company</SelectItem>
              <SelectItem value="Supplier">Supplier</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        {role === "Supplier" ? (
          <Field
            label="Supplier code"
            htmlFor="supplierCode"
            error={errors.supplierCode}
            hint="Provided by the company that invited you."
            required
          >
            <Input
              id="supplierCode"
              placeholder="e.g. SUP-000123"
              value={supplierCode}
              onChange={(e) => setSupplierCode(e.target.value)}
              aria-invalid={!!errors.supplierCode}
            />
          </Field>
        ) : null}

        <Field label="Email" htmlFor="email" error={errors.email} required>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!errors.email}
          />
        </Field>

        <Field
          label="Password"
          htmlFor="password"
          error={errors.password}
          hint="Minimum 8 characters."
          required
        >
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!errors.password}
          />
        </Field>

        <Button type="submit" className="h-11 w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating…
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
