"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { signUpWithPassword } from "@/lib/actions/auth";

const schema = z.object({
  full_name: z.string().min(2, "Ism kiritilishi shart"),
  email: z.string().email("Email noto'g'ri"),
  password: z.string().min(6, "Parol kamida 6 belgi"),
});
type FormValues = z.infer<typeof schema>;

export function RegisterForm() {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (values: FormValues) => {
    setServerError(null);
    startTransition(async () => {
      const result = await signUpWithPassword(values.email, values.password, values.full_name);
      if (result.error) {
        setServerError(result.error);
        return;
      }
      toast.success("Ro'yxatdan o'tdingiz!");
      setDone(true);
    });
  };

  if (done) {
    return (
      <p className="text-sm text-slate-600">
        Ro&apos;yxatdan o&apos;tdingiz. Endi{" "}
        <a href="/auth/login" className="font-medium text-accent-700 underline">
          kirish
        </a>{" "}
        sahifasidan tizimga kiring.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Ism</label>
        <input
          {...register("full_name")}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent-500"
        />
        {errors.full_name ? <p className="mt-1 text-xs text-red-600">{errors.full_name.message}</p> : null}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
        <input
          type="email"
          {...register("email")}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent-500"
        />
        {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email.message}</p> : null}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Parol</label>
        <input
          type="password"
          {...register("password")}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent-500"
        />
        {errors.password ? <p className="mt-1 text-xs text-red-600">{errors.password.message}</p> : null}
      </div>
      {serverError ? <p className="text-sm text-red-600">{serverError}</p> : null}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-accent-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-700 disabled:opacity-60"
      >
        {isPending ? "Yaratilmoqda..." : "Ro'yxatdan o'tish"}
      </button>
    </form>
  );
}
