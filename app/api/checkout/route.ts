import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase"
import { createLemonSqueezyCheckout } from "@/lib/lemonsqueezy"
import { v4 as uuidv4 } from "uuid"

export async function POST(req: NextRequest) {
  try {
    const { productId, email } = await req.json()

    if (!productId || !email) {
      return NextResponse.json({ error: "缺少必要参数" }, { status: 400 })
    }

    const supabase = supabaseServer()

    // Get product info
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .eq("status", "active")
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: "商品不存在或已下架" }, { status: 404 })
    }

    // Check if there's a lemonsqueezy_variant_id configured
    if (!product.lemonsqueezy_variant_id) {
      return NextResponse.json(
        { error: "该商品尚未配置支付，请联系管理员" },
        { status: 400 }
      )
    }

    // Check available stock
    const { count: stock, error: stockError } = await supabase
      .from("cards")
      .select("*", { count: "exact", head: true })
      .eq("product_id", productId)
      .eq("status", "available")

    if (stockError || !stock || stock === 0) {
      return NextResponse.json({ error: "该商品暂时缺货" }, { status: 400 })
    }

    const orderId = uuidv4()

    // Create pending order
    const { error: orderError } = await supabase.from("orders").insert({
      id: orderId,
      email,
      total_amount: product.price,
      currency: product.currency || "USD",
      status: "pending",
    })

    if (orderError) {
      console.error("Order creation error:", orderError)
      return NextResponse.json({ error: "创建订单失败" }, { status: 500 })
    }

    // Create Lemon Squeezy checkout
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    const checkout = await createLemonSqueezyCheckout({
      variantId: product.lemonsqueezy_variant_id,
      email,
      customData: {
        order_id: orderId,
        product_id: productId,
        email,
      },
      redirectUrl: `${appUrl}/success?orderId=${orderId}&email=${encodeURIComponent(email)}`,
    })

    const checkoutUrl = (checkout.data as any)?.attributes?.url
    const lsCheckoutId = (checkout.data as any)?.id

    if (!checkoutUrl) {
      // Rollback order
      await supabase.from("orders").delete().eq("id", orderId)
      return NextResponse.json({ error: "创建支付链接失败" }, { status: 500 })
    }

    // Save LS checkout ID to order
    await supabase
      .from("orders")
      .update({ lemonsqueezy_checkout_id: lsCheckoutId })
      .eq("id", orderId)

    return NextResponse.json({ orderId, checkoutUrl })
  } catch (err: any) {
    console.error("Checkout API error:", err)
    return NextResponse.json(
      { error: err.message || "服务器错误" },
      { status: 500 }
    )
  }
}
