"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Mail, AlertCircle, CreditCard } from "lucide-react"

interface BuyFormProps {
  productId: string
  price: number
  productName: string
}

export function BuyForm({ productId, price, productName }: BuyFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!email || !email.includes("@")) {
      setError("请输入有效的邮箱地址")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, email }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "创建订单失败")
      }

      router.push(`/success?orderId=${data.orderId}&email=${encodeURIComponent(email)}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          接收邮箱
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 py-3 pl-10 pr-4 text-white placeholder-zinc-500 outline-none transition-colors focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            required
          />
        </div>
        <p className="mt-1.5 text-xs text-zinc-500">
          卡券信息将通过此邮箱发送给您
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
        <div className="flex items-center gap-3">
          <CreditCard className="h-5 w-5 text-zinc-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-zinc-300">支付方式</p>
            <p className="text-xs text-zinc-500">模拟支付（演示模式）</p>
          </div>
          <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400">
            Mock
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl bg-zinc-800/50 p-4">
        <span className="text-sm text-zinc-400">订单金额</span>
        <span className="text-xl font-bold text-white">${price.toFixed(2)}</span>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 py-3.5 text-sm font-semibold text-white transition-all hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            处理中...
          </>
        ) : (
          <>确认购买（演示）</>
        )}
      </button>

      <p className="text-center text-xs text-zinc-600">
        当前为演示模式，不扣除真实费用，点击后直接发货
      </p>
    </form>
  )
}
