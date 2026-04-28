"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { getBrowserClient } from "@/lib/supabase"
import {
  Plus,
  Package,
  CreditCard,
  ShoppingBag,
  Loader2,
  Trash2,
  Edit2,
  Save,
  X,
  Check,
  Layers,
  AlertCircle,
  LogOut,
  LogIn,
  Mail,
  Send,
  Shield,
} from "lucide-react"

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  currency: string
  status: "active" | "inactive"
  created_at: string
}

interface CardItem {
  id: string
  product_id: string
  code: string
  status: string
  created_at: string
}

interface Stats {
  productCount: number
  cardCount: number
  availableCardCount: number
  orderCount: number
  totalRevenue: number
}

export default function AdminPage() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)

  // Admin data
  const [products, setProducts] = useState<Product[]>([])
  const [cards, setCards] = useState<CardItem[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"products" | "cards" | "settings">("products")

  // Product form
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    currency: "USD",
    status: "active" as "active" | "inactive",
  })

  // Card form
  const [showCardForm, setShowCardForm] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState("")
  const [cardCodes, setCardCodes] = useState("")

  // Email test
  const [testEmail, setTestEmail] = useState("")
  const [testEmailLoading, setTestEmailLoading] = useState(false)
  const [testEmailResult, setTestEmailResult] = useState("")
  const [emailConfig, setEmailConfig] = useState<{ apiKeyConfigured: boolean; fromEmailConfigured: boolean; fromEmail: string | null } | null>(null)

  // Auth
  useEffect(() => {
    const supabase = getBrowserClient()
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => { listener.subscription.unsubscribe() }
  }, [])

  const fetchData = useCallback(async () => {
    try {
      const [productsRes, cardsRes, statsRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/cards"),
        fetch("/api/admin/stats"),
      ])
      if (productsRes.ok) setProducts(await productsRes.json())
      if (cardsRes.ok) setCards(await cardsRes.json())
      if (statsRes.ok) setStats(await statsRes.json())
    } catch (err) {
      console.error("Fetch error:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session) {
      fetchData()
      // Fetch email config
      fetch("/api/admin/email-config")
        .then((res) => res.json())
        .then((data) => setEmailConfig(data))
        .catch(console.error)
    }
  }, [session, fetchData])

  async function handleLogout() {
    const supabase = getBrowserClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  async function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: productForm.name,
        description: productForm.description || null,
        price: parseFloat(productForm.price),
        currency: productForm.currency,
        status: productForm.status,
      }),
    })
    if (res.ok) {
      setProductForm({ name: "", description: "", price: "", currency: "USD", status: "active" })
      setShowProductForm(false)
      fetchData()
    }
  }

  async function handleUpdateProduct(e: React.FormEvent) {
    e.preventDefault()
    if (!editingProduct) return
    const res = await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingProduct.id,
        name: productForm.name,
        description: productForm.description || null,
        price: parseFloat(productForm.price),
        currency: productForm.currency,
        status: productForm.status,
      }),
    })
    if (res.ok) {
      setEditingProduct(null)
      setProductForm({ name: "", description: "", price: "", currency: "USD", status: "active" })
      fetchData()
    }
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm("确定删除此产品？相关卡券也会被清理。")) return
    const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" })
    if (res.ok) fetchData()
  }

  async function handleAddCards(e: React.FormEvent) {
    e.preventDefault()
    const codes = cardCodes.split("\n").map((c) => c.trim()).filter((c) => c.length > 0)
    const res = await fetch("/api/admin/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: selectedProductId, codes }),
    })
    if (res.ok) {
      setCardCodes("")
      setSelectedProductId("")
      setShowCardForm(false)
      fetchData()
    } else {
      const data = await res.json()
      alert(data.error || "添加失败")
    }
  }

  async function handleDeleteCard(id: string) {
    if (!confirm("确定删除此卡券？")) return
    const res = await fetch(`/api/admin/cards?id=${id}`, { method: "DELETE" })
    if (res.ok) fetchData()
  }

  function startEdit(product: Product) {
    setEditingProduct(product)
    setProductForm({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      currency: product.currency,
      status: product.status,
    })
  }

  async function handleTestEmail() {
    if (!testEmail || !testEmail.includes("@")) {
      setTestEmailResult("请输入有效的邮箱地址")
      return
    }
    setTestEmailLoading(true)
    setTestEmailResult("")
    try {
      const res = await fetch("/api/admin/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testEmail }),
      })
      const data = await res.json()
      if (res.ok) {
        setTestEmailResult("测试邮件已发送，请检查收件箱（包括垃圾邮件）")
      } else {
        setTestEmailResult(data.error || "发送失败")
      }
    } catch (err: any) {
      setTestEmailResult(err.message || "请求失败")
    } finally {
      setTestEmailLoading(false)
    }
  }

  // Not logged in
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="mb-6 flex items-center gap-2 text-2xl font-bold text-white">
          <Shield className="h-6 w-6 text-sky-400" />
          <span>后台管理</span>
        </div>
        <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-center">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-amber-400" />
          <h2 className="mb-1 text-lg font-semibold text-white">需要登录</h2>
          <p className="mb-4 text-sm text-zinc-400">请先登录管理员账号</p>
          <button
            onClick={() => router.push("/login")}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-sky-600"
          >
            <LogIn className="h-4 w-4" />
            前往登录
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">后台管理</h1>
          <p className="text-zinc-400">管理产品、库存和查看数据</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-500">{session.user?.email}</span>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            退出
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Package} label="产品数" value={stats.productCount} color="sky" />
          <StatCard icon={Layers} label="卡券总数" value={stats.cardCount} color="violet" />
          <StatCard icon={CreditCard} label="可用库存" value={stats.availableCardCount} color="emerald" />
          <StatCard icon={ShoppingBag} label="订单数" value={stats.orderCount} color="amber" />
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900/50 p-1">
        <button
          onClick={() => setActiveTab("products")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "products" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
          }`}
        >
          <Package className="h-4 w-4" />
          产品管理
        </button>
        <button
          onClick={() => setActiveTab("cards")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "cards" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
          }`}
        >
          <Layers className="h-4 w-4" />
          卡券库存
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "settings" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
          }`}
        >
          <Mail className="h-4 w-4" />
          邮件检测
        </button>
      </div>

      {/* Products Tab */}
      {activeTab === "products" && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">产品列表</h2>
            <button
              onClick={() => {
                setEditingProduct(null)
                setProductForm({ name: "", description: "", price: "", currency: "USD", status: "active" })
                setShowProductForm(!showProductForm)
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-600"
            >
              <Plus className="h-4 w-4" />
              添加产品
            </button>
          </div>

          {(showProductForm || editingProduct) && (
            <form
              onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
              className="mb-6 space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6"
            >
              <h3 className="text-sm font-medium text-zinc-300">
                {editingProduct ? "编辑产品" : "添加产品"}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs text-zinc-400">名称 *</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-zinc-400">价格 *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-zinc-400">描述</label>
                <input
                  type="text"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    checked={productForm.status === "active"}
                    onChange={(e) =>
                      setProductForm({ ...productForm, status: e.target.checked ? "active" : "inactive" })
                    }
                    className="h-4 w-4 rounded border-zinc-600 bg-zinc-800"
                  />
                  上架
                </label>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600"
                >
                  <Save className="h-4 w-4" />
                  {editingProduct ? "保存修改" : "创建"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowProductForm(false); setEditingProduct(null) }}
                  className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
                >
                  <X className="h-4 w-4" />
                  取消
                </button>
              </div>
            </form>
          )}

          <div className="overflow-hidden rounded-2xl border border-zinc-800">
            <table className="w-full text-sm">
              <thead className="bg-zinc-900/80 text-zinc-400">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">名称</th>
                  <th className="px-4 py-3 text-left font-medium">价格</th>
                  <th className="px-4 py-3 text-left font-medium">状态</th>
                  <th className="px-4 py-3 text-right font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-zinc-900/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{product.name}</div>
                      {product.description && (
                        <div className="text-xs text-zinc-500">{product.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">${product.price.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        product.status === "active" ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-500/10 text-zinc-400"
                      }`}>
                        {product.status === "active" ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        {product.status === "active" ? "上架" : "下架"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => startEdit(product)}
                          className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                          title="编辑"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                          title="删除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length === 0 && (
              <div className="py-12 text-center text-zinc-500">
                <Package className="mx-auto mb-2 h-8 w-8" />
                <p>暂无产品</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cards Tab */}
      {activeTab === "cards" && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">卡券库存</h2>
            <button
              onClick={() => setShowCardForm(!showCardForm)}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-600"
            >
              <Plus className="h-4 w-4" />
              批量添加
            </button>
          </div>

          {showCardForm && (
            <form onSubmit={handleAddCards} className="mb-6 space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h3 className="text-sm font-medium text-zinc-300">批量添加卡券</h3>
              <div>
                <label className="mb-1.5 block text-xs text-zinc-400">选择产品 *</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                  required
                >
                  <option value="">请选择产品</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} (${p.price})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-zinc-400">卡券码 *（每行一个）</label>
                <textarea
                  value={cardCodes}
                  onChange={(e) => setCardCodes(e.target.value)}
                  placeholder="XXXX-XXXX-XXXX-XXXX&#10;YYYY-YYYY-YYYY-YYYY"
                  rows={6}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                  required
                />
              </div>
              <div className="flex items-center gap-3">
                <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600">
                  <Save className="h-4 w-4" />
                  添加
                </button>
                <button type="button" onClick={() => setShowCardForm(false)} className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800">
                  <X className="h-4 w-4" />
                  取消
                </button>
              </div>
            </form>
          )}

          <div className="overflow-hidden rounded-2xl border border-zinc-800">
            <table className="w-full text-sm">
              <thead className="bg-zinc-900/80 text-zinc-400">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">卡券码</th>
                  <th className="px-4 py-3 text-left font-medium">产品</th>
                  <th className="px-4 py-3 text-left font-medium">状态</th>
                  <th className="px-4 py-3 text-right font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {cards.map((card) => {
                  const product = products.find((p) => p.id === card.product_id)
                  return (
                    <tr key={card.id} className="hover:bg-zinc-900/50">
                      <td className="px-4 py-3 font-mono text-zinc-300">{card.code}</td>
                      <td className="px-4 py-3 text-zinc-300">{product?.name || "-"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                          card.status === "available" ? "bg-emerald-500/10 text-emerald-400" : card.status === "sold" ? "bg-sky-500/10 text-sky-400" : "bg-zinc-500/10 text-zinc-400"
                        }`}>
                          {card.status === "available" ? "可用" : card.status === "sold" ? "已售" : card.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteCard(card.id)}
                          className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                          title="删除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {cards.length === 0 && (
              <div className="py-12 text-center text-zinc-500">
                <Layers className="mx-auto mb-2 h-8 w-8" />
                <p>暂无卡券</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings / Email Tab */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <Mail className="h-5 w-5 text-sky-400" />
              邮件配置检测
            </h3>

            <div className="space-y-3">
              {emailConfig ? (
                <>
                  <ConfigItem
                    label="RESEND_API_KEY"
                    value={emailConfig.apiKeyConfigured ? "已配置" : "未配置"}
                    ok={emailConfig.apiKeyConfigured}
                  />
                  <ConfigItem
                    label="RESEND_FROM_EMAIL"
                    value={emailConfig.fromEmail || "未配置"}
                    ok={emailConfig.fromEmailConfigured}
                  />
                </>
              ) : (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
                </div>
              )}
            </div>

            <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
              <h4 className="mb-2 text-sm font-medium text-amber-400">排查指南</h4>
              <ul className="list-inside list-decimal space-y-1 text-xs text-amber-300/80">
                <li>确认 .env.local 中配置了 RESEND_API_KEY 和 RESEND_FROM_EMAIL</li>
                <li>Resend 发送邮件需要在 resend.com 验证域名（或使用 @resend.dev 测试域名）</li>
                <li>检查垃圾邮件文件夹</li>
                <li>若 API Key 未配置，系统会跳过邮件发送但订单仍会完成</li>
              </ul>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">发送测试邮件</h3>
            <div className="flex items-center gap-3">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
              />
              <button
                onClick={handleTestEmail}
                disabled={testEmailLoading}
                className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600 disabled:opacity-50"
              >
                {testEmailLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                发送测试
              </button>
            </div>
            {testEmailResult && (
              <p className={`mt-3 text-sm ${testEmailResult.includes("已发送") ? "text-emerald-400" : "text-red-400"}`}>
                {testEmailResult}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number; color: "sky" | "violet" | "emerald" | "amber" }) {
  const colorClasses = {
    sky: "bg-sky-500/10 text-sky-400",
    violet: "bg-violet-500/10 text-violet-400",
    emerald: "bg-emerald-500/10 text-emerald-400",
    amber: "bg-amber-500/10 text-amber-400",
  }
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="mb-3 flex items-center gap-3">
        <div className={`rounded-lg p-2 ${colorClasses[color]}`}><Icon className="h-5 w-5" /></div>
        <span className="text-sm text-zinc-400">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
    </div>
  )
}

function ConfigItem({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-zinc-950 px-4 py-3">
      <span className="text-sm text-zinc-400">{label}</span>
      <span className={`inline-flex items-center gap-1 text-sm font-medium ${ok ? "text-emerald-400" : "text-red-400"}`}>
        {ok ? <Check className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
        {value}
      </span>
    </div>
  )
}
