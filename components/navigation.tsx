"use client"

import Link from "next/link"
import { ShoppingCart, Search, Zap } from "lucide-react"

export function Navigation() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-white">
          <Zap className="h-5 w-5 text-sky-400" />
          <span>AutoCard</span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <ShoppingCart className="h-4 w-4" />
            购买卡券
          </Link>
          <Link
            href="/query"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <Search className="h-4 w-4" />
            订单查询
          </Link>
        </nav>
      </div>
    </header>
  )
}
