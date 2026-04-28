import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = supabaseServer()
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "获取产品列表失败" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, description, price, currency = "USD", image_url, status = "active" } = body

    if (!name || price === undefined) {
      return NextResponse.json({ error: "名称和价格为必填项" }, { status: 400 })
    }

    const supabase = supabaseServer()
    const { data, error } = await supabase
      .from("products")
      .insert({ name, description, price, currency, image_url, status })
      .select()
      .single()

    if (error) {
      console.error("Create product error:", error)
      return NextResponse.json({ error: "创建产品失败" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: "缺少产品ID" }, { status: 400 })
    }

    const supabase = supabaseServer()
    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "更新产品失败" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "缺少产品ID" }, { status: 400 })
    }

    const supabase = supabaseServer()
    const { error } = await supabase.from("products").delete().eq("id", id)

    if (error) {
      return NextResponse.json({ error: "删除产品失败" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}
