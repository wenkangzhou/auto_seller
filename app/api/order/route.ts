import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"
import { sendCardEmail } from "@/lib/email"

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

    // Find available card
    const { data: card, error: cardError } = await supabase
      .from("cards")
      .select("*")
      .eq("product_id", productId)
      .eq("status", "available")
      .limit(1)
      .single()

    if (cardError || !card) {
      return NextResponse.json({ error: "该商品暂时缺货" }, { status: 400 })
    }

    const orderId = uuidv4()

    // Create order
    const { error: orderError } = await supabase.from("orders").insert({
      id: orderId,
      email,
      total_amount: product.price,
      currency: product.currency,
      status: "paid",
      paid_at: new Date().toISOString(),
    })

    if (orderError) {
      console.error("Order creation error:", orderError)
      return NextResponse.json({ error: "创建订单失败" }, { status: 500 })
    }

    // Create order item
    const { error: itemError } = await supabase.from("order_items").insert({
      order_id: orderId,
      product_id: productId,
      product_name: product.name,
      price: product.price,
      card_id: card.id,
      card_code: card.code,
    })

    if (itemError) {
      console.error("Order item creation error:", itemError)
      // Rollback order
      await supabase.from("orders").delete().eq("id", orderId)
      return NextResponse.json({ error: "创建订单失败" }, { status: 500 })
    }

    // Mark card as sold
    const { error: updateCardError } = await supabase
      .from("cards")
      .update({
        status: "sold",
        order_id: orderId,
        sold_at: new Date().toISOString(),
      })
      .eq("id", card.id)

    if (updateCardError) {
      console.error("Card update error:", updateCardError)
    }

    // Increment product sold_count
    const { error: soldCountError } = await supabase.rpc("increment_sold_count", {
      product_id: productId,
    })
    if (soldCountError) {
      console.error("Sold count increment error:", soldCountError)
    }

    // Send email
    try {
      await sendCardEmail({
        to: email,
        orderId,
        productName: product.name,
        cardCode: card.code,
        price: product.price,
      })
    } catch (emailErr) {
      console.error("Email send error:", emailErr)
      // Don't fail the order if email fails, but log it
    }

    return NextResponse.json({ orderId })
  } catch (err: any) {
    console.error("Order API error:", err)
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}
