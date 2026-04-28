"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface ProductBuyButtonProps {
  productId: string
  stock: number
}

export function ProductBuyButton({ productId, stock }: ProductBuyButtonProps) {
  if (stock === 0) {
    return (
      <span className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-xl bg-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-400">
        购买
        <ArrowRight className="h-4 w-4" />
      </span>
    )
  }

  return (
    <Link
      href={`/buy/${productId}`}
      className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-sky-600"
    >
      购买
      <ArrowRight className="h-4 w-4" />
    </Link>
  )
}
