import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  try {
    const { orderId, email } = await req.json()

    if (!orderId || !email) {
      return NextResponse.json({ error: "请提供订单号和邮箱" }, { status: 400 })
    }

    const supabase = supabaseServer()

    // Get order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("email", email)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: "未找到订单，请检查订单号和邮箱" }, { status: 404 })
    }

    // Get order items
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId)

    if (itemsError) {
      return NextResponse.json({ error: "查询订单详情失败" }, { status: 500 })
    }

    return NextResponse.json({ order, items: items || [] })
  } catch (err: any) {
    console.error("Query API error:", err)
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}
