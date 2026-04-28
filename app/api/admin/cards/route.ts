import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get("productId")

    const supabase = supabaseServer()
    let query = supabase
      .from("cards")
      .select("*")
      .order("created_at", { ascending: false })

    if (productId) {
      query = query.eq("product_id", productId)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: "获取卡券列表失败" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { productId, codes } = body

    if (!productId || !codes || !Array.isArray(codes) || codes.length === 0) {
      return NextResponse.json({ error: "请选择产品并提供卡券码" }, { status: 400 })
    }

    const cards = codes.map((code: string) => ({
      product_id: productId,
      code: code.trim(),
      status: "available",
    })).filter((c: { code: string }) => c.code.length > 0)

    if (cards.length === 0) {
      return NextResponse.json({ error: "没有有效的卡券码" }, { status: 400 })
    }

    const supabase = supabaseServer()
    const { data, error } = await supabase
      .from("cards")
      .insert(cards)
      .select()

    if (error) {
      console.error("Create cards error:", error)
      return NextResponse.json({ error: "添加卡券失败" }, { status: 500 })
    }

    return NextResponse.json({ count: data?.length || 0 })
  } catch (err) {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "缺少卡券ID" }, { status: 400 })
    }

    const supabase = supabaseServer()
    const { error } = await supabase.from("cards").delete().eq("id", id)

    if (error) {
      return NextResponse.json({ error: "删除卡券失败" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}
