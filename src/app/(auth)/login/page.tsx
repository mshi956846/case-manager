"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 shadow-lg shadow-indigo-500/30 ring-1 ring-white/20 overflow-hidden">
          <Image
            src="/icon-indiana-defender.svg"
            alt="Indiana Defender"
            width={80}
            height={80}
            className="h-full w-full"
          />
        </div>
        <h1 className="text-3xl font-bold text-white">Indiana Defender</h1>
        <p className="mt-1 text-base font-medium text-white/70">
          Criminal Defense Case Management
        </p>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {error && (
          <p className="rounded-lg bg-red-500/20 p-2 text-center text-sm text-red-200">
            {error}
          </p>
        )}
        <div className="flex flex-col gap-2">
          <Label htmlFor="email" className="text-white/80">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border-white/15 bg-white/10 text-white placeholder:text-white/40 focus-visible:ring-indigo-400/60"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password" className="text-white/80">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border-white/15 bg-white/10 text-white placeholder:text-white/40 focus-visible:ring-indigo-400/60"
          />
        </div>
        <Button
          type="submit"
          className="mt-2 w-full bg-white/20 font-semibold text-white hover:bg-white/30"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </div>
  );
}
