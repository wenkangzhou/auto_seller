import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase"
import { verifyWebhookSignature } from "@/lib/lemonsqueezy"
import { sendCardEmail } from "@/lib/email"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const payload = await req.text()
    const signature = req.headers.get("x-signature") || ""

    // Verify webhook signature
    if (!verifyWebhookSignature(payload, signature)) {
      console.error("Invalid webhook signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = JSON.parse(payload)
    const eventName = event.meta?.event_name

    console.log(`Received Lemon Squeezy webhook: ${eventName}`)

    // We only care about order_paid events
    if (eventName !== "order_paid") {
      return NextResponse.json({ received: true })
    }

    // Extract custom data from the webhook
    const customData = event.meta?.custom_data || {}
    const orderId = customData.order_id
    const productId = customData.product_id
    const email = customData.email
    const lsOrderId = event.data?.id

    if (!orderId || !productId || !email) {
      console.error("Missing custom data in webhook", customData)
      return NextResponse.json({ error: "Missing custom data" }, { status: 400 })
    }

    const supabase = supabaseServer()

    // Check if order already processed (idempotency)
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("status")
      .eq("id", orderId)
      .single()

    if (!existingOrder) {
      console.error("Order not found:", orderId)
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (existingOrder.status === "paid") {
      console.log("Order already processed:", orderId)
      return NextResponse.json({ received: true })
    }

    // Get product info
    const { data: product } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single()

    if (!product) {
      console.error("Product not found:", productId)
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
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
      console.error("No available card for product:", productId)
      // Mark order as failed with reason
      await supabase
        .from("orders")
        .update({
          status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
      return NextResponse.json({ error: "No available card" }, { status: 400 })
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
      return NextResponse.json({ error: "创建订单项失败" }, { status: 500 })
    }

    // Mark card as sold
    await supabase
      .from("cards")
      .update({
        status: "sold",
        order_id: orderId,
        sold_at: new Date().toISOString(),
      })
      .eq("id", card.id)

    // Update order to paid
    await supabase
      .from("orders")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        lemonsqueezy_order_id: lsOrderId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)

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
    }

    console.log(`Order ${orderId} processed successfully`)
    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error("Webhook error:", err)
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    )
  }
}
