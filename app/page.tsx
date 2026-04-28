import { getActiveProducts, getAvailableCardCount } from "@/lib/supabase"
import { ProductBuyButton } from "@/components/product-buy-button"
import { Package, Zap } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const products = await getActiveProducts()

  const productsWithStock = await Promise.all(
    products.map(async (product) => {
      const stock = await getAvailableCardCount(product.id)
      return { ...product, stock }
    })
  )

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Hero */}
      <div className="mb-16 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-4 py-1.5 text-sm text-sky-400">
          <Zap className="h-3.5 w-3.5" />
          自动发货 · 即时到账
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          数字卡券自动发货平台
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-zinc-400">
          安全、快速、便捷。购买后立即通过邮件收到卡券信息，无需等待人工处理。
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {productsWithStock.map((product) => (
          <div
            key={product.id}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 transition-all hover:border-zinc-700 hover:bg-zinc-900"
          >
            <div className="flex h-32 items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
              <Package className="h-12 w-12 text-zinc-600 transition-colors group-hover:text-sky-400" />
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h3 className="mb-2 text-lg font-semibold text-white">
                {product.name}
              </h3>
              {product.description && (
                <p className="mb-4 text-sm text-zinc-400 line-clamp-2">
                  {product.description}
                </p>
              )}
              <div className="mt-auto flex items-end justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">
                    ${product.price}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-sm">
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${
                        product.stock > 0 ? "bg-emerald-400" : "bg-red-400"
                      }`}
                    />
                    <span
                      className={
                        product.stock > 0 ? "text-emerald-400" : "text-red-400"
                      }
                    >
                      {product.stock > 0 ? `库存 ${product.stock}` : "暂时缺货"}
                    </span>
                  </div>
                </div>
                <ProductBuyButton productId={product.id} stock={product.stock} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {productsWithStock.length === 0 && (
        <div className="py-20 text-center">
          <Package className="mx-auto mb-4 h-12 w-12 text-zinc-600" />
          <h3 className="text-lg font-medium text-zinc-300">暂无商品</h3>
          <p className="mt-1 text-zinc-500">请前往后台管理添加卡券产品</p>
        </div>
      )}
    </div>
  )
}
