import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "请输入有效的邮箱地址" }, { status: 400 })
    }

    const supabase = supabaseServer()

    // Get all orders for this email
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .eq("email", email)
      .order("created_at", { ascending: false })

    if (ordersError) {
      return NextResponse.json({ error: "查询订单失败" }, { status: 500 })
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({ error: "未找到该邮箱的订单" }, { status: 404 })
    }

    // Get order items for all orders
    const orderIds = orders.map((o) => o.id)
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("*")
      .in("order_id", orderIds)

    if (itemsError) {
      return NextResponse.json({ error: "查询订单详情失败" }, { status: 500 })
    }

    // Group items by order
    const ordersWithItems = orders.map((order) => ({
      ...order,
      items: (items || []).filter((item) => item.order_id === order.id),
    }))

    return NextResponse.json({ orders: ordersWithItems })
  } catch (err: any) {
    console.error("Query API error:", err)
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}
