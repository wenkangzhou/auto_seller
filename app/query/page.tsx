"use client"

import { Suspense, useState, useEffect } from "react"
import { Search, Loader2, AlertCircle, Package, CheckCircle, Clock, Copy, Check, Mail, ChevronDown, ChevronUp } from "lucide-react"

interface OrderItem {
  id: string
  product_name: string
  price: number
  card_code: string | null
}

interface OrderData {
  id: string
  email: string
  total_amount: number
  currency: string
  status: string
  paid_at: string | null
  created_at: string
  items: OrderItem[]
}

function QueryForm() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [orders, setOrders] = useState<OrderData[] | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!email || !email.includes("@")) {
      setError("请输入有效的邮箱地址")
      return
    }

    setLoading(true)
    setError("")
    setOrders(null)

    try {
      const res = await fetch("/api/order/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "查询失败")
      }

      setOrders(data.orders)
      // Expand the first order by default
      if (data.orders?.length > 0) {
        setExpandedOrder(data.orders[0].id)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
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
        <p className="mt-1 text-zinc-400">输入购买时填写的邮箱，查询所有订单和卡券</p>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">邮箱</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 py-3 pl-10 pr-4 text-white placeholder-zinc-500 outline-none transition-colors focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>
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

      {orders && orders.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-zinc-400">找到 {orders.length} 个订单</p>
          {orders.map((order) => (
            <div
              key={order.id}
              className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50"
            >
              {/* Order header - clickable */}
              <button
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-zinc-800/50"
              >
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-sky-400" />
                  <div>
                    <p className="text-sm font-medium text-white">
                      {order.items.map((i) => i.product_name).join(", ")}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {new Date(order.created_at).toLocaleString("zh-CN")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(order.status)}
                  <span className="text-sm font-semibold text-white">
                    ${order.total_amount.toFixed(2)}
                  </span>
                  {expandedOrder === order.id ? (
                    <ChevronUp className="h-4 w-4 text-zinc-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-zinc-500" />
                  )}
                </div>
              </button>

              {/* Order details */}
              {expandedOrder === order.id && (
                <div className="border-t border-zinc-800 px-4 py-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-zinc-500">订单号</p>
                      <p className="mt-0.5 font-mono text-sm text-white">{order.id}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {order.items.map((item) => (
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
              )}
            </div>
          ))}
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
