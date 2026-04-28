"use client"

import { Suspense } from "react"
import { Search, Loader2, AlertCircle, Package, CheckCircle, Clock, Copy, Check } from "lucide-react"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"

interface OrderItem {
  id: string
  product_name: string
  price: number
  card_code: string | null
}

interface OrderData {
  order: {
    id: string
    email: string
    total_amount: number
    currency: string
    status: string
    paid_at: string | null
    created_at: string
  }
  items: OrderItem[]
}

function QueryForm() {
  const searchParams = useSearchParams()
  const initialOrderId = searchParams.get("orderId") || ""
  const initialEmail = searchParams.get("email") || ""

  const [orderId, setOrderId] = useState(initialOrderId)
  const [email, setEmail] = useState(initialEmail)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<OrderData | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    if (initialOrderId && initialEmail) {
      handleQuery(initialOrderId, initialEmail)
    }
  }, [])

  async function handleQuery(oid?: string, em?: string) {
    const qId = oid || orderId
    const qEmail = em || email

    if (!qId || !qEmail) {
      setError("请填写订单号和邮箱")
      return
    }

    setLoading(true)
    setError("")
    setResult(null)

    try {
      const res = await fetch("/api/order/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: qId, email: qEmail }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "查询失败")
      }

      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    handleQuery()
  }

  function copyCode(code: string, id: string) {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "paid":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
            <CheckCircle className="h-3 w-3" />
            已支付
          </span>
        )
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400">
            <Clock className="h-3 w-3" />
            待支付
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-500/10 px-2.5 py-1 text-xs font-medium text-zinc-400">
            {status}
          </span>
        )
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white">订单查询</h1>
        <p className="mt-1 text-zinc-400">输入订单号和邮箱查询卡券信息</p>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">订单号</label>
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 py-3 px-4 text-white placeholder-zinc-500 outline-none transition-colors focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">邮箱</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 py-3 px-4 text-white placeholder-zinc-500 outline-none transition-colors focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          />
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
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 py-3 text-sm font-semibold text-white transition-all hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              查询中...
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              查询订单
            </>
          )}
        </button>
      </form>

      {result && (
        <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div>
              <p className="text-sm text-zinc-400">订单号</p>
              <p className="mt-0.5 font-mono text-sm text-white">{result.order.id}</p>
            </div>
            {getStatusBadge(result.order.status)}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-zinc-400">邮箱</p>
              <p className="mt-0.5 text-sm text-white">{result.order.email}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-400">下单时间</p>
              <p className="mt-0.5 text-sm text-white">
                {new Date(result.order.created_at).toLocaleString("zh-CN")}
              </p>
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-4">
            <p className="mb-3 text-sm font-medium text-zinc-300">卡券信息</p>
            <div className="space-y-3">
              {result.items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-sky-400" />
                      <span className="text-sm font-medium text-white">
                        {item.product_name}
                      </span>
                    </div>
                    <span className="text-sm text-zinc-400">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>
                  {item.card_code ? (
                    <div className="flex items-center gap-2">
                      <code className="flex-1 rounded-lg bg-zinc-900 px-3 py-2 text-sm text-sky-400">
                        {item.card_code}
                      </code>
                      <button
                        onClick={() => copyCode(item.card_code!, item.id)}
                        className="rounded-lg bg-zinc-800 p-2 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white"
                        title="复制"
                      >
                        {copiedId === item.id ? (
                          <Check className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-500">卡券暂未分配</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
            <span className="text-sm text-zinc-400">订单总额</span>
            <span className="text-lg font-bold text-white">
              ${result.order.total_amount.toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function QueryPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-zinc-500" />
      </div>
    }>
      <QueryForm />
    </Suspense>
  )
}
