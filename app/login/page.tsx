"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getBrowserClient } from "@/lib/supabase"
import { Loader2, Mail, Lock, LogIn, Zap, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState("")
  const [mode, setMode] = useState<"login" | "register">("login")

  useEffect(() => {
    async function checkSession() {
      const supabase = getBrowserClient()
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        router.replace("/admin")
      }
      setChecking(false)
    }
    checkSession()
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const supabase = getBrowserClient()

    try {
      if (mode === "login") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) throw signInError
        router.replace("/admin")
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        })
        if (signUpError) throw signUpError
        setError("注册成功，请查收验证邮件后登录")
        setMode("login")
      }
    } catch (err: any) {
      setError(err.message || "操作失败")
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mb-8 flex items-center gap-2 text-2xl font-bold text-white">
        <Zap className="h-6 w-6 text-sky-400" />
        <span>AutoCard</span>
      </div>

      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h1 className="mb-1 text-lg font-semibold text-white">
          {mode === "login" ? "管理员登录" : "注册管理员账号"}
        </h1>
        <p className="mb-6 text-sm text-zinc-400">
          {mode === "login" ? "登录后进入后台管理" : "创建管理员账号"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm text-zinc-400">邮箱</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 py-2.5 pl-10 pr-3 text-sm text-white outline-none focus:border-sky-500"
                required
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-zinc-400">密码</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 py-2.5 pl-10 pr-3 text-sm text-white outline-none focus:border-sky-500"
                required
                minLength={6}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-sky-500 py-2.5 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            {mode === "login" ? "登录" : "注册"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          {mode === "login" ? (
            <span className="text-zinc-400">
              还没有账号？{" "}
              <button
                onClick={() => { setMode("register"); setError("") }}
                className="text-sky-400 hover:underline"
              >
                注册
              </button>
            </span>
          ) : (
            <span className="text-zinc-400">
              已有账号？{" "}
              <button
                onClick={() => { setMode("login"); setError("") }}
                className="text-sky-400 hover:underline"
              >
                登录
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
