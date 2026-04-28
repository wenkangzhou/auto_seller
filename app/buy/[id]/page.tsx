import Link from "next/link"
import { notFound } from "next/navigation"
import { getProductById, getAvailableCardCount } from "@/lib/supabase"
import { BuyForm } from "./buy-form"
import { ArrowLeft, Package } from "lucide-react"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ id: string }>
}

export default async function BuyPage({ params }: Props) {
  const { id } = await params
  const product = await getProductById(id)

  if (!product) {
    notFound()
  }

  const stock = await getAvailableCardCount(id)

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        返回首页
      </Link>

      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50">
        <div className="border-b border-zinc-800 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900">
              <Package className="h-8 w-8 text-zinc-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{product.name}</h1>
              {product.description && (
                <p className="mt-1 text-sm text-zinc-400">{product.description}</p>
              )}
              <div className="mt-3 flex items-center gap-3">
                <span className="text-2xl font-bold text-white">
                  ${product.price}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                    stock > 0
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      stock > 0 ? "bg-emerald-400" : "bg-red-400"
                    }`}
                  />
                  {stock > 0 ? `库存 ${stock}` : "缺货"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {stock > 0 ? (
            <BuyForm productId={product.id} price={product.price} productName={product.name} />
          ) : (
            <div className="py-8 text-center">
              <p className="text-zinc-400">该商品暂时缺货，请选择其他商品</p>
              <Link
                href="/"
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-zinc-800 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
              >
                浏览其他商品
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
