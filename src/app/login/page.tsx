import { LoginForm } from "@/components/login-form";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default function LoginPage() {
  const session = getSession();
  if (session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center gap-10 px-6 py-16">
        <div className="max-w-xl text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-emerald-200">Trackstar</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">Welcome back</h1>
          <p className="mt-3 text-white/70">
            Sign in with your OpenAuth credentials to access the live run and race data.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
