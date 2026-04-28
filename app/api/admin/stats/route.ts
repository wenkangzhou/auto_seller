import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = supabaseServer()
    const [
      { count: productCount },
      { count: cardCount },
      { count: availableCardCount },
      { count: orderCount },
      { data: revenueData },
    ] = await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("cards").select("*", { count: "exact", head: true }),
      supabase.from("cards").select("*", { count: "exact", head: true }).eq("status", "available"),
      supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "paid"),
      supabase.from("orders").select("total_amount").eq("status", "paid"),
    ])

    const totalRevenue = revenueData?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0

    return NextResponse.json({
      productCount: productCount || 0,
      cardCount: cardCount || 0,
      availableCardCount: availableCardCount || 0,
      orderCount: orderCount || 0,
      totalRevenue,
    })
  } catch (err) {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}
