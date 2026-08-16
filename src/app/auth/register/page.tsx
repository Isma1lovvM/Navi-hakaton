// OWNER: Backend-1 (baza tayyor — kerak bo'lsa kengaytiring)
import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-muted p-4">
      <div className="w-full max-w-sm rounded-card border border-border bg-surface p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-accent-700">BizFlow</h1>
        <p className="mt-1 mb-6 text-sm text-slate-500">Yangi akkount yarating.</p>
        <RegisterForm />
        <p className="mt-4 text-center text-sm text-slate-500">
          Akkountingiz bormi?{" "}
          <Link href="/auth/login" className="font-medium text-accent-700 underline">
            Kiring
          </Link>
        </p>
      </div>
    </main>
  );
}
