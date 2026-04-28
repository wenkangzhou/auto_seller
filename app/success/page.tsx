"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Mail, ArrowRight, Package } from "lucide-react"
import { Suspense } from "react"

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const email = searchParams.get("email")

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle className="h-8 w-8 text-emerald-400" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-white">购买成功</h1>
        <p className="text-zinc-400">
          卡券信息已发送至您的邮箱
        </p>
      </div>

      <div className="mt-8 space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex items-center gap-3">
          <Mail className="h-5 w-5 text-sky-400" />
          <div>
            <p className="text-sm text-zinc-400">接收邮箱</p>
            <p className="font-medium text-white">{email || "-"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Package className="h-5 w-5 text-sky-400" />
          <div>
            <p className="text-sm text-zinc-400">订单号</p>
            <p className="font-medium text-white">{orderId || "-"}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <Link
          href={`/query?orderId=${orderId}&email=${encodeURIComponent(email || "")}`}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-sky-600"
        >
          查看订单详情
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-transparent py-3 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
        >
          继续购买
        </Link>
      </div>

      <p className="mt-6 text-center text-xs text-zinc-600">
        如未收到邮件，请检查垃圾邮件文件夹或联系客服
      </p>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto mb-6 h-16 w-16 animate-pulse rounded-full bg-zinc-800" />
        <div className="mx-auto mb-2 h-8 w-48 animate-pulse rounded bg-zinc-800" />
        <div className="mx-auto h-4 w-64 animate-pulse rounded bg-zinc-800" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
