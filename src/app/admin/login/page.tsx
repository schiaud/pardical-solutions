import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Sign in — Pardical" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ yard?: string }> }) {
  const { yard = "" } = await searchParams;
  return (
    <div className="min-h-screen grid place-items-center bg-surface px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
        <p className="text-xl font-bold text-primary-dark">Pardical</p>
        <h1 className="mt-1 text-lg font-semibold text-slate-900">Sign in to your yard</h1>
        <LoginForm yard={yard} />
        {yard === "demo" && (
          <p className="mt-4 rounded-lg bg-amber-50 text-amber-900 text-sm px-3 py-2">
            Demo yard password: <span className="font-mono font-semibold">demo</span>
          </p>
        )}
      </div>
    </div>
  );
}
